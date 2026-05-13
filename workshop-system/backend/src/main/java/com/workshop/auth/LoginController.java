package com.workshop.auth;

import com.workshop.auth.dto.LoginDTO;
import com.workshop.auth.dto.LoginResultDTO;
import com.workshop.common.exception.BusinessException;
import com.workshop.common.result.Result;
import com.workshop.module.sys.entity.SysUser;
import com.workshop.module.sys.mapper.SysUserMapper;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class LoginController {

    @Autowired
    private LoginService loginService;

    @Autowired
    private SysUserMapper sysUserMapper;

    @Autowired
    private BCryptPasswordEncoder passwordEncoder;

    @PostMapping("/login")
    public Result<LoginResultDTO> login(@RequestBody LoginDTO dto) {
        LoginResultDTO result = loginService.login(dto);
        return Result.ok(result);
    }

    @GetMapping("/userinfo")
    public Result<Map<String, Object>> userinfo(HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        if (userId == null) {
            throw new BusinessException(401, "未登录或登录已过期");
        }
        Map<String, Object> userInfo = loginService.getUserInfo(userId);
        return Result.ok(userInfo);
    }

    @PutMapping("/password")
    public Result<?> updatePassword(HttpServletRequest request, @RequestBody Map<String, String> params) {
        Long userId = (Long) request.getAttribute("userId");
        if (userId == null) {
            throw new BusinessException(401, "未登录或登录已过期");
        }

        String oldPassword = params.get("oldPassword");
        String newPassword = params.get("newPassword");

        if (oldPassword == null || newPassword == null) {
            throw new BusinessException(400, "旧密码和新密码不能为空");
        }

        SysUser user = sysUserMapper.selectById(userId);
        if (user == null) {
            throw new BusinessException(404, "用户不存在");
        }
        if (!passwordEncoder.matches(oldPassword, user.getPassword())) {
            throw new BusinessException(400, "旧密码错误");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        sysUserMapper.updateById(user);

        return Result.ok();
    }
}
