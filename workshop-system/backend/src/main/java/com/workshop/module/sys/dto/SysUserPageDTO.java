package com.workshop.module.sys.dto;

import lombok.Data;

@Data
public class SysUserPageDTO {
    private String username;
    private String realName;
    private Long deptId;
    private Integer status;
}
