package com.workshop.module.order.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.workshop.common.result.PageResult;
import com.workshop.common.result.Result;
import com.workshop.module.order.dto.OrderCreateDTO;
import com.workshop.module.order.dto.OrderPageDTO;
import com.workshop.module.order.entity.Order;
import com.workshop.module.order.service.OrderService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    @Autowired
    private OrderService orderService;

    @GetMapping("/page")
    public Result<PageResult<Order>> page(
            @RequestParam(defaultValue = "1") long page,
            @RequestParam(defaultValue = "10") long pageSize,
            @RequestParam(required = false) String orderNo,
            @RequestParam(required = false) String customerName,
            @RequestParam(required = false) Integer status,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate) {

        OrderPageDTO dto = new OrderPageDTO();
        dto.setOrderNo(orderNo);
        dto.setCustomerName(customerName);
        dto.setStatus(status);
        dto.setStartDate(startDate);
        dto.setEndDate(endDate);

        Page<Order> pageParam = new Page<>(page, pageSize);
        Page<Order> result = orderService.pageQuery(pageParam, dto);

        return Result.ok(new PageResult<>(result.getRecords(), result.getTotal(), result.getCurrent(), result.getSize()));
    }

    @GetMapping("/{id}")
    public Result<Map<String, Object>> getDetail(@PathVariable Long id) {
        return Result.ok(orderService.getDetail(id));
    }

    @PostMapping
    public Result<Long> create(@RequestBody OrderCreateDTO dto, HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        Long orderId = orderService.create(dto, userId);
        return Result.ok(orderId);
    }

    @PutMapping("/{id}")
    public Result<?> update(@PathVariable Long id, @RequestBody Order order) {
        order.setId(id);
        orderService.update(order);
        return Result.ok();
    }

    @PutMapping("/{id}/status")
    public Result<?> updateStatus(@PathVariable Long id, @RequestParam Integer status) {
        orderService.updateStatus(id, status);
        return Result.ok();
    }

    @DeleteMapping("/{id}")
    public Result<?> delete(@PathVariable Long id) {
        orderService.delete(id);
        return Result.ok();
    }
}
