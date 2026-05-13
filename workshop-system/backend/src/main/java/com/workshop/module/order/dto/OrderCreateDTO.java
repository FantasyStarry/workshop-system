package com.workshop.module.order.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
public class OrderCreateDTO {
    private String customerName;
    private String customerContact;
    private String customerPhone;
    private String customerAddress;
    private String orderDate;
    private String deliveryDate;
    private BigDecimal totalAmount;
    private String remark;
    private List<OrderItemCreateDTO> items;
}
