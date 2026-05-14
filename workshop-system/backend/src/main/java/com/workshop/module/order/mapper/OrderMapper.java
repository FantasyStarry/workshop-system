package com.workshop.module.order.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.workshop.module.order.entity.Order;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface OrderMapper extends BaseMapper<Order> {

    List<Order> pageQuery(@Param("offset") long offset,
                          @Param("size") long size,
                          @Param("orderNo") String orderNo,
                          @Param("customerName") String customerName,
                          @Param("status") Integer status,
                          @Param("startDate") String startDate,
                          @Param("endDate") String endDate);

    long countQuery(@Param("orderNo") String orderNo,
                    @Param("customerName") String customerName,
                    @Param("status") Integer status,
                    @Param("startDate") String startDate,
                    @Param("endDate") String endDate);

    Integer getMaxOrderSeq(@Param("prefix") String prefix);
}
