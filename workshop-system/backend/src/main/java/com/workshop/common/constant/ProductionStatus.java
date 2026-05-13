package com.workshop.common.constant;

import lombok.Getter;

@Getter
public enum ProductionStatus {
    PENDING(0, "待生产"),
    IN_PRODUCTION(1, "生产中"),
    COMPLETED(2, "已完成");

    private final int code;
    private final String desc;

    ProductionStatus(int code, String desc) {
        this.code = code;
        this.desc = desc;
    }

    public static String getDescByCode(int code) {
        for (ProductionStatus status : values()) {
            if (status.code == code) {
                return status.desc;
            }
        }
        return "未知";
    }
}
