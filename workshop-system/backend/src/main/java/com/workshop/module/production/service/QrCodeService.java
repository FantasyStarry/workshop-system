package com.workshop.module.production.service;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.workshop.module.production.dto.QrCodeDecodeResultDTO;
import com.workshop.module.production.dto.QrCodeDetailDTO;
import com.workshop.module.production.dto.QrCodeGenerateDTO;
import com.workshop.module.production.dto.ScanReportDTO;
import com.workshop.module.production.entity.ProductionRecord;
import com.workshop.module.production.entity.QrCode;

import java.util.List;

public interface QrCodeService {
    List<QrCode> generate(QrCodeGenerateDTO dto, Long userId);
    Page<QrCode> pageQuery(Page<QrCode> page, Long orderId, Long orderItemId, Long productId, Integer status);
    QrCode getById(Long id);
    QrCodeDecodeResultDTO decode(String qrContent);
    QrCode getByContent(String qrContent);
    void updateStageAndStatus(Long qrCodeId, Long stageId, Integer status);
    List<QrCodeDetailDTO> getDetailList(Long orderId);
}
