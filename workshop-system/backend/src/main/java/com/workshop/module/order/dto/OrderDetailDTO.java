package com.workshop.module.order.dto;

import com.workshop.module.order.entity.Order;
import com.workshop.module.order.entity.OrderFile;
import lombok.Data;

import java.util.List;

@Data
public class OrderDetailDTO {

    private Order order;
    
    private List<OrderItemResponseDTO> items;
    
    private List<OrderFile> files;
}