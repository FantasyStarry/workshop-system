package com.workshop.module.sys.service;

import com.workshop.module.sys.entity.SysPosition;

import java.util.List;

public interface SysPositionService {
    List<SysPosition> listByDept(Long deptId);
    List<SysPosition> listAll();
    void create(SysPosition position);
    void update(SysPosition position);
    void delete(Long id);
}
