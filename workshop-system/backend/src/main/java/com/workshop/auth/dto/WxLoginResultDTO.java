package com.workshop.auth.dto;

import lombok.Data;

@Data
public class WxLoginResultDTO {
    private String token;
    private String userId;
    private String username;
    private String realName;
    private Boolean needBind;
}
