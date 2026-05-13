package com.workshop.module.order.service.impl;

import cn.hutool.core.io.FileUtil;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.workshop.common.exception.BusinessException;
import com.workshop.module.order.entity.OrderFile;
import com.workshop.module.order.mapper.OrderFileMapper;
import com.workshop.module.order.service.OrderFileService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.util.List;
import java.util.UUID;

@Service
public class OrderFileServiceImpl implements OrderFileService {

    @Value("${file.upload.path:./uploads}")
    private String uploadPath;

    @Autowired
    private OrderFileMapper orderFileMapper;

    @Override
    public List<OrderFile> getByOrderId(Long orderId) {
        return orderFileMapper.selectList(
                new LambdaQueryWrapper<OrderFile>()
                        .eq(OrderFile::getOrderId, orderId)
                        .orderByAsc(OrderFile::getSortOrder, OrderFile::getId)
        );
    }

    @Override
    public void upload(Long orderId, MultipartFile file) {
        try {
            // Ensure upload directory exists
            String orderDir = uploadPath + File.separator + "orders" + File.separator + orderId;
            File dir = new File(orderDir);
            if (!dir.exists()) {
                dir.mkdirs();
            }

            // Save file
            String originalName = file.getOriginalFilename();
            String ext = FileUtil.extName(originalName);
            String savedName = UUID.randomUUID().toString().replace("-", "") + "." + ext;
            String filePath = orderDir + File.separator + savedName;

            file.transferTo(new File(filePath));

            // Determine file type
            String fileType = "OTHER";
            String lowerExt = ext.toLowerCase();
            if (lowerExt.matches("jpg|jpeg|png|gif|bmp|webp")) {
                fileType = "IMAGE";
            } else if ("pdf".equals(lowerExt)) {
                fileType = "PDF";
            } else if (lowerExt.matches("dwg|dxf")) {
                fileType = "DWG";
            }

            OrderFile orderFile = new OrderFile();
            orderFile.setOrderId(orderId);
            orderFile.setFileName(originalName);
            orderFile.setFilePath("orders/" + orderId + "/" + savedName);
            orderFile.setFileSize(file.getSize());
            orderFile.setFileType(fileType);

            orderFileMapper.insert(orderFile);
        } catch (IOException e) {
            throw new BusinessException(500, "文件上传失败: " + e.getMessage());
        }
    }

    @Override
    public void delete(Long fileId) {
        OrderFile file = orderFileMapper.selectById(fileId);
        if (file == null) {
            throw new BusinessException(404, "文件不存在");
        }

        // Delete physical file
        String fullPath = uploadPath + File.separator + file.getFilePath();
        File physicalFile = new File(fullPath);
        if (physicalFile.exists()) {
            physicalFile.delete();
        }

        orderFileMapper.deleteById(fileId);
    }
}
