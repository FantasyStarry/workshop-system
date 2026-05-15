package com.workshop.auth;

import com.workshop.auth.dto.LoginDTO;
import com.workshop.auth.dto.LoginResultDTO;
import com.workshop.common.exception.BusinessException;
import com.workshop.common.result.Result;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class LoginController {

    @Autowired
    private LoginService loginService;

    @PostMapping("/login")
    public Result<LoginResultDTO> login(@RequestBody LoginDTO dto) {
        return Result.ok(loginService.login(dto));
    }

    @GetMapping("/userinfo")
    public Result<Map<String, Object>> userinfo(HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        if (userId == null) {
            throw new BusinessException(401, "未登录或登录已过期");
        }
        return Result.ok(loginService.getUserInfo(userId));
    }

    @PutMapping("/password")
    public Result<?> updatePassword(HttpServletRequest request, @RequestBody Map<String, String> params) {
        Long userId = (Long) request.getAttribute("userId");
        if (userId == null) {
            throw new BusinessException(401, "未登录或登录已过期");
        }
        loginService.updatePassword(userId, params.get("oldPassword"), params.get("newPassword"));
        return Result.ok();
    }

    @PostMapping("/refresh")
    public Result<Map<String, Object>> refresh(HttpServletRequest request) {
        String authorization = request.getHeader("Authorization");
        return Result.ok(loginService.refreshToken(authorization));
    }
}
