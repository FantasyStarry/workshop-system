package com.workshop.module.production.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.workshop.common.result.Result;
import com.workshop.module.production.entity.ProductionStage;
import com.workshop.module.production.entity.StagePosition;
import com.workshop.module.production.mapper.StagePositionMapper;
import com.workshop.module.production.service.ProductionStageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/stages")
public class StageController {

    @Autowired
    private ProductionStageService productionStageService;

    @Autowired
    private StagePositionMapper stagePositionMapper;

    @GetMapping("/list")
    public Result<List<ProductionStage>> list() {
        return Result.ok(productionStageService.list());
    }

    @PostMapping
    public Result<?> create(@RequestBody ProductionStage stage) {
        productionStageService.create(stage);
        return Result.ok();
    }

    @PutMapping("/{id}")
    public Result<?> update(@PathVariable Long id, @RequestBody ProductionStage stage) {
        stage.setId(id);
        productionStageService.update(stage);
        return Result.ok();
    }

    @DeleteMapping("/{id}")
    public Result<?> delete(@PathVariable Long id) {
        productionStageService.delete(id);
        return Result.ok();
    }

    @GetMapping("/{stageId}/positions")
    public Result<List<Long>> getStagePositions(@PathVariable Long stageId) {
        List<StagePosition> bindings = stagePositionMapper.selectList(
                new LambdaQueryWrapper<StagePosition>().eq(StagePosition::getStageId, stageId)
        );
        List<Long> positionIds = bindings.stream().map(StagePosition::getPositionId).toList();
        return Result.ok(positionIds);
    }

    @PutMapping("/{stageId}/positions")
    public Result<?> updateStagePositions(@PathVariable Long stageId, @RequestBody Map<String, List<Long>> body) {
        List<Long> positionIds = body.get("positionIds");
        if (positionIds == null) {
            return Result.fail(400, "positionIds不能为空");
        }
        // Delete existing bindings
        stagePositionMapper.delete(
                new LambdaQueryWrapper<StagePosition>().eq(StagePosition::getStageId, stageId)
        );
        // Insert new bindings
        for (Long positionId : positionIds) {
            StagePosition sp = new StagePosition();
            sp.setStageId(stageId);
            sp.setPositionId(positionId);
            stagePositionMapper.insert(sp);
        }
        return Result.ok();
    }
}
