package com.workshop.common.constant;

import lombok.Getter;

@Getter
public enum QrCodeStatus {
    PENDING(0, "待生产"),
    IN_PRODUCTION(1, "生产中"),
    COMPLETED(2, "已完成"),
    SCRAPPED(3, "报废");

    private final int code;
    private final String desc;

    QrCodeStatus(int code, String desc) {
        this.code = code;
        this.desc = desc;
    }

    public static String getDescByCode(int code) {
        for (QrCodeStatus status : values()) {
            if (status.code == code) {
                return status.desc;
            }
        }
        return "未知";
    }
}
