package com.workshop.module.order.service;

import com.workshop.module.order.entity.OrderFile;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface OrderFileService {
    List<OrderFile> getByOrderId(Long orderId);
    void upload(Long orderId, MultipartFile file);
    void delete(Long fileId);
}
