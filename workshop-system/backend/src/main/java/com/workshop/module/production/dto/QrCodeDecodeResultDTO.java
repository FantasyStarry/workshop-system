package com.workshop.module.production.dto;

import lombok.Data;

@Data
public class QrCodeDecodeResultDTO {
    private String qrCodeId;
    private String qrContent;
    private String productId;
    private String productName;
    private String orderId;
    private String orderNo;
    private String currentStageId;
    private String currentStageName;
    private Integer status;
}
