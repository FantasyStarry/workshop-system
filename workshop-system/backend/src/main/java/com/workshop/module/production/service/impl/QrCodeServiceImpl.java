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
import com.workshop.module.production.dto.QrCodeGenerateDTO;
import com.workshop.module.production.entity.ProductionStage;
import com.workshop.module.production.entity.QrCode;
import com.workshop.module.production.mapper.ProductionStageMapper;
import com.workshop.module.production.mapper.QrCodeMapper;
import com.workshop.module.production.service.QrCodeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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
    private QrCodeUtils qrCodeUtils;

    @Override
    @Transactional
    public List<QrCode> generate(QrCodeGenerateDTO dto, Long userId) {
        // 1. Query orderItem and related order + product
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

        // 2. Check if QR code already generated for this order
        LambdaQueryWrapper<QrCode> existsWrapper = new LambdaQueryWrapper<>();
        existsWrapper.eq(QrCode::getOrderItemId, dto.getOrderItemId());
        long count = qrCodeMapper.selectCount(existsWrapper);
        if (count > 0) {
            throw new BusinessException(400, "该订单产品已生成过二维码，不能重复生成");
        }

        // 3. Generate QR codes based on orderItem quantity (fixed quantity)
        List<QrCode> result = new ArrayList<>();
        int fixedQuantity = orderItem.getQuantity() != null ? orderItem.getQuantity() : 1;
        for (int i = 0; i < fixedQuantity; i++) {
            // a. Generate serial number (query max serial_no for same orderItemId + current time window)
            Integer maxSerialNo = getMaxSerialNo(dto.getOrderItemId());
            int serialNo = maxSerialNo + 1;

            // b. Generate qrContent
            String qrContent = qrCodeUtils.generateQrContent(order.getOrderNo(), product.getProductCode(), serialNo);

            // c. Generate QR code image
            String qrImagePath = qrCodeUtils.generateQrCode(qrContent);

            // d. Save QrCode record
            QrCode qrCode = new QrCode();
            qrCode.setQrContent(qrContent);
            qrCode.setOrderItemId(dto.getOrderItemId());
            qrCode.setProductId(orderItem.getProductId());
            qrCode.setSerialNo(String.format("%04d", serialNo));
            qrCode.setQrImagePath(qrImagePath);
            qrCode.setStatus(0); // PENDING
            qrCode.setGeneratedBy(userId);
            qrCode.setGeneratedAt(LocalDateTime.now());

            qrCodeMapper.insert(qrCode);
            result.add(qrCode);
        }

        // 4. Update orderItem.productionStatus to IN_PRODUCTION
        orderItem.setProductionStatus(1); // IN_PRODUCTION
        orderItemMapper.updateById(orderItem);

        // 5. Update order.status to IN_PRODUCTION
        order.setStatus(1); // IN_PRODUCTION
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
        // 1. Query QrCode by content
        QrCode qrCode = qrCodeMapper.selectOne(
                new LambdaQueryWrapper<QrCode>().eq(QrCode::getQrContent, qrContent)
        );
        if (qrCode == null) {
            throw new BusinessException(404, "二维码不存在");
        }

        // 2. Query related information
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
}
