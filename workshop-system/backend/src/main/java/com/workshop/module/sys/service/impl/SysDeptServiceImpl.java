package com.workshop.module.sys.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.workshop.common.exception.BusinessException;
import com.workshop.module.sys.entity.SysDept;
import com.workshop.module.sys.mapper.SysDeptMapper;
import com.workshop.module.sys.service.SysDeptService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class SysDeptServiceImpl implements SysDeptService {

    @Autowired
    private SysDeptMapper sysDeptMapper;

    @Override
    public List<SysDept> getTree() {
        List<SysDept> allDepts = sysDeptMapper.selectList(
                new LambdaQueryWrapper<SysDept>()
                        .eq(SysDept::getStatus, 1)
                        .orderByAsc(SysDept::getSortOrder, SysDept::getId)
        );

        Map<Long, List<SysDept>> childrenMap = allDepts.stream()
                .filter(d -> d.getParentId() != null && d.getParentId() != 0)
                .collect(Collectors.groupingBy(SysDept::getParentId));

        List<SysDept> roots = allDepts.stream()
                .filter(d -> d.getParentId() == null || d.getParentId() == 0)
                .collect(Collectors.toList());

        for (SysDept root : roots) {
            buildChildren(root, childrenMap);
        }

        return roots;
    }

    private void buildChildren(SysDept dept, Map<Long, List<SysDept>> childrenMap) {
        List<SysDept> children = childrenMap.get(dept.getId());
        if (children != null && !children.isEmpty()) {
            dept.setChildren(children);
            for (SysDept child : children) {
                buildChildren(child, childrenMap);
            }
        } else {
            dept.setChildren(new ArrayList<>());
        }
    }

    @Override
    public void create(SysDept dept) {
        Long count = sysDeptMapper.selectCount(
                new LambdaQueryWrapper<SysDept>().eq(SysDept::getDeptCode, dept.getDeptCode())
        );
        if (count > 0) {
            throw new BusinessException(400, "部门编码已存在");
        }
        dept.setStatus(1);
        sysDeptMapper.insert(dept);
    }

    @Override
    public void update(SysDept dept) {
        SysDept existing = sysDeptMapper.selectById(dept.getId());
        if (existing == null) {
            throw new BusinessException(404, "部门不存在");
        }
        Long count = sysDeptMapper.selectCount(
                new LambdaQueryWrapper<SysDept>()
                        .eq(SysDept::getDeptCode, dept.getDeptCode())
                        .ne(SysDept::getId, dept.getId())
        );
        if (count > 0) {
            throw new BusinessException(400, "部门编码已存在");
        }
        sysDeptMapper.updateById(dept);
    }

    @Override
    public void delete(Long id) {
        Long childCount = sysDeptMapper.selectCount(
                new LambdaQueryWrapper<SysDept>().eq(SysDept::getParentId, id)
        );
        if (childCount > 0) {
            throw new BusinessException(400, "该部门下有子部门，无法删除");
        }
        sysDeptMapper.deleteById(id);
    }
}
