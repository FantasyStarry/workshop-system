package com.workshop.module.production.service;

import com.workshop.module.production.entity.ProductionStage;

import java.util.List;

public interface ProductionStageService {
    List<ProductionStage> list();
    void create(ProductionStage stage);
    void update(ProductionStage stage);
    void delete(Long id);
}
