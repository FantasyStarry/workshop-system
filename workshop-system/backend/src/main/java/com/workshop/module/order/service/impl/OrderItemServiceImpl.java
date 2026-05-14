package com.workshop.module.order.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.workshop.common.exception.BusinessException;
import com.workshop.module.order.dto.OrderItemResponseDTO;
import com.workshop.module.order.entity.OrderItem;
import com.workshop.module.order.mapper.OrderItemMapper;
import com.workshop.module.order.service.OrderItemService;
import com.workshop.module.product.entity.Product;
import com.workshop.module.product.mapper.ProductMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class OrderItemServiceImpl implements OrderItemService {

    @Autowired
    private OrderItemMapper orderItemMapper;

    @Autowired
    private ProductMapper productMapper;

    @Override
    public List<OrderItem> getByOrderId(Long orderId) {
        return orderItemMapper.selectList(
                new LambdaQueryWrapper<OrderItem>()
                        .eq(OrderItem::getOrderId, orderId)
                        .orderByAsc(OrderItem::getSortOrder, OrderItem::getId)
        );
    }

    public List<OrderItemResponseDTO> getWithProductInfo(Long orderId) {
        List<OrderItem> items = getByOrderId(orderId);
        if (items.isEmpty()) {
            return List.of();
        }

        List<Long> productIds = items.stream()
                .map(OrderItem::getProductId)
                .distinct()
                .collect(Collectors.toList());

        Map<Long, Product> productMap = productMapper.selectBatchIds(productIds).stream()
                .collect(Collectors.toMap(Product::getId, p -> p));

        return items.stream().map(item -> {
            OrderItemResponseDTO dto = new OrderItemResponseDTO();
            dto.setId(item.getId());
            dto.setOrderId(item.getOrderId());
            dto.setProductId(item.getProductId());
            dto.setQuantity(item.getQuantity());
            dto.setUnitPrice(item.getUnitPrice());
            dto.setSubtotal(item.getSubtotal());
            dto.setProductionStatus(item.getProductionStatus());
            dto.setSortOrder(item.getSortOrder());
            dto.setRemark(item.getRemark());

            Product product = productMap.get(item.getProductId());
            if (product != null) {
                dto.setProductName(product.getProductName());
                dto.setProductCode(product.getProductCode());
                dto.setSpecification(product.getSpecification());
                dto.setProductType(product.getProductType());
            }
            return dto;
        }).collect(Collectors.toList());
    }

    @Override
    public void create(OrderItem item) {
        if (item.getUnitPrice() != null && item.getQuantity() != null) {
            item.setSubtotal(item.getUnitPrice().multiply(BigDecimal.valueOf(item.getQuantity())));
        }
        item.setProductionStatus(0);
        orderItemMapper.insert(item);
    }

    @Override
    public void update(OrderItem item) {
        OrderItem existing = orderItemMapper.selectById(item.getId());
        if (existing == null) {
            throw new BusinessException(404, "订单明细不存在");
        }
        if (item.getUnitPrice() != null && item.getQuantity() != null) {
            item.setSubtotal(item.getUnitPrice().multiply(BigDecimal.valueOf(item.getQuantity())));
        }
        orderItemMapper.updateById(item);
    }

    @Override
    public void delete(Long id) {
        OrderItem item = orderItemMapper.selectById(id);
        if (item == null) {
            throw new BusinessException(404, "订单明细不存在");
        }
        orderItemMapper.deleteById(id);
    }
}
