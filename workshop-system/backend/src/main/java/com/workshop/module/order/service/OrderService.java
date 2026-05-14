package com.workshop.module.order.service;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.workshop.module.order.dto.OrderCreateDTO;
import com.workshop.module.order.dto.OrderPageDTO;
import com.workshop.module.order.entity.Order;

import java.util.Map;

public interface OrderService {
    Page<Order> pageQuery(Page<Order> page, OrderPageDTO dto);
    Map<String, Object> getDetail(Long id);
    Long create(OrderCreateDTO dto, Long userId);
    void update(Order order);
    void updateStatus(Long id, Integer status);
    void delete(Long id);
}
