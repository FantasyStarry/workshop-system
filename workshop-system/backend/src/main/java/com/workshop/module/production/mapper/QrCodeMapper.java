package com.workshop.module.production.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.workshop.module.production.entity.QrCode;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.List;
import java.util.Map;

@Mapper
public interface QrCodeMapper extends BaseMapper<QrCode> {

    List<QrCode> pageQuery(@Param("offset") long offset,
                           @Param("size") long size,
                           @Param("orderId") Long orderId,
                           @Param("orderItemId") Long orderItemId,
                           @Param("productId") Long productId,
                           @Param("status") Integer status);

    long countQuery(@Param("orderId") Long orderId,
                    @Param("orderItemId") Long orderItemId,
                    @Param("productId") Long productId,
                    @Param("status") Integer status);

    @Select("SELECT DATE(generated_at) AS record_date, COUNT(*) AS day_count " +
            "FROM qr_codes " +
            "WHERE status = 2 AND generated_at >= #{startDate} AND generated_at <= #{endDate} " +
            "GROUP BY DATE(generated_at) " +
            "ORDER BY record_date ASC")
    List<Map<String, Object>> selectDailyCompleteTrend(@Param("startDate") String startDate,
                                                       @Param("endDate") String endDate);
}
