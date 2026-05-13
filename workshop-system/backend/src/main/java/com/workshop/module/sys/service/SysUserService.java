package com.workshop.module.sys.service;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.workshop.module.sys.dto.SysUserCreateDTO;
import com.workshop.module.sys.dto.SysUserPageDTO;
import com.workshop.module.sys.entity.SysDept;
import com.workshop.module.sys.entity.SysRole;
import com.workshop.module.sys.entity.SysUser;

import java.util.List;

public interface SysUserService {
    Page<SysUser> pageQuery(Page<SysUser> page, SysUserPageDTO dto);
    SysUser getById(Long id);
    void create(SysUserCreateDTO dto);
    void update(SysUser user);
    void updateStatus(Long id, Integer status);
    void delete(Long id);
}
