package com.workshop.module.sys.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.workshop.common.exception.BusinessException;
import com.workshop.module.sys.dto.SysUserCreateDTO;
import com.workshop.module.sys.dto.SysUserPageDTO;
import com.workshop.module.sys.entity.SysUser;
import com.workshop.module.sys.mapper.SysUserMapper;
import com.workshop.module.sys.service.SysUserService;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

@Service
public class SysUserServiceImpl implements SysUserService {

    @Autowired
    private SysUserMapper sysUserMapper;

    @Autowired
    private BCryptPasswordEncoder passwordEncoder;

    @Override
    public Page<SysUser> pageQuery(Page<SysUser> page, SysUserPageDTO dto) {
        LambdaQueryWrapper<SysUser> wrapper = new LambdaQueryWrapper<>();
        if (StringUtils.hasText(dto.getUsername())) {
            wrapper.like(SysUser::getUsername, dto.getUsername());
        }
        if (StringUtils.hasText(dto.getRealName())) {
            wrapper.like(SysUser::getRealName, dto.getRealName());
        }
        if (dto.getDeptId() != null) {
            wrapper.eq(SysUser::getDeptId, dto.getDeptId());
        }
        if (dto.getStatus() != null) {
            wrapper.eq(SysUser::getStatus, dto.getStatus());
        }
        wrapper.orderByDesc(SysUser::getCreatedAt);
        return sysUserMapper.selectPage(page, wrapper);
    }

    @Override
    public SysUser getById(Long id) {
        SysUser user = sysUserMapper.selectById(id);
        if (user == null) {
            throw new BusinessException(404, "用户不存在");
        }
        return user;
    }

    @Override
    public void create(SysUserCreateDTO dto) {
        // Check username uniqueness
        Long count = sysUserMapper.selectCount(
                new LambdaQueryWrapper<SysUser>().eq(SysUser::getUsername, dto.getUsername())
        );
        if (count > 0) {
            throw new BusinessException(400, "用户名已存在");
        }

        SysUser user = new SysUser();
        BeanUtils.copyProperties(dto, user);
        user.setPassword(passwordEncoder.encode(dto.getPassword()));
        user.setStatus(1);

        sysUserMapper.insert(user);
    }

    @Override
    public void update(SysUser user) {
        SysUser existing = sysUserMapper.selectById(user.getId());
        if (existing == null) {
            throw new BusinessException(404, "用户不存在");
        }

        // Check username uniqueness (exclude self)
        Long count = sysUserMapper.selectCount(
                new LambdaQueryWrapper<SysUser>()
                        .eq(SysUser::getUsername, user.getUsername())
                        .ne(SysUser::getId, user.getId())
        );
        if (count > 0) {
            throw new BusinessException(400, "用户名已存在");
        }

        // Don't overwrite password if not provided
        if (!StringUtils.hasText(user.getPassword())) {
            user.setPassword(existing.getPassword());
        } else {
            user.setPassword(passwordEncoder.encode(user.getPassword()));
        }

        sysUserMapper.updateById(user);
    }

    @Override
    public void updateStatus(Long id, Integer status) {
        SysUser user = sysUserMapper.selectById(id);
        if (user == null) {
            throw new BusinessException(404, "用户不存在");
        }
        user.setStatus(status);
        sysUserMapper.updateById(user);
    }

    @Override
    public void delete(Long id) {
        SysUser user = sysUserMapper.selectById(id);
        if (user == null) {
            throw new BusinessException(404, "用户不存在");
        }
        sysUserMapper.deleteById(id);
    }
}
