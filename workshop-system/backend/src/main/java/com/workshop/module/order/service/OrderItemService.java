package com.workshop.module.order.service;

import com.workshop.module.order.entity.OrderItem;

import java.util.List;

public interface OrderItemService {
    List<OrderItem> getByOrderId(Long orderId);
    void create(OrderItem item);
    void update(OrderItem item);
    void delete(Long id);
}
