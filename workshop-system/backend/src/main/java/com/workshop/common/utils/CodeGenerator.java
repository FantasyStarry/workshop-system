package com.workshop.common.utils;

import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.concurrent.atomic.AtomicInteger;

@Component
public class CodeGenerator {

    private final AtomicInteger recordSerNo = new AtomicInteger(0);
    private volatile String currentRecordMinute = "";

    private static final DateTimeFormatter MINUTE_FORMAT = DateTimeFormatter.ofPattern("yyyyMMddHHmmss");

    /**
     * Generate record number: REC + yyyyMMddHHmmss + 4-digit serial
     */
    public synchronized String generateRecordNo() {
        String minute = LocalDateTime.now().format(MINUTE_FORMAT);
        if (!minute.equals(currentRecordMinute)) {
            currentRecordMinute = minute;
            recordSerNo.set(0);
        }
        int seq = recordSerNo.incrementAndGet();
        return "REC" + minute + String.format("%04d", seq);
    }
}
