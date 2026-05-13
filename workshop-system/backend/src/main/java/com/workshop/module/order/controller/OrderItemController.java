package com.workshop.module.order.controller;

import com.workshop.common.result.Result;
import com.workshop.module.order.entity.OrderItem;
import com.workshop.module.order.service.OrderItemService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders/{orderId}/items")
public class OrderItemController {

    @Autowired
    private OrderItemService orderItemService;

    @GetMapping
    public Result<List<OrderItem>> list(@PathVariable Long orderId) {
        return Result.ok(orderItemService.getByOrderId(orderId));
    }

    @PostMapping
    public Result<?> create(@PathVariable Long orderId, @RequestBody OrderItem item) {
        item.setOrderId(orderId);
        orderItemService.create(item);
        return Result.ok();
    }

    @PutMapping("/{id}")
    public Result<?> update(@PathVariable Long orderId, @PathVariable Long id, @RequestBody OrderItem item) {
        item.setId(id);
        item.setOrderId(orderId);
        orderItemService.update(item);
        return Result.ok();
    }

    @DeleteMapping("/{id}")
    public Result<?> delete(@PathVariable Long orderId, @PathVariable Long id) {
        orderItemService.delete(id);
        return Result.ok();
    }
}
