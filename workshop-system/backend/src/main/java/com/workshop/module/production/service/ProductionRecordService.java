package com.workshop.module.production.service;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.workshop.module.production.dto.RecordPageDTO;
import com.workshop.module.production.dto.ScanReportDTO;
import com.workshop.module.production.entity.ProductionRecord;

import java.util.List;

public interface ProductionRecordService {
    ProductionRecord scan(ScanReportDTO dto, Long operatorId);
    Page<ProductionRecord> pageQuery(Page<ProductionRecord> page, RecordPageDTO dto);
    List<ProductionRecord> getLifecycleRecords(Long qrCodeId);
    List<ProductionRecord> getByOrderId(Long orderId);
    void updateQc(Long id, Integer qcResult, Long qcUserId, String qcRemark);
}
