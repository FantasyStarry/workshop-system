package com.workshop.module.production.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("qr_codes")
public class QrCode {

    @TableId(type = IdType.AUTO)
    private Long id;

    private String qrContent;
    private Long orderItemId;
    private Long productId;
    private String serialNo;
    private String batchNo;
    private String qrImagePath;
    private Long currentStageId;
    private Integer status;
    private Long generatedBy;
    private LocalDateTime generatedAt;
    private LocalDateTime printedAt;
    private String scrapReason;
    private LocalDateTime createdAt;
}
