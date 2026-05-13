package com.workshop.module.sys.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.workshop.common.exception.BusinessException;
import com.workshop.module.sys.entity.SysPosition;
import com.workshop.module.sys.mapper.SysPositionMapper;
import com.workshop.module.sys.service.SysPositionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class SysPositionServiceImpl implements SysPositionService {

    @Autowired
    private SysPositionMapper sysPositionMapper;

    @Override
    public List<SysPosition> listByDept(Long deptId) {
        return sysPositionMapper.selectList(
                new LambdaQueryWrapper<SysPosition>()
                        .eq(deptId != null, SysPosition::getDeptId, deptId)
                        .eq(SysPosition::getStatus, 1)
                        .orderByAsc(SysPosition::getSortOrder, SysPosition::getId)
        );
    }

    @Override
    public List<SysPosition> listAll() {
        return sysPositionMapper.selectList(
                new LambdaQueryWrapper<SysPosition>()
                        .orderByAsc(SysPosition::getSortOrder, SysPosition::getId)
        );
    }

    @Override
    public void create(SysPosition position) {
        Long count = sysPositionMapper.selectCount(
                new LambdaQueryWrapper<SysPosition>().eq(SysPosition::getPositionCode, position.getPositionCode())
        );
        if (count > 0) {
            throw new BusinessException(400, "岗位编码已存在");
        }
        if (position.getStatus() == null) {
            position.setStatus(1);
        }
        sysPositionMapper.insert(position);
    }

    @Override
    public void update(SysPosition position) {
        SysPosition existing = sysPositionMapper.selectById(position.getId());
        if (existing == null) {
            throw new BusinessException(404, "岗位不存在");
        }
        if (position.getPositionCode() != null) {
            Long count = sysPositionMapper.selectCount(
                    new LambdaQueryWrapper<SysPosition>()
                            .eq(SysPosition::getPositionCode, position.getPositionCode())
                            .ne(SysPosition::getId, position.getId())
            );
            if (count > 0) {
                throw new BusinessException(400, "岗位编码已存在");
            }
        }
        sysPositionMapper.updateById(position);
    }

    @Override
    public void delete(Long id) {
        SysPosition existing = sysPositionMapper.selectById(id);
        if (existing == null) {
            throw new BusinessException(404, "岗位不存在");
        }
        sysPositionMapper.deleteById(id);
    }
}
