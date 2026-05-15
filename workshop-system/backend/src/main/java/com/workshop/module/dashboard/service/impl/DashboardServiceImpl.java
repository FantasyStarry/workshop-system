package com.workshop.module.dashboard.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.workshop.common.result.Result;
import com.workshop.module.dashboard.service.DashboardService;
import com.workshop.module.order.entity.Order;
import com.workshop.module.order.mapper.OrderMapper;
import com.workshop.module.production.entity.ProductionRecord;
import com.workshop.module.production.entity.ProductionStage;
import com.workshop.module.production.entity.QrCode;
import com.workshop.module.production.mapper.ProductionRecordMapper;
import com.workshop.module.production.mapper.ProductionStageMapper;
import com.workshop.module.production.mapper.QrCodeMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

@Service
public class DashboardServiceImpl implements DashboardService {

    @Autowired
    private ProductionRecordMapper productionRecordMapper;

    @Autowired
    private OrderMapper orderMapper;

    @Autowired
    private QrCodeMapper qrCodeMapper;

    @Autowired
    private ProductionStageMapper productionStageMapper;

    @Override
    public Result<Map<String, Object>> overview() {
        Map<String, Object> data = new HashMap<>();

        LocalDateTime todayStart = LocalDate.now().atStartOfDay();

        // 今日扫码次数
        Long todayScans = productionRecordMapper.selectCount(
                new LambdaQueryWrapper<ProductionRecord>()
                        .ge(ProductionRecord::getCreatedAt, todayStart));
        data.put("todayScanCount", todayScans);

        // 生产中订单数
        Long activeOrderCount = orderMapper.selectCount(
                new LambdaQueryWrapper<Order>().eq(Order::getStatus, 1));
        data.put("activeOrderCount", activeOrderCount);

        // 本月完成产品数
        LocalDateTime monthStart = LocalDate.now().withDayOfMonth(1).atStartOfDay();
        Long monthCompleteCount = qrCodeMapper.selectCount(
                new LambdaQueryWrapper<QrCode>()
                        .eq(QrCode::getStatus, 2)
                        .ge(QrCode::getGeneratedAt, monthStart));
        data.put("monthCompleteCount", monthCompleteCount);

        // 在制品数量
        Long inProductionCount = qrCodeMapper.selectCount(
                new LambdaQueryWrapper<QrCode>()
                        .in(QrCode::getStatus, 0, 1));
        data.put("inProductionCount", inProductionCount);

        // 各环节在制品分布
        List<Map<String, Object>> stageDistribution = productionStageMapper.selectStageDistribution();
        data.put("stageDistribution", stageDistribution);

        // 最近7天趋势
        List<Map<String, Object>> trend = new ArrayList<>();
        for (int i = 6; i >= 0; i--) {
            LocalDate date = LocalDate.now().minusDays(i);
            LocalDateTime dayStart = date.atStartOfDay();
            LocalDateTime dayEnd = date.atTime(23, 59, 59);

            Long scanCount = productionRecordMapper.selectCount(
                    new LambdaQueryWrapper<ProductionRecord>()
                            .ge(ProductionRecord::getCreatedAt, dayStart)
                            .le(ProductionRecord::getCreatedAt, dayEnd));

            Long completeCount = qrCodeMapper.selectCount(
                    new LambdaQueryWrapper<QrCode>()
                            .eq(QrCode::getStatus, 2)
                            .ge(QrCode::getGeneratedAt, dayStart)
                            .le(QrCode::getGeneratedAt, dayEnd));

            Map<String, Object> dayData = new HashMap<>();
            dayData.put("date", date.toString());
            dayData.put("scanCount", scanCount);
            dayData.put("completeCount", completeCount);
            trend.add(dayData);
        }
        data.put("last7DaysTrend", trend);

        return Result.ok(data);
    }
}
