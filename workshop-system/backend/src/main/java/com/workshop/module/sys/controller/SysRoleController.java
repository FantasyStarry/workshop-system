package com.workshop.module.sys.controller;

import com.workshop.common.result.Result;
import com.workshop.module.sys.entity.SysRole;
import com.workshop.module.sys.service.SysRoleService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/roles")
public class SysRoleController {

    @Autowired
    private SysRoleService sysRoleService;

    @GetMapping("/list")
    public Result<List<SysRole>> list() {
        return Result.ok(sysRoleService.list());
    }

    @PostMapping
    public Result<?> create(@RequestBody SysRole role) {
        sysRoleService.create(role);
        return Result.ok();
    }

    @PutMapping("/{id}")
    public Result<?> update(@PathVariable Long id, @RequestBody SysRole role) {
        role.setId(id);
        sysRoleService.update(role);
        return Result.ok();
    }

    @DeleteMapping("/{id}")
    public Result<?> delete(@PathVariable Long id) {
        sysRoleService.delete(id);
        return Result.ok();
    }
}
