package com.workshop.module.production.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.workshop.common.exception.BusinessException;
import com.workshop.module.production.entity.ProductionStage;
import com.workshop.module.production.mapper.ProductionStageMapper;
import com.workshop.module.production.service.ProductionStageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ProductionStageServiceImpl implements ProductionStageService {

    @Autowired
    private ProductionStageMapper productionStageMapper;

    @Override
    public List<ProductionStage> list() {
        return productionStageMapper.selectList(
                new LambdaQueryWrapper<ProductionStage>()
                        .eq(ProductionStage::getStatus, 1)
                        .orderByAsc(ProductionStage::getStageSeq)
        );
    }

    @Override
    public void create(ProductionStage stage) {
        Long count = productionStageMapper.selectCount(
                new LambdaQueryWrapper<ProductionStage>().eq(ProductionStage::getStageCode, stage.getStageCode())
        );
        if (count > 0) {
            throw new BusinessException(400, "环节编码已存在");
        }
        stage.setStatus(1);
        productionStageMapper.insert(stage);
    }

    @Override
    public void update(ProductionStage stage) {
        ProductionStage existing = productionStageMapper.selectById(stage.getId());
        if (existing == null) {
            throw new BusinessException(404, "生产环节不存在");
        }
        Long count = productionStageMapper.selectCount(
                new LambdaQueryWrapper<ProductionStage>()
                        .eq(ProductionStage::getStageCode, stage.getStageCode())
                        .ne(ProductionStage::getId, stage.getId())
        );
        if (count > 0) {
            throw new BusinessException(400, "环节编码已存在");
        }
        productionStageMapper.updateById(stage);
    }

    @Override
    public void delete(Long id) {
        ProductionStage stage = productionStageMapper.selectById(id);
        if (stage == null) {
            throw new BusinessException(404, "生产环节不存在");
        }
        productionStageMapper.deleteById(id);
    }
}
