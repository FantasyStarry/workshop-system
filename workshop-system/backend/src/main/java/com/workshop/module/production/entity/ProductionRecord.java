package com.workshop.module.production.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@TableName("production_records")
public class ProductionRecord {

    @TableId(type = IdType.AUTO)
    private Long id;

    private String recordNo;
    private Long qrCodeId;
    private Long orderItemId;
    private Long stageId;
    private Long operatorId;
    private LocalDateTime scanTime;
    private String location;
    private BigDecimal temperature;
    private BigDecimal humidity;
    private String photoUrl;
    private Integer qcResult;
    private Long qcUserId;
    private LocalDateTime qcTime;
    private String qcRemark;
    private String remark;
    private LocalDateTime createdAt;
}
