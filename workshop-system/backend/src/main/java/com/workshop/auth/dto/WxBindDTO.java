package com.workshop.auth.dto;

import lombok.Data;

@Data
public class WxBindDTO {
    private String username;
    private String password;
    private String wxOpenid;
}
