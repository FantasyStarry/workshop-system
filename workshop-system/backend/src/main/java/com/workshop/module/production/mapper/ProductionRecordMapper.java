package com.workshop.module.production.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.workshop.module.production.dto.ProductionRecordDetailDTO;
import com.workshop.module.production.entity.ProductionRecord;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.List;
import java.util.Map;

@Mapper
public interface ProductionRecordMapper extends BaseMapper<ProductionRecord> {

    List<ProductionRecord> pageQuery(@Param("offset") long offset,
                                     @Param("size") long size,
                                     @Param("qrCodeId") Long qrCodeId,
                                     @Param("orderId") Long orderId,
                                     @Param("stageId") Long stageId,
                                     @Param("operatorId") Long operatorId,
                                     @Param("startDate") String startDate,
                                     @Param("endDate") String endDate);

    long countQuery(@Param("qrCodeId") Long qrCodeId,
                    @Param("orderId") Long orderId,
                    @Param("stageId") Long stageId,
                    @Param("operatorId") Long operatorId,
                    @Param("startDate") String startDate,
                    @Param("endDate") String endDate);

    List<ProductionRecordDetailDTO> selectDetailByOrderId(@Param("orderId") Long orderId);

    List<ProductionRecordDetailDTO> selectDetailByQrCodeId(@Param("qrCodeId") Long qrCodeId);

    @Select("SELECT DATE(scan_time) AS record_date, COUNT(*) AS day_count " +
            "FROM production_records " +
            "WHERE scan_time >= #{startDate} AND scan_time <= #{endDate} " +
            "GROUP BY DATE(scan_time) " +
            "ORDER BY record_date ASC")
    List<Map<String, Object>> selectDailyScanTrend(@Param("startDate") String startDate,
                                                   @Param("endDate") String endDate);

    @Select("SELECT DATE(generated_at) AS record_date, COUNT(*) AS day_count " +
            "FROM qr_codes " +
            "WHERE status = 2 AND generated_at >= #{startDate} AND generated_at <= #{endDate} " +
            "GROUP BY DATE(generated_at) " +
            "ORDER BY record_date ASC")
    List<Map<String, Object>> selectDailyCompleteTrend(@Param("startDate") String startDate,
                                                       @Param("endDate") String endDate);
}
