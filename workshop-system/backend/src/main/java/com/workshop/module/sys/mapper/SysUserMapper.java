package com.workshop.module.sys.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.workshop.module.sys.entity.SysUser;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface SysUserMapper extends BaseMapper<SysUser> {
}
