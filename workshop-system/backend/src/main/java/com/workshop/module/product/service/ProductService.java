package com.workshop.module.product.service;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.workshop.module.product.dto.ProductPageDTO;
import com.workshop.module.product.entity.Product;

public interface ProductService {
    Page<Product> pageQuery(Page<Product> page, ProductPageDTO dto);
    Product getById(Long id);
    void create(Product product);
    void update(Product product);
    void updateStatus(Long id, Integer status);
    void delete(Long id);
}
