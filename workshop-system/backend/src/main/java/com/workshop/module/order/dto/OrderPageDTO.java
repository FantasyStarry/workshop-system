package com.workshop.module.order.dto;

import lombok.Data;

@Data
public class OrderPageDTO {
    private String orderNo;
    private String customerName;
    private Integer status;
    private String startDate;
    private String endDate;
}
