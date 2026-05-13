package com.workshop.module.production.dto;

import lombok.Data;

@Data
public class QrCodeGenerateDTO {
    private Long orderItemId;
    private Integer quantity;
}
