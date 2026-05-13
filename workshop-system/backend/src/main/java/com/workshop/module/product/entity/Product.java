package com.workshop.module.product.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@TableName("products")
public class Product {

    @TableId(type = IdType.AUTO)
    private Long id;

    private String productCode;
    private String productName;
    private String productType;
    private String specification;
    private BigDecimal beamLength;
    private BigDecimal beamWidth;
    private BigDecimal beamHeight;
    private String concreteGrade;
    private String steelSpec;
    private String prestressSpec;
    private BigDecimal unitWeight;
    private String batchNo;
    private String technicalParams;
    private String drawingFile;
    private Integer status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
