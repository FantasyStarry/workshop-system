package com.workshop.module.order.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.workshop.module.order.dto.OrderItemResponseDTO;
import com.workshop.module.order.entity.OrderItem;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface OrderItemMapper extends BaseMapper<OrderItem> {

    List<OrderItemResponseDTO> selectWithProductByOrderId(@Param("orderId") Long orderId);
}
