package com.workshop.module.production.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class QrCodeDetailDTO {

    private Long id;
    private String qrContent;
    private String serialNo;
    private String batchNo;
    private String qrImagePath;
    private Integer status;
    private String statusText;
    private Long orderItemId;
    private Long productId;
    private String productName;
    private String productCode;
    private Long currentStageId;
    private String currentStageName;
    private Integer currentStageSeq;
    private Integer totalStages;
    private Integer completedStages;
    private Integer progressPercent;
    private String lastOperator;
    private String lastOperatorName;
    private LocalDateTime lastScanTime;
    private String lastLocation;
    private LocalDateTime generatedAt;
    private String generatedByName;
    private String scrapReason;
}
