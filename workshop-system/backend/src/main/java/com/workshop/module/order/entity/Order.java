package com.workshop.module.order.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@TableName("orders")
public class Order {

    @TableId(type = IdType.AUTO)
    private Long id;

    private String orderNo;
    private String customerName;
    private String customerContact;
    private String customerPhone;
    private String customerAddress;
    private LocalDateTime orderDate;
    private LocalDateTime deliveryDate;
    private BigDecimal totalAmount;
    private Integer status;
    private String remark;
    private Long createdBy;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
