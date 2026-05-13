package com.workshop.module.production.dto;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class ScanReportDTO {
    private String qrContent;
    private Long stageId;
    private String location;
    private BigDecimal temperature;
    private BigDecimal humidity;
    private String photoUrl;
}
