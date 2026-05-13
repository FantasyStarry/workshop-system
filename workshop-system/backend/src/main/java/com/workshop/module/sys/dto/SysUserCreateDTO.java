package com.workshop.module.sys.dto;

import lombok.Data;

@Data
public class SysUserCreateDTO {
    private String username;
    private String password;
    private String realName;
    private String phone;
    private String email;
    private Long deptId;
    private String roleIds;
}
