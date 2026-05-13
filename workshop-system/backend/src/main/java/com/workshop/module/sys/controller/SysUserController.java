package com.workshop.module.sys.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.workshop.common.result.PageResult;
import com.workshop.common.result.Result;
import com.workshop.module.sys.dto.SysUserCreateDTO;
import com.workshop.module.sys.dto.SysUserPageDTO;
import com.workshop.module.sys.entity.SysUser;
import com.workshop.module.sys.service.SysUserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
public class SysUserController {

    @Autowired
    private SysUserService sysUserService;

    @GetMapping("/page")
    public Result<PageResult<SysUser>> page(
            @RequestParam(defaultValue = "1") long page,
            @RequestParam(defaultValue = "10") long pageSize,
            @RequestParam(required = false) String username,
            @RequestParam(required = false) String realName,
            @RequestParam(required = false) Long deptId,
            @RequestParam(required = false) Integer status) {

        SysUserPageDTO dto = new SysUserPageDTO();
        dto.setUsername(username);
        dto.setRealName(realName);
        dto.setDeptId(deptId);
        dto.setStatus(status);

        Page<SysUser> pageParam = new Page<>(page, pageSize);
        Page<SysUser> result = sysUserService.pageQuery(pageParam, dto);

        return Result.ok(new PageResult<>(result.getRecords(), result.getTotal(), result.getCurrent(), result.getSize()));
    }

    @GetMapping("/{id}")
    public Result<SysUser> getById(@PathVariable Long id) {
        return Result.ok(sysUserService.getById(id));
    }

    @PostMapping
    public Result<?> create(@RequestBody SysUserCreateDTO dto) {
        sysUserService.create(dto);
        return Result.ok();
    }

    @PutMapping("/{id}")
    public Result<?> update(@PathVariable Long id, @RequestBody SysUser user) {
        user.setId(id);
        sysUserService.update(user);
        return Result.ok();
    }

    @PutMapping("/{id}/status")
    public Result<?> updateStatus(@PathVariable Long id, @RequestParam Integer status) {
        sysUserService.updateStatus(id, status);
        return Result.ok();
    }

    @DeleteMapping("/{id}")
    public Result<?> delete(@PathVariable Long id) {
        sysUserService.delete(id);
        return Result.ok();
    }
}
