package com.workshop.module.production.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class ProductionRecordDetailDTO {

    private Long id;
    private String recordNo;
    private Long qrCodeId;
    private Long orderItemId;
    
    private Long productId;
    private String productCode;
    private String productName;
    
    private Long stageId;
    private String stageName;
    private Integer stageSeq;
    
    private Long operatorId;
    private String operatorName;
    
    private LocalDateTime scanTime;
    private String location;
    private BigDecimal temperature;
    private BigDecimal humidity;
    private String photoUrl;
    
    private Integer qcResult;
    private Long qcUserId;
    private String qcUserName;
    private LocalDateTime qcTime;
    private String qcRemark;
    
    private String remark;
    private LocalDateTime createdAt;
}
