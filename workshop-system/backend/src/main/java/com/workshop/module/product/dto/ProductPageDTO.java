package com.workshop.module.product.dto;

import lombok.Data;

@Data
public class ProductPageDTO {
    private String productCode;
    private String productName;
    private String productType;
    private Integer status;
}
