package com.workshop.module.production.dto;

import lombok.Data;

@Data
public class RecordPageDTO {
    private Long qrCodeId;
    private Long orderId;
    private Long stageId;
    private Long operatorId;
    private String startDate;
    private String endDate;
}
