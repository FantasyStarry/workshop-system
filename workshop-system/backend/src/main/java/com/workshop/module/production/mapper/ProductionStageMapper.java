package com.workshop.module.production.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.workshop.module.production.entity.ProductionStage;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Select;

import java.util.List;
import java.util.Map;

@Mapper
public interface ProductionStageMapper extends BaseMapper<ProductionStage> {

    @Select("SELECT ps.stage_name AS stageName, COUNT(qc.id) AS count " +
            "FROM production_stages ps " +
            "LEFT JOIN qr_codes qc ON qc.current_stage_id = ps.id AND qc.status IN (0, 1) " +
            "WHERE ps.status = 1 " +
            "GROUP BY ps.id, ps.stage_name, ps.stage_seq " +
            "ORDER BY ps.stage_seq")
    List<Map<String, Object>> selectStageDistribution();
}
