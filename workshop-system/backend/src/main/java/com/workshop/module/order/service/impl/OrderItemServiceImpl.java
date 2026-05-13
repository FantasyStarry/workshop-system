package com.workshop.module.order.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.workshop.common.exception.BusinessException;
import com.workshop.module.order.entity.OrderItem;
import com.workshop.module.order.mapper.OrderItemMapper;
import com.workshop.module.order.service.OrderItemService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

@Service
public class OrderItemServiceImpl implements OrderItemService {

    @Autowired
    private OrderItemMapper orderItemMapper;

    @Override
    public List<OrderItem> getByOrderId(Long orderId) {
        return orderItemMapper.selectList(
                new LambdaQueryWrapper<OrderItem>()
                        .eq(OrderItem::getOrderId, orderId)
                        .orderByAsc(OrderItem::getSortOrder, OrderItem::getId)
        );
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
