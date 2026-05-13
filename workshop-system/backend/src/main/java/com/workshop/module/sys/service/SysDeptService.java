package com.workshop.module.sys.service;

import com.workshop.module.sys.entity.SysDept;

import java.util.List;

public interface SysDeptService {
    List<SysDept> getTree();
    void create(SysDept dept);
    void update(SysDept dept);
    void delete(Long id);
}
