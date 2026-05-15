package com.workshop.module.production.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.workshop.module.production.dto.ProductionRecordDetailDTO;
import com.workshop.module.production.entity.ProductionRecord;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

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
}
