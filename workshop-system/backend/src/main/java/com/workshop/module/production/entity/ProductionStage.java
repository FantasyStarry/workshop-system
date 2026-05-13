package com.workshop.module.production.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@TableName("production_stages")
public class ProductionStage {

    @TableId(type = IdType.AUTO)
    private Long id;

    private String stageCode;
    private String stageName;
    private Integer stageSeq;
    private String description;
    private Integer needQc;
    private Integer needPhoto;
    private BigDecimal estimatedHours;
    private Integer status;
    private LocalDateTime createdAt;
}
