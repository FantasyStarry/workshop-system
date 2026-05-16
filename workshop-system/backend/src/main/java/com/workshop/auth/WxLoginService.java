package com.workshop.auth;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.workshop.auth.dto.LoginResultDTO;
import com.workshop.auth.dto.WxBindDTO;
import com.workshop.auth.dto.WxLoginDTO;
import com.workshop.auth.dto.WxLoginResultDTO;
import com.workshop.common.exception.BusinessException;
import com.workshop.common.utils.JwtUtils;
import com.workshop.module.sys.entity.SysRole;
import com.workshop.module.sys.entity.SysUser;
import com.workshop.module.sys.mapper.SysRoleMapper;
import com.workshop.module.sys.mapper.SysUserMapper;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;

@Service
public class WxLoginService {

    @Autowired
    private SysUserMapper sysUserMapper;

    @Autowired
    private SysRoleMapper sysRoleMapper;

    @Autowired
    private BCryptPasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtils jwtUtils;

    @Value("${wx.appid:wx6431ff9669e85e94}")
    private String wxAppid;

    @Value("${wx.secret:your-secret}")
    private String wxSecret;

    @Value("${wx.mock:false}")
    private boolean wxMock;

    private final HttpClient httpClient = HttpClient.newHttpClient();
    private final ObjectMapper objectMapper = new ObjectMapper();

    public WxLoginResultDTO wxLogin(WxLoginDTO dto) {
        if (dto.getCode() == null || dto.getCode().isEmpty()) {
            throw new BusinessException(400, "登录凭证不能为空");
        }

        String openid = getOpenidFromWx(dto.getCode());

        SysUser user = sysUserMapper.selectOne(
                new LambdaQueryWrapper<SysUser>().eq(SysUser::getWxOpenid, openid)
        );

        WxLoginResultDTO result = new WxLoginResultDTO();

        if (user != null && user.getStatus() == 1) {
            List<String> roleCodes = loadRoleCodes(user.getRoleIds());
            String token = jwtUtils.generateToken(user.getId(), user.getUsername(), roleCodes);
            result.setToken(token);
            result.setUserId(String.valueOf(user.getId()));
            result.setUsername(user.getUsername());
            result.setRealName(user.getRealName());
            result.setNeedBind(false);
        } else {
            result.setNeedBind(true);
            result.setUserId(openid);
        }

        return result;
    }

    public LoginResultDTO bindAccount(WxBindDTO dto) {
        if (dto.getUsername() == null || dto.getPassword() == null || dto.getWxOpenid() == null) {
            throw new BusinessException(400, "用户名、密码和openid不能为空");
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

        // 如果已绑定且 openid 未变化，直接返回；否则允许覆盖
        if (user.getWxOpenid() != null && !user.getWxOpenid().isEmpty()) {
            if (user.getWxOpenid().equals(dto.getWxOpenid())) {
                String token = jwtUtils.generateToken(user.getId(), user.getUsername(), roleCodes);
                LoginResultDTO result = new LoginResultDTO();
                result.setToken(token);
                result.setUserId(String.valueOf(user.getId()));
                result.setUsername(user.getUsername());
                result.setRealName(user.getRealName());
                return result;
            }
        }

        user.setWxOpenid(dto.getWxOpenid());
        sysUserMapper.updateById(user);

        String token = jwtUtils.generateToken(user.getId(), user.getUsername(), roleCodes);
        LoginResultDTO result = new LoginResultDTO();
        result.setToken(token);
        result.setUserId(String.valueOf(user.getId()));
        result.setUsername(user.getUsername());
        result.setRealName(user.getRealName());

        return result;
    }

    /** 根据 roleIds 字符串加载角色编码列表 */
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

    private String getOpenidFromWx(String code) {
        if (wxMock) {
            try {
                java.security.MessageDigest md = java.security.MessageDigest.getInstance("MD5");
                byte[] digest = md.digest(code.getBytes(StandardCharsets.UTF_8));
                StringBuilder sb = new StringBuilder();
                for (byte b : digest) {
                    sb.append(String.format("%02x", b));
                }
                return "mock_openid_" + sb.substring(0, 16);
            } catch (Exception e) {
                return "mock_openid_" + code.substring(Math.max(0, code.length() - 16));
            }
        }

        try {
            String url = "https://api.weixin.qq.com/sns/jscode2session"
                    + "?appid=" + URLEncoder.encode(wxAppid, StandardCharsets.UTF_8)
                    + "&secret=" + URLEncoder.encode(wxSecret, StandardCharsets.UTF_8)
                    + "&js_code=" + URLEncoder.encode(code, StandardCharsets.UTF_8)
                    + "&grant_type=authorization_code";

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(url))
                    .GET()
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            JsonNode json = objectMapper.readTree(response.body());

            if (json.has("errcode") && json.get("errcode").asInt() != 0) {
                String errMsg = json.has("errmsg") ? json.get("errmsg").asText() : "未知错误";
                throw new BusinessException(500, "微信登录失败: " + errMsg);
            }

            if (!json.has("openid")) {
                throw new BusinessException(500, "微信登录失败: 未获取到 openid");
            }

            return json.get("openid").asText();
        } catch (BusinessException e) {
            throw e;
        } catch (Exception e) {
            throw new BusinessException(500, "微信登录请求失败: " + e.getMessage());
        }
    }
}
