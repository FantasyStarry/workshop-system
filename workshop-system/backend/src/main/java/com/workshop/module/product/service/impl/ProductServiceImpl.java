package com.workshop.module.product.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.workshop.common.exception.BusinessException;
import com.workshop.module.product.dto.ProductPageDTO;
import com.workshop.module.product.entity.Product;
import com.workshop.module.product.mapper.ProductMapper;
import com.workshop.module.product.service.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

@Service
public class ProductServiceImpl implements ProductService {

    @Autowired
    private ProductMapper productMapper;

    @Override
    public Page<Product> pageQuery(Page<Product> page, ProductPageDTO dto) {
        LambdaQueryWrapper<Product> wrapper = new LambdaQueryWrapper<>();
        if (StringUtils.hasText(dto.getProductCode())) {
            wrapper.like(Product::getProductCode, dto.getProductCode());
        }
        if (StringUtils.hasText(dto.getProductName())) {
            wrapper.like(Product::getProductName, dto.getProductName());
        }
        if (StringUtils.hasText(dto.getProductType())) {
            wrapper.eq(Product::getProductType, dto.getProductType());
        }
        if (dto.getStatus() != null) {
            wrapper.eq(Product::getStatus, dto.getStatus());
        }
        wrapper.orderByDesc(Product::getCreatedAt);
        return productMapper.selectPage(page, wrapper);
    }

    @Override
    public Product getById(Long id) {
        Product product = productMapper.selectById(id);
        if (product == null) {
            throw new BusinessException(404, "产品不存在");
        }
        return product;
    }

    @Override
    public void create(Product product) {
        Long count = productMapper.selectCount(
                new LambdaQueryWrapper<Product>().eq(Product::getProductCode, product.getProductCode())
        );
        if (count > 0) {
            throw new BusinessException(400, "产品编号已存在");
        }
        product.setStatus(1);
        productMapper.insert(product);
    }

    @Override
    public void update(Product product) {
        Product existing = productMapper.selectById(product.getId());
        if (existing == null) {
            throw new BusinessException(404, "产品不存在");
        }
        Long count = productMapper.selectCount(
                new LambdaQueryWrapper<Product>()
                        .eq(Product::getProductCode, product.getProductCode())
                        .ne(Product::getId, product.getId())
        );
        if (count > 0) {
            throw new BusinessException(400, "产品编号已存在");
        }
        productMapper.updateById(product);
    }

    @Override
    public void updateStatus(Long id, Integer status) {
        Product product = productMapper.selectById(id);
        if (product == null) {
            throw new BusinessException(404, "产品不存在");
        }
        product.setStatus(status);
        productMapper.updateById(product);
    }

    @Override
    public void delete(Long id) {
        Product product = productMapper.selectById(id);
        if (product == null) {
            throw new BusinessException(404, "产品不存在");
        }
        productMapper.deleteById(id);
    }
}
