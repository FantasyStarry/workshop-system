package com.workshop.module.sys.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.workshop.common.exception.BusinessException;
import com.workshop.module.sys.entity.SysRole;
import com.workshop.module.sys.mapper.SysRoleMapper;
import com.workshop.module.sys.service.SysRoleService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class SysRoleServiceImpl implements SysRoleService {

    @Autowired
    private SysRoleMapper sysRoleMapper;

    @Override
    public List<SysRole> list() {
        return sysRoleMapper.selectList(
                new LambdaQueryWrapper<SysRole>()
                        .eq(SysRole::getStatus, 1)
                        .orderByAsc(SysRole::getSortOrder, SysRole::getId)
        );
    }

    @Override
    public void create(SysRole role) {
        Long count = sysRoleMapper.selectCount(
                new LambdaQueryWrapper<SysRole>().eq(SysRole::getRoleCode, role.getRoleCode())
        );
        if (count > 0) {
            throw new BusinessException(400, "角色编码已存在");
        }
        role.setStatus(1);
        sysRoleMapper.insert(role);
    }

    @Override
    public void update(SysRole role) {
        SysRole existing = sysRoleMapper.selectById(role.getId());
        if (existing == null) {
            throw new BusinessException(404, "角色不存在");
        }
        Long count = sysRoleMapper.selectCount(
                new LambdaQueryWrapper<SysRole>()
                        .eq(SysRole::getRoleCode, role.getRoleCode())
                        .ne(SysRole::getId, role.getId())
        );
        if (count > 0) {
            throw new BusinessException(400, "角色编码已存在");
        }
        sysRoleMapper.updateById(role);
    }

    @Override
    public void delete(Long id) {
        SysRole role = sysRoleMapper.selectById(id);
        if (role == null) {
            throw new BusinessException(404, "角色不存在");
        }
        sysRoleMapper.deleteById(id);
    }
}
