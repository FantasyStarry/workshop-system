package com.workshop.auth;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.workshop.auth.dto.LoginDTO;
import com.workshop.auth.dto.LoginResultDTO;
import com.workshop.common.exception.BusinessException;
import com.workshop.common.utils.JwtUtils;
import com.workshop.module.sys.entity.SysRole;
import com.workshop.module.sys.entity.SysUser;
import com.workshop.module.sys.mapper.SysRoleMapper;
import com.workshop.module.sys.mapper.SysUserMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class LoginService {

    @Autowired
    private SysUserMapper sysUserMapper;

    @Autowired
    private SysRoleMapper sysRoleMapper;

    @Autowired
    private BCryptPasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtils jwtUtils;

    public LoginResultDTO login(LoginDTO dto) {
        if (dto.getUsername() == null || dto.getPassword() == null) {
            throw new BusinessException(400, "用户名和密码不能为空");
        }

        SysUser user = sysUserMapper.selectOne(
                new LambdaQueryWrapper<SysUser>().eq(SysUser::getUsername, dto.getUsername())
        );
        if (user == null) {
            throw new BusinessException(401, "用户名或密码错误");
        }
        if (user.getStatus() == 0) {
            throw new BusinessException(401, "账号已被禁用");
        }
        if (!passwordEncoder.matches(dto.getPassword(), user.getPassword())) {
            throw new BusinessException(401, "用户名或密码错误");
        }

        List<String> roleCodes = loadRoleCodes(user.getRoleIds());
        String token = jwtUtils.generateToken(user.getId(), user.getUsername(), roleCodes);
        LoginResultDTO result = new LoginResultDTO();
        result.setToken(token);
        result.setUserId(String.valueOf(user.getId()));
        result.setUsername(user.getUsername());
        result.setRealName(user.getRealName());
        return result;
    }

    public Map<String, Object> getUserInfo(Long userId) {
        SysUser user = sysUserMapper.selectById(userId);
        if (user == null) {
            throw new BusinessException(404, "用户不存在");
        }

        List<String> roleCodes = loadRoleCodes(user.getRoleIds());

        Map<String, Object> userInfo = new HashMap<>();
        userInfo.put("id", String.valueOf(user.getId()));
        userInfo.put("username", user.getUsername());
        userInfo.put("realName", user.getRealName());
        userInfo.put("phone", user.getPhone());
        userInfo.put("email", user.getEmail());
        userInfo.put("avatar", user.getAvatar());
        userInfo.put("deptId", user.getDeptId());
        userInfo.put("roleIds", user.getRoleIds());
        userInfo.put("roleCodes", String.join(",", roleCodes));
        userInfo.put("status", user.getStatus());
        userInfo.put("createdAt", user.getCreatedAt());

        return userInfo;
    }

    public void updatePassword(Long userId, String oldPassword, String newPassword) {
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
    }

    public Map<String, Object> refreshToken(String authorization) {
        if (authorization == null || !authorization.startsWith("Bearer ")) {
            throw new BusinessException(401, "无效的token");
        }

        String token = authorization.substring(7);

        if (!jwtUtils.validateToken(token)) {
            throw new BusinessException(401, "token已失效");
        }

        Long userId = jwtUtils.getUserId(token);
        String username = jwtUtils.getUsername(token);

        SysUser user = sysUserMapper.selectById(userId);
        if (user == null || user.getStatus() == 0) {
            throw new BusinessException(401, "用户不存在或已禁用");
        }

        List<String> roleCodes = loadRoleCodes(user.getRoleIds());
        String newToken = jwtUtils.generateToken(userId, username, roleCodes);

        Map<String, Object> result = new HashMap<>();
        result.put("token", newToken);
        result.put("userId", userId);
        result.put("username", username);
        result.put("realName", user.getRealName());

        return result;
    }

    /** 根据 roleIds 字符串（逗号分隔）加载角色编码列表 */
    private List<String> loadRoleCodes(String roleIds) {
        List<String> roleCodes = new ArrayList<>();
        if (roleIds != null && !roleIds.isEmpty()) {
            String[] ids = roleIds.split(",");
            for (String idStr : ids) {
                try {
                    Long roleId = Long.parseLong(idStr.trim());
                    SysRole role = sysRoleMapper.selectById(roleId);
                    if (role != null) {
                        roleCodes.add(role.getRoleCode());
                    }
                } catch (NumberFormatException ignored) {
                }
            }
        }
        return roleCodes;
    }
}
