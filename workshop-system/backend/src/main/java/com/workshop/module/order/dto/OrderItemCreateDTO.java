package com.workshop.module.order.dto;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class OrderItemCreateDTO {
    private Long productId;
    private Integer quantity;
    private BigDecimal unitPrice;
}
