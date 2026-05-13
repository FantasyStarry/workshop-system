package com.workshop.module.sys.service;

import com.workshop.module.sys.entity.SysRole;

import java.util.List;

public interface SysRoleService {
    List<SysRole> list();
    void create(SysRole role);
    void update(SysRole role);
    void delete(Long id);
}
