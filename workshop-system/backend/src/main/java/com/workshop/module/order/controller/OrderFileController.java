package com.workshop.module.order.controller;

import com.workshop.common.result.Result;
import com.workshop.module.order.entity.OrderFile;
import com.workshop.module.order.service.OrderFileService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/orders/{orderId}/files")
public class OrderFileController {

    @Autowired
    private OrderFileService orderFileService;

    @GetMapping
    public Result<List<OrderFile>> list(@PathVariable Long orderId) {
        return Result.ok(orderFileService.getByOrderId(orderId));
    }

    @PostMapping
    public Result<?> upload(@PathVariable Long orderId, @RequestParam("file") MultipartFile file) {
        orderFileService.upload(orderId, file);
        return Result.ok();
    }

    @DeleteMapping("/{fileId}")
    public Result<?> delete(@PathVariable Long orderId, @PathVariable Long fileId) {
        orderFileService.delete(fileId);
        return Result.ok();
    }
}
