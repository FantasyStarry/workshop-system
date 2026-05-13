package com.workshop.module.sys.controller;

import com.workshop.common.result.Result;
import com.workshop.module.sys.entity.SysDept;
import com.workshop.module.sys.service.SysDeptService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/depts")
public class SysDeptController {

    @Autowired
    private SysDeptService sysDeptService;

    @GetMapping("/tree")
    public Result<List<SysDept>> tree() {
        return Result.ok(sysDeptService.getTree());
    }

    @PostMapping
    public Result<?> create(@RequestBody SysDept dept) {
        sysDeptService.create(dept);
        return Result.ok();
    }

    @PutMapping("/{id}")
    public Result<?> update(@PathVariable Long id, @RequestBody SysDept dept) {
        dept.setId(id);
        sysDeptService.update(dept);
        return Result.ok();
    }

    @DeleteMapping("/{id}")
    public Result<?> delete(@PathVariable Long id) {
        sysDeptService.delete(id);
        return Result.ok();
    }
}
