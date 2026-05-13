package com.workshop.common.utils;

import com.google.zxing.BarcodeFormat;
import com.google.zxing.EncodeHintType;
import com.google.zxing.WriterException;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;
import com.google.zxing.qrcode.decoder.ErrorCorrectionLevel;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Slf4j
@Component
public class QrCodeUtils {

    @Value("${file.upload.path:./uploads}")
    private String uploadPath;

    private static final int QR_CODE_SIZE = 300;

    /**
     * Generate a QR code image and save to uploads/qrcode/ directory
     *
     * @param content the content to encode in QR code
     * @return the file path relative to upload root
     */
    public String generateQrCode(String content) {
        try {
            // Ensure directory exists
            String qrDir = uploadPath + File.separator + "qrcode";
            Path qrDirPath = Paths.get(qrDir);
            if (!Files.exists(qrDirPath)) {
                Files.createDirectories(qrDirPath);
            }

            String fileName = UUID.randomUUID().toString().replace("-", "") + ".png";
            String filePath = qrDir + File.separator + fileName;

            Map<EncodeHintType, Object> hints = new HashMap<>();
            hints.put(EncodeHintType.ERROR_CORRECTION, ErrorCorrectionLevel.M);
            hints.put(EncodeHintType.CHARACTER_SET, "UTF-8");
            hints.put(EncodeHintType.MARGIN, 1);

            QRCodeWriter qrCodeWriter = new QRCodeWriter();
            BitMatrix bitMatrix = qrCodeWriter.encode(content, BarcodeFormat.QR_CODE, QR_CODE_SIZE, QR_CODE_SIZE, hints);

            BufferedImage image = MatrixToImageWriter.toBufferedImage(bitMatrix);
            ImageIO.write(image, "png", new File(filePath));

            String relativePath = "qrcode/" + fileName;
            log.info("QR code generated: {} -> {}", content, relativePath);
            return relativePath;
        } catch (WriterException | IOException e) {
            log.error("Failed to generate QR code", e);
            throw new RuntimeException("QR code generation failed: " + e.getMessage());
        }
    }

    /**
     * Generate QR code content string based on encoding rule
     * Format: {orderNo}-{productCode}-{timestamp}-{serialNo}
     */
    public String generateQrContent(String orderNo, String productCode, int serialNo) {
        String timestamp = String.valueOf(System.currentTimeMillis());
        return orderNo + "-" + productCode + "-" + timestamp + "-" + String.format("%04d", serialNo);
    }

    /**
     * Decode QR content string into its component parts
     *
     * @param content the QR content string to decode
     * @return a Map containing the decoded parts:
     *         "orderNo", "productCode", "timestamp", "serialNo"
     */
    public Map<String, String> decodeQrContent(String content) {
        Map<String, String> result = new HashMap<>();
        String[] parts = content.split("-");
        if (parts.length >= 4) {
            // The first part is orderNo (may contain dashes like "ORD20260513001")
            // The last 3 parts are: productCode, timestamp, serialNo
            StringBuilder orderNoSb = new StringBuilder();
            for (int i = 0; i < parts.length - 3; i++) {
                if (i > 0) orderNoSb.append("-");
                orderNoSb.append(parts[i]);
            }
            result.put("orderNo", orderNoSb.toString());
            result.put("productCode", parts[parts.length - 3]);
            result.put("timestamp", parts[parts.length - 2]);
            result.put("serialNo", parts[parts.length - 1]);
        } else {
            result.put("orderNo", content);
            result.put("productCode", "");
            result.put("timestamp", "");
            result.put("serialNo", "");
        }
        return result;
    }
}
