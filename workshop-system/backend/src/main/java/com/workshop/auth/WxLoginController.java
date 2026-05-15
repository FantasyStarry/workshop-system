package com.workshop.auth;

import com.workshop.auth.dto.LoginResultDTO;
import com.workshop.auth.dto.WxBindDTO;
import com.workshop.auth.dto.WxLoginDTO;
import com.workshop.auth.dto.WxLoginResultDTO;
import com.workshop.common.result.Result;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/wx")
public class WxLoginController {

    @Autowired
    private WxLoginService wxLoginService;

    @PostMapping("/login")
    public Result<WxLoginResultDTO> wxLogin(@RequestBody WxLoginDTO dto) {
        WxLoginResultDTO result = wxLoginService.wxLogin(dto);
        return Result.ok(result);
    }

    @PostMapping("/bind")
    public Result<LoginResultDTO> bindAccount(@RequestBody WxBindDTO dto) {
        LoginResultDTO result = wxLoginService.bindAccount(dto);
        return Result.ok(result);
    }
}
