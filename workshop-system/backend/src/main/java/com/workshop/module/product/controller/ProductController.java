package com.workshop.module.product.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.workshop.common.result.PageResult;
import com.workshop.common.result.Result;
import com.workshop.module.product.dto.ProductPageDTO;
import com.workshop.module.product.entity.Product;
import com.workshop.module.product.service.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    @Autowired
    private ProductService productService;

    @GetMapping("/page")
    public Result<PageResult<Product>> page(
            @RequestParam(defaultValue = "1") long page,
            @RequestParam(defaultValue = "10") long pageSize,
            @RequestParam(required = false) String productCode,
            @RequestParam(required = false) String productName,
            @RequestParam(required = false) String productType,
            @RequestParam(required = false) Integer status) {

        ProductPageDTO dto = new ProductPageDTO();
        dto.setProductCode(productCode);
        dto.setProductName(productName);
        dto.setProductType(productType);
        dto.setStatus(status);

        Page<Product> pageParam = new Page<>(page, pageSize);
        Page<Product> result = productService.pageQuery(pageParam, dto);

        return Result.ok(new PageResult<>(result.getRecords(), result.getTotal(), result.getCurrent(), result.getSize()));
    }

    @GetMapping("/{id}")
    public Result<Product> getById(@PathVariable Long id) {
        return Result.ok(productService.getById(id));
    }

    @PostMapping
    public Result<?> create(@RequestBody Product product) {
        productService.create(product);
        return Result.ok();
    }

    @PutMapping("/{id}")
    public Result<?> update(@PathVariable Long id, @RequestBody Product product) {
        product.setId(id);
        productService.update(product);
        return Result.ok();
    }

    @PutMapping("/{id}/status")
    public Result<?> updateStatus(@PathVariable Long id, @RequestParam Integer status) {
        productService.updateStatus(id, status);
        return Result.ok();
    }

    @DeleteMapping("/{id}")
    public Result<?> delete(@PathVariable Long id) {
        productService.delete(id);
        return Result.ok();
    }
}
