package com.workshop.module.order.dto;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class OrderItemResponseDTO {

    private Long id;
    private Long orderId;
    private Long productId;
    private String productName;
    private String productCode;
    private String specification;
    private String productType;
    private Integer quantity;
    private BigDecimal unitPrice;
    private BigDecimal subtotal;
    private Integer productionStatus;
    private Integer sortOrder;
    private String remark;
}