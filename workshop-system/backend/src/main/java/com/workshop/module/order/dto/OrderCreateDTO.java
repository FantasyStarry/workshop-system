package com.workshop.module.order.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class OrderCreateDTO {
    private String customerName;
    private String customerContact;
    private String customerPhone;
    private String customerAddress;
    private LocalDateTime orderDate;
    private LocalDateTime deliveryDate;
    private BigDecimal totalAmount;
    private String remark;
    private List<OrderItemCreateDTO> items;
}
