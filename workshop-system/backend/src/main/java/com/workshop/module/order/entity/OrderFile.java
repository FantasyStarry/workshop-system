package com.workshop.module.order.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("order_files")
public class OrderFile {

    @TableId(type = IdType.AUTO)
    private Long id;

    private Long orderId;
    private String fileName;
    private String filePath;
    private Long fileSize;
    private String fileType;
    private Integer sortOrder;
    private LocalDateTime createdAt;
}
