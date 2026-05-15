package com.workshop.module.dashboard.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.workshop.common.result.Result;
import com.workshop.module.dashboard.service.DashboardService;
import com.workshop.module.order.entity.Order;
import com.workshop.module.order.mapper.OrderMapper;
import com.workshop.module.production.entity.ProductionRecord;
import com.workshop.module.production.entity.QrCode;
import com.workshop.module.production.mapper.ProductionRecordMapper;
import com.workshop.module.production.mapper.ProductionStageMapper;
import com.workshop.module.production.mapper.QrCodeMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

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
        LocalDateTime todayEnd = LocalDate.now().atTime(LocalTime.MAX);

        // 今日扫码次数（用 scanTime 而非 createdAt）
        Long todayScans = productionRecordMapper.selectCount(
                new LambdaQueryWrapper<ProductionRecord>()
                        .ge(ProductionRecord::getScanTime, todayStart)
                        .le(ProductionRecord::getScanTime, todayEnd));
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

        // 最近7天趋势（2 次 GROUP BY 查询，代替之前的 14 次单条查询）
        LocalDate sevenDaysAgo = LocalDate.now().minusDays(6);
        DateTimeFormatter fmt = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

        // 查询每天扫码数
        List<Map<String, Object>> scanTrend = productionRecordMapper.selectDailyScanTrend(
                sevenDaysAgo.atStartOfDay().format(fmt),
                todayEnd.format(fmt));

        // 查询每天完成数
        List<Map<String, Object>> completeTrend = qrCodeMapper.selectDailyCompleteTrend(
                sevenDaysAgo.atStartOfDay().format(fmt),
                todayEnd.format(fmt));

        // 组装 7 天数据（补全天）
        Map<String, Long> scanMap = scanTrend.stream()
                .collect(Collectors.toMap(
                        m -> (String) m.get("record_date"),
                        m -> ((Number) m.get("day_count")).longValue()));
        Map<String, Long> completeMap = completeTrend.stream()
                .collect(Collectors.toMap(
                        m -> (String) m.get("record_date"),
                        m -> ((Number) m.get("day_count")).longValue()));

        List<Map<String, Object>> trend = new ArrayList<>();
        for (int i = 6; i >= 0; i--) {
            String dateStr = LocalDate.now().minusDays(i).toString();
            Map<String, Object> dayData = new HashMap<>();
            dayData.put("date", dateStr);
            dayData.put("scanCount", scanMap.getOrDefault(dateStr, 0L));
            dayData.put("completeCount", completeMap.getOrDefault(dateStr, 0L));
            trend.add(dayData);
        }
        data.put("last7DaysTrend", trend);

        return Result.ok(data);
    }
}
