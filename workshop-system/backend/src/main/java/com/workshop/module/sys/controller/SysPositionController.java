package com.workshop.module.sys.controller;

import com.workshop.common.result.Result;
import com.workshop.module.sys.entity.SysPosition;
import com.workshop.module.sys.service.SysPositionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/positions")
public class SysPositionController {

    @Autowired
    private SysPositionService sysPositionService;

    @GetMapping("/list")
    public Result<List<SysPosition>> list(@RequestParam(required = false) Long deptId) {
        if (deptId != null) {
            return Result.ok(sysPositionService.listByDept(deptId));
        }
        return Result.ok(sysPositionService.listAll());
    }

    @PostMapping
    public Result<?> create(@RequestBody SysPosition position) {
        sysPositionService.create(position);
        return Result.ok();
    }

    @PutMapping("/{id}")
    public Result<?> update(@PathVariable Long id, @RequestBody SysPosition position) {
        position.setId(id);
        sysPositionService.update(position);
        return Result.ok();
    }

    @DeleteMapping("/{id}")
    public Result<?> delete(@PathVariable Long id) {
        sysPositionService.delete(id);
        return Result.ok();
    }
}
