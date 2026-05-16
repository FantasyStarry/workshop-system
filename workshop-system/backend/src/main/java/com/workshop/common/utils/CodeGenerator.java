package com.workshop.common.utils;

import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.concurrent.atomic.AtomicInteger;

@Component
public class CodeGenerator {

    private final AtomicInteger recordSerNo = new AtomicInteger(0);
    private volatile String currentRecordMinute = "";

    private final AtomicInteger orderSerNo = new AtomicInteger(0);
    private volatile String currentOrderMinute = "";

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

    /**
     * Generate order number: ORD-yyyyMMdd-00001
     */
    public synchronized String generateOrderNo() {
        String datePart = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        String minute = LocalDateTime.now().format(MINUTE_FORMAT);
        if (!minute.equals(currentOrderMinute)) {
            currentOrderMinute = minute;
            orderSerNo.set(0);
        }
        int seq = orderSerNo.incrementAndGet();
        return "ORD-" + datePart + "-" + String.format("%05d", seq);
    }
}
