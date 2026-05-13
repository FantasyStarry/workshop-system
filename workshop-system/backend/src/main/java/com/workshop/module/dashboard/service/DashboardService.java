package com.workshop.module.dashboard.service;

import com.workshop.common.result.Result;

import java.util.Map;

public interface DashboardService {
    Result<Map<String, Object>> overview();
}
