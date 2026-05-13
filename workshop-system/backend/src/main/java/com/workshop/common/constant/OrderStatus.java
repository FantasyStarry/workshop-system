package com.workshop.common.constant;

import lombok.Getter;

@Getter
public enum OrderStatus {
    PENDING(0, "待确认"),
    IN_PRODUCTION(1, "生产中"),
    COMPLETED(2, "已完成"),
    CANCELLED(3, "已取消");

    private final int code;
    private final String desc;

    OrderStatus(int code, String desc) {
        this.code = code;
        this.desc = desc;
    }

    public static String getDescByCode(int code) {
        for (OrderStatus status : values()) {
            if (status.code == code) {
                return status.desc;
            }
        }
        return "未知";
    }
}
