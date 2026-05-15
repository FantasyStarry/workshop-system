package com.workshop.module.production.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.workshop.common.result.PageResult;
import com.workshop.common.result.Result;
import com.workshop.module.production.dto.QrCodeDecodeResultDTO;
import com.workshop.module.production.dto.QrCodeDetailDTO;
import com.workshop.module.production.dto.QrCodeGenerateDTO;
import com.workshop.module.production.entity.QrCode;
import com.workshop.module.production.service.QrCodeService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.File;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/qrcode")
public class QrCodeController {

    @Autowired
    private QrCodeService qrCodeService;

    @Value("${file.upload.path:./uploads}")
    private String uploadPath;

    @PostMapping("/generate")
    public Result<List<QrCode>> generate(@RequestBody QrCodeGenerateDTO dto, HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        if (userId == null) {
            userId = 1L; // fallback for testing
        }
        return Result.ok(qrCodeService.generate(dto, userId));
    }

    @GetMapping("/page")
    public Result<PageResult<QrCode>> page(
            @RequestParam(defaultValue = "1") long page,
            @RequestParam(defaultValue = "10") long pageSize,
            @RequestParam(required = false) Long orderId,
            @RequestParam(required = false) Long orderItemId,
            @RequestParam(required = false) Long productId,
            @RequestParam(required = false) Integer status) {

        Page<QrCode> pageParam = new Page<>(page, pageSize);
        Page<QrCode> result = qrCodeService.pageQuery(pageParam, orderId, orderItemId, productId, status);

        return Result.ok(new PageResult<>(result.getRecords(), result.getTotal(), result.getCurrent(), result.getSize()));
    }

    @GetMapping("/{id}")
    public Result<QrCode> getById(@PathVariable Long id) {
        return Result.ok(qrCodeService.getById(id));
    }

    @GetMapping("/{id}/image")
    public ResponseEntity<Resource> getImage(@PathVariable Long id) {
        QrCode qrCode = qrCodeService.getById(id);
        String imagePath = qrCode.getQrImagePath();
        if (imagePath == null || imagePath.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        File file = new File(uploadPath + File.separator + imagePath);
        if (!file.exists()) {
            return ResponseEntity.notFound().build();
        }

        Resource resource = new FileSystemResource(file);
        return ResponseEntity.ok()
                .contentType(MediaType.IMAGE_PNG)
                .body(resource);
    }

    @PostMapping("/decode")
    public Result<QrCodeDecodeResultDTO> decode(@RequestBody Map<String, String> req) {
        String qrContent = req.get("qrContent");
        QrCodeDecodeResultDTO result = qrCodeService.decode(qrContent);
        return Result.ok(result);
    }

    @GetMapping("/detail/list")
    public Result<List<QrCodeDetailDTO>> getDetailList(@RequestParam Long orderId) {
        return Result.ok(qrCodeService.getDetailList(orderId));
    }
}
