package com.workshop.module.production.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.workshop.common.exception.BusinessException;
import com.workshop.common.utils.QrCodeUtils;
import com.workshop.module.order.entity.Order;
import com.workshop.module.order.entity.OrderItem;
import com.workshop.module.order.mapper.OrderItemMapper;
import com.workshop.module.order.mapper.OrderMapper;
import com.workshop.module.product.entity.Product;
import com.workshop.module.product.mapper.ProductMapper;
import com.workshop.module.production.dto.QrCodeDecodeResultDTO;
import com.workshop.module.production.dto.QrCodeDetailDTO;
import com.workshop.module.production.dto.QrCodeGenerateDTO;
import com.workshop.module.production.entity.ProductionRecord;
import com.workshop.module.production.entity.ProductionStage;
import com.workshop.module.production.entity.QrCode;
import com.workshop.module.production.mapper.ProductionRecordMapper;
import com.workshop.module.production.mapper.ProductionStageMapper;
import com.workshop.module.production.mapper.QrCodeMapper;
import com.workshop.module.production.service.QrCodeService;
import com.workshop.module.sys.entity.SysUser;
import com.workshop.module.sys.mapper.SysUserMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import org.apache.ibatis.session.ExecutorType;
import org.apache.ibatis.session.SqlSession;
import org.mybatis.spring.SqlSessionTemplate;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class QrCodeServiceImpl implements QrCodeService {

    @Autowired
    private QrCodeMapper qrCodeMapper;

    @Autowired
    private OrderItemMapper orderItemMapper;

    @Autowired
    private OrderMapper orderMapper;

    @Autowired
    private ProductMapper productMapper;

    @Autowired
    private ProductionStageMapper productionStageMapper;

    @Autowired
    private ProductionRecordMapper productionRecordMapper;

    @Autowired
    private SysUserMapper sysUserMapper;

    @Autowired
    private QrCodeUtils qrCodeUtils;

    @Autowired
    private SqlSessionTemplate sqlSessionTemplate;

    @Override
    @Transactional
    public List<QrCode> generate(QrCodeGenerateDTO dto, Long userId) {
        OrderItem orderItem = orderItemMapper.selectById(dto.getOrderItemId());
        if (orderItem == null) {
            throw new BusinessException(404, "订单明细不存在");
        }

        Order order = orderMapper.selectById(orderItem.getOrderId());
        if (order == null) {
            throw new BusinessException(404, "订单不存在");
        }

        Product product = productMapper.selectById(orderItem.getProductId());
        if (product == null) {
            throw new BusinessException(404, "产品不存在");
        }

        LambdaQueryWrapper<QrCode> existsWrapper = new LambdaQueryWrapper<>();
        existsWrapper.eq(QrCode::getOrderItemId, dto.getOrderItemId());
        long count = qrCodeMapper.selectCount(existsWrapper);
        if (count > 0) {
            throw new BusinessException(400, "该订单产品已生成过二维码，不能重复生成");
        }

        List<QrCode> result = new ArrayList<>();
        int fixedQuantity = orderItem.getQuantity() != null ? orderItem.getQuantity() : 1;
        for (int i = 0; i < fixedQuantity; i++) {
            Integer maxSerialNo = getMaxSerialNo(dto.getOrderItemId());
            int serialNo = maxSerialNo + 1;

            String qrContent = qrCodeUtils.generateQrContent(order.getOrderNo(), product.getProductCode(), serialNo);
            String qrImagePath = qrCodeUtils.generateQrCode(qrContent);

            QrCode qrCode = new QrCode();
            qrCode.setQrContent(qrContent);
            qrCode.setOrderItemId(dto.getOrderItemId());
            qrCode.setProductId(orderItem.getProductId());
            qrCode.setSerialNo(String.format("%04d", serialNo));
            qrCode.setQrImagePath(qrImagePath);
            qrCode.setStatus(0);
            qrCode.setGeneratedBy(userId);
            qrCode.setGeneratedAt(LocalDateTime.now());

            result.add(qrCode);
        }

        // 批量插入
        if (!result.isEmpty()) {
            SqlSession sqlSession = sqlSessionTemplate.getSqlSessionFactory().openSession(ExecutorType.BATCH);
            try {
                QrCodeMapper batchMapper = sqlSession.getMapper(QrCodeMapper.class);
                for (QrCode qr : result) {
                    batchMapper.insert(qr);
                }
                sqlSession.commit();
            } finally {
                sqlSession.close();
            }
        }

        orderItem.setProductionStatus(1);
        orderItemMapper.updateById(orderItem);

        order.setStatus(1);
        orderMapper.updateById(order);

        return result;
    }

    private Integer getMaxSerialNo(Long orderItemId) {
        LambdaQueryWrapper<QrCode> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(QrCode::getOrderItemId, orderItemId)
                .orderByDesc(QrCode::getSerialNo)
                .last("LIMIT 1");
        QrCode last = qrCodeMapper.selectOne(wrapper);
        if (last != null && last.getSerialNo() != null) {
            try {
                return Integer.parseInt(last.getSerialNo());
            } catch (NumberFormatException e) {
                return 0;
            }
        }
        return 0;
    }

    @Override
    public Page<QrCode> pageQuery(Page<QrCode> page, Long orderId, Long orderItemId, Long productId, Integer status) {
        long offset = (page.getCurrent() - 1) * page.getSize();
        List<QrCode> records = qrCodeMapper.pageQuery(offset, page.getSize(), orderId, orderItemId, productId, status);
        long total = qrCodeMapper.countQuery(orderId, orderItemId, productId, status);
        page.setRecords(records);
        page.setTotal(total);
        return page;
    }

    @Override
    public QrCode getById(Long id) {
        QrCode qrCode = qrCodeMapper.selectById(id);
        if (qrCode == null) {
            throw new BusinessException(404, "二维码不存在");
        }
        return qrCode;
    }

    @Override
    public QrCodeDecodeResultDTO decode(String qrContent) {
        QrCode qrCode = qrCodeMapper.selectOne(
                new LambdaQueryWrapper<QrCode>().eq(QrCode::getQrContent, qrContent)
        );
        if (qrCode == null) {
            throw new BusinessException(404, "二维码不存在");
        }

        OrderItem orderItem = orderItemMapper.selectById(qrCode.getOrderItemId());
        Product product = productMapper.selectById(qrCode.getProductId());

        QrCodeDecodeResultDTO result = new QrCodeDecodeResultDTO();
        result.setQrCodeId(String.valueOf(qrCode.getId()));
        result.setQrContent(qrCode.getQrContent());
        result.setProductId(String.valueOf(product != null ? product.getId() : null));
        result.setProductName(product != null ? product.getProductName() : null);

        if (orderItem != null) {
            result.setOrderId(String.valueOf(orderItem.getOrderId()));
            Order order = orderMapper.selectById(orderItem.getOrderId());
            result.setOrderNo(order != null ? order.getOrderNo() : null);
        }

        if (qrCode.getCurrentStageId() != null) {
            ProductionStage stage = productionStageMapper.selectById(qrCode.getCurrentStageId());
            result.setCurrentStageId(String.valueOf(stage != null ? stage.getId() : null));
            result.setCurrentStageName(stage != null ? stage.getStageName() : null);
        }

        result.setStatus(qrCode.getStatus());
        return result;
    }

    @Override
    public QrCode getByContent(String qrContent) {
        return qrCodeMapper.selectOne(
                new LambdaQueryWrapper<QrCode>().eq(QrCode::getQrContent, qrContent)
        );
    }

    @Override
    public void updateStageAndStatus(Long qrCodeId, Long stageId, Integer status) {
        QrCode qrCode = qrCodeMapper.selectById(qrCodeId);
        if (qrCode != null) {
            qrCode.setCurrentStageId(stageId);
            qrCode.setStatus(status);
            qrCodeMapper.updateById(qrCode);
        }
    }

    @Override
    public List<QrCodeDetailDTO> getDetailList(Long orderId) {
        List<OrderItem> orderItems = orderItemMapper.selectList(
                new LambdaQueryWrapper<OrderItem>().eq(OrderItem::getOrderId, orderId)
        );
        
        List<Long> itemIds = orderItems.stream().map(OrderItem::getId).toList();
        if (itemIds.isEmpty()) {
            return List.of();
        }

        List<QrCode> qrCodes = qrCodeMapper.selectList(
                new LambdaQueryWrapper<QrCode>().in(QrCode::getOrderItemId, itemIds)
        );

        List<ProductionStage> allStages = productionStageMapper.selectList(
                new LambdaQueryWrapper<ProductionStage>().eq(ProductionStage::getStatus, 1)
        );
        int totalStages = allStages.size();

        return qrCodes.stream().map(qrCode -> {
            QrCodeDetailDTO dto = new QrCodeDetailDTO();
            dto.setId(qrCode.getId());
            dto.setQrContent(qrCode.getQrContent());
            dto.setSerialNo(qrCode.getSerialNo());
            dto.setBatchNo(qrCode.getBatchNo());
            dto.setStatus(qrCode.getStatus());
            dto.setStatusText(mapStatus(qrCode.getStatus()));
            dto.setGeneratedAt(qrCode.getGeneratedAt());

            Product product = productMapper.selectById(qrCode.getProductId());
            if (product != null) {
                dto.setProductId(product.getId());
                dto.setProductName(product.getProductName());
                dto.setProductCode(product.getProductCode());
            }

            if (qrCode.getCurrentStageId() != null) {
                ProductionStage stage = productionStageMapper.selectById(qrCode.getCurrentStageId());
                if (stage != null) {
                    dto.setCurrentStageId(stage.getId());
                    dto.setCurrentStageName(stage.getStageName());
                    dto.setCurrentStageSeq(stage.getStageSeq());
                    dto.setTotalStages(totalStages);
                    dto.setCompletedStages(stage.getStageSeq());
                    dto.setProgressPercent(totalStages > 0 ? (stage.getStageSeq() * 100 / totalStages) : 0);
                }
            } else {
                dto.setTotalStages(totalStages);
                dto.setCompletedStages(0);
                dto.setProgressPercent(0);
            }

            List<ProductionRecord> records = productionRecordMapper.selectList(
                    new LambdaQueryWrapper<ProductionRecord>()
                            .eq(ProductionRecord::getQrCodeId, qrCode.getId())
                            .orderByDesc(ProductionRecord::getCreatedAt)
                            .last("LIMIT 1")
            );
            if (!records.isEmpty()) {
                ProductionRecord lastRecord = records.get(0);
                dto.setLastScanTime(lastRecord.getScanTime());
                dto.setLastLocation(lastRecord.getLocation());
                
                if (lastRecord.getOperatorId() != null) {
                    SysUser operator = sysUserMapper.selectById(lastRecord.getOperatorId());
                    if (operator != null) {
                        dto.setLastOperator(operator.getUsername());
                        dto.setLastOperatorName(operator.getRealName());
                    }
                }
            }

            if (qrCode.getGeneratedBy() != null) {
                SysUser generator = sysUserMapper.selectById(qrCode.getGeneratedBy());
                if (generator != null) {
                    dto.setGeneratedByName(generator.getRealName());
                }
            }

            dto.setScrapReason(qrCode.getScrapReason());
            return dto;
        }).toList();
    }

    private String mapStatus(Integer status) {
        return switch (status) {
            case 0 -> "待生产";
            case 1 -> "生产中";
            case 2 -> "已完成";
            case 3 -> "已作废";
            default -> "未知";
        };
    }
}