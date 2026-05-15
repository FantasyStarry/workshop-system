package com.workshop.module.production.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.workshop.common.exception.BusinessException;
import com.workshop.common.utils.CodeGenerator;
import com.workshop.module.order.entity.Order;
import com.workshop.module.order.entity.OrderItem;
import com.workshop.module.order.mapper.OrderItemMapper;
import com.workshop.module.order.mapper.OrderMapper;
import com.workshop.module.production.dto.ProductionRecordDetailDTO;
import com.workshop.module.production.dto.RecordPageDTO;
import com.workshop.module.production.dto.ScanReportDTO;
import com.workshop.module.production.entity.ProductionRecord;
import com.workshop.module.production.entity.ProductionStage;
import com.workshop.module.production.entity.QrCode;
import com.workshop.module.production.mapper.ProductionRecordMapper;
import com.workshop.module.production.mapper.ProductionStageMapper;
import com.workshop.module.production.mapper.QrCodeMapper;
import com.workshop.module.production.service.ProductionRecordService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ProductionRecordServiceImpl implements ProductionRecordService {

    @Autowired
    private ProductionRecordMapper productionRecordMapper;

    @Autowired
    private QrCodeMapper qrCodeMapper;

    @Autowired
    private OrderItemMapper orderItemMapper;

    @Autowired
    private OrderMapper orderMapper;

    @Autowired
    private ProductionStageMapper productionStageMapper;

    @Autowired
    private CodeGenerator codeGenerator;

    @Override
    @Transactional
    public ProductionRecord scan(ScanReportDTO dto, Long operatorId) {
        // 1. Query QrCode by qrContent
        QrCode qrCode = qrCodeMapper.selectOne(
                new LambdaQueryWrapper<QrCode>().eq(QrCode::getQrContent, dto.getQrContent())
        );
        if (qrCode == null) {
            throw new BusinessException(404, "二维码不存在");
        }

        // 2. Validate QrCode status is IN_PRODUCTION
        // Allow IN_PRODUCTION (1) or PENDING (0) to start production
        if (qrCode.getStatus() == 2) {
            throw new BusinessException(400, "该产品已完成生产，不能重复上报");
        }
        if (qrCode.getStatus() == 3) {
            throw new BusinessException(400, "该产品已报废，不能上报");
        }

        // 3. Query ProductionStage by stageId
        ProductionStage stage = productionStageMapper.selectById(dto.getStageId());
        if (stage == null || stage.getStatus() == 0) {
            throw new BusinessException(404, "生产环节不存在或已停用");
        }

        // 4. Validate stage sequence (no skipping)
        // Query the max reported stage for this QrCode
        List<ProductionRecord> existingRecords = productionRecordMapper.selectList(
                new LambdaQueryWrapper<ProductionRecord>()
                        .eq(ProductionRecord::getQrCodeId, qrCode.getId())
                        .orderByDesc(ProductionRecord::getCreatedAt)
                        .last("LIMIT 1")
        );

        if (!existingRecords.isEmpty()) {
            ProductionRecord lastRecord = existingRecords.get(0);
            ProductionStage lastStage = productionStageMapper.selectById(lastRecord.getStageId());
            if (lastStage != null && stage.getStageSeq() <= lastStage.getStageSeq() + 1) {
                // Allow: same stage re-scan (stageSeq equal) or next stage (stageSeq = lastStageSeq + 1)
                // But actually we should check for duplicates first
            }
            // Block skipping: stageSeq must be <= lastStageSeq + 1
            if (lastStage != null && stage.getStageSeq() > lastStage.getStageSeq() + 1) {
                throw new BusinessException(400, "不允许跳过生产环节，当前最大环节序号为 " + lastStage.getStageSeq()
                        + "(" + lastStage.getStageName() + ")，不能直接上报序号 " + stage.getStageSeq()
                        + "(" + lastStage.getStageName() + ")");
            }
        } else {
            // First scan: must be the first stage (stageSeq = 1)
            // Query min stageSeq
            List<ProductionStage> allStages = productionStageMapper.selectList(
                    new LambdaQueryWrapper<ProductionStage>()
                            .eq(ProductionStage::getStatus, 1)
                            .orderByAsc(ProductionStage::getStageSeq)
                            .last("LIMIT 1")
            );
            if (!allStages.isEmpty() && stage.getStageSeq() > allStages.get(0).getStageSeq()) {
                throw new BusinessException(400, "首次扫码必须从第一个环节(" + allStages.get(0).getStageName() + ")开始");
            }
        }

        // 5. Idempotency: same qr_code_id + stage_id cannot be reported twice
        Long duplicateCount = productionRecordMapper.selectCount(
                new LambdaQueryWrapper<ProductionRecord>()
                        .eq(ProductionRecord::getQrCodeId, qrCode.getId())
                        .eq(ProductionRecord::getStageId, dto.getStageId())
        );
        if (duplicateCount > 0) {
            throw new BusinessException(400, "该产品在当前环节已上报，不能重复扫码");
        }

        // 6. Generate recordNo
        String recordNo = codeGenerator.generateRecordNo();

        // 7. Create ProductionRecord
        ProductionRecord record = new ProductionRecord();
        record.setRecordNo(recordNo);
        record.setQrCodeId(qrCode.getId());
        record.setOrderItemId(qrCode.getOrderItemId());
        record.setStageId(dto.getStageId());
        record.setOperatorId(operatorId);
        record.setScanTime(LocalDateTime.now());
        record.setLocation(dto.getLocation());
        record.setTemperature(dto.getTemperature());
        record.setHumidity(dto.getHumidity());
        record.setPhotoUrl(dto.getPhotoUrl());
        record.setQcResult(null); // Not checked - set to null instead of 0

        productionRecordMapper.insert(record);

        // 8. Update QrCode.currentStageId
        qrCode.setCurrentStageId(dto.getStageId());

        // Set status to IN_PRODUCTION if it was PENDING
        if (qrCode.getStatus() == 0) {
            qrCode.setStatus(1); // IN_PRODUCTION
        }

        // 9. Check if this is the last stage (max stageSeq)
        List<ProductionStage> allStages = productionStageMapper.selectList(
                new LambdaQueryWrapper<ProductionStage>()
                        .eq(ProductionStage::getStatus, 1)
                        .orderByDesc(ProductionStage::getStageSeq)
                        .last("LIMIT 1")
        );
        if (!allStages.isEmpty() && stage.getStageSeq().equals(allStages.get(0).getStageSeq())) {
            // This is the final stage
            qrCode.setStatus(2); // COMPLETED
        }

        qrCodeMapper.updateById(qrCode);

        // 10. Check if ALL QrCodes of this order are completed
        OrderItem orderItem = orderItemMapper.selectById(qrCode.getOrderItemId());
        if (orderItem != null) {
            List<QrCode> allQrCodes = qrCodeMapper.selectList(
                    new LambdaQueryWrapper<QrCode>().eq(QrCode::getOrderItemId, qrCode.getOrderItemId())
            );

            boolean allCompleted = allQrCodes.stream()
                    .allMatch(qc -> qc.getStatus() == 2);

            if (allCompleted) {
                // Update orderItem production status
                orderItem.setProductionStatus(2); // COMPLETED
                orderItemMapper.updateById(orderItem);

                // Check all orderItems of this order
                List<OrderItem> allOrderItems = orderItemMapper.selectList(
                        new LambdaQueryWrapper<OrderItem>().eq(OrderItem::getOrderId, orderItem.getOrderId())
                );

                boolean orderAllCompleted = allOrderItems.stream()
                        .allMatch(oi -> oi.getProductionStatus() == 2);

                if (orderAllCompleted) {
                    Order order = orderMapper.selectById(orderItem.getOrderId());
                    if (order != null && order.getStatus() != 3) { // Not cancelled
                        order.setStatus(2); // COMPLETED
                        orderMapper.updateById(order);
                    }
                }
            }
        }

        return record;
    }

    @Override
    public Page<ProductionRecord> pageQuery(Page<ProductionRecord> page, RecordPageDTO dto) {
        long offset = (page.getCurrent() - 1) * page.getSize();
        List<ProductionRecord> records = productionRecordMapper.pageQuery(
                offset, page.getSize(), dto.getQrCodeId(), dto.getOrderId(),
                dto.getStageId(), dto.getOperatorId(), dto.getStartDate(), dto.getEndDate());
        long total = productionRecordMapper.countQuery(
                dto.getQrCodeId(), dto.getOrderId(), dto.getStageId(), dto.getOperatorId(),
                dto.getStartDate(), dto.getEndDate());
        page.setRecords(records);
        page.setTotal(total);
        return page;
    }

    @Override
    public List<ProductionRecordDetailDTO> getLifecycleRecords(Long qrCodeId) {
        return productionRecordMapper.selectDetailByQrCodeId(qrCodeId);
    }

    @Override
    public List<ProductionRecordDetailDTO> getByOrderId(Long orderId) {
        return productionRecordMapper.selectDetailByOrderId(orderId);
    }

    @Override
    public void updateQc(Long id, Integer qcResult, Long qcUserId, String qcRemark) {
        ProductionRecord record = productionRecordMapper.selectById(id);
        if (record == null) {
            throw new BusinessException(404, "生产记录不存在");
        }

        record.setQcResult(qcResult);
        record.setQcUserId(qcUserId);
        record.setQcTime(LocalDateTime.now());
        record.setQcRemark(qcRemark);
        productionRecordMapper.updateById(record);
    }
}
