package com.workshop.module.production.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.workshop.common.result.PageResult;
import com.workshop.common.result.Result;
import com.workshop.module.production.dto.ProductionRecordDetailDTO;
import com.workshop.module.production.dto.RecordPageDTO;
import com.workshop.module.production.dto.ScanReportDTO;
import com.workshop.module.production.entity.ProductionRecord;
import com.workshop.module.production.service.ProductionRecordService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/records")
public class ProductionRecordController {

    @Autowired
    private ProductionRecordService productionRecordService;

    @PostMapping("/scan")
    public Result<ProductionRecord> scan(@RequestBody ScanReportDTO dto, HttpServletRequest request) {
        Long operatorId = (Long) request.getAttribute("userId");
        if (operatorId == null) {
            operatorId = 1L; // fallback for testing
        }
        return Result.ok(productionRecordService.scan(dto, operatorId));
    }

    @GetMapping("/page")
    public Result<PageResult<ProductionRecord>> page(
            @RequestParam(defaultValue = "1") long page,
            @RequestParam(defaultValue = "10") long pageSize,
            @RequestParam(required = false) Long qrCodeId,
            @RequestParam(required = false) Long orderId,
            @RequestParam(required = false) Long stageId,
            @RequestParam(required = false) Long operatorId,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate) {

        RecordPageDTO dto = new RecordPageDTO();
        dto.setQrCodeId(qrCodeId);
        dto.setOrderId(orderId);
        dto.setStageId(stageId);
        dto.setOperatorId(operatorId);
        dto.setStartDate(startDate);
        dto.setEndDate(endDate);

        Page<ProductionRecord> pageParam = new Page<>(page, pageSize);
        Page<ProductionRecord> result = productionRecordService.pageQuery(pageParam, dto);

        return Result.ok(new PageResult<>(result.getRecords(), result.getTotal(), result.getCurrent(), result.getSize()));
    }

    @GetMapping("/by-qrcode/{qrCodeId}")
    public Result<List<ProductionRecordDetailDTO>> getLifecycleRecords(@PathVariable Long qrCodeId) {
        return Result.ok(productionRecordService.getLifecycleRecords(qrCodeId));
    }

    @GetMapping("/by-order/{orderId}")
    public Result<List<ProductionRecordDetailDTO>> getByOrder(@PathVariable Long orderId) {
        return Result.ok(productionRecordService.getByOrderId(orderId));
    }

    @PutMapping("/{id}/qc")
    public Result<?> updateQc(@PathVariable Long id, @RequestBody Map<String, Object> params, HttpServletRequest request) {
        Integer qcResult = (Integer) params.get("qcResult");
        String qcRemark = (String) params.get("qcRemark");
        Long qcUserId = (Long) request.getAttribute("userId");
        if (qcUserId == null) {
            qcUserId = 1L; // fallback
        }
        productionRecordService.updateQc(id, qcResult, qcUserId, qcRemark);
        return Result.ok();
    }
}
