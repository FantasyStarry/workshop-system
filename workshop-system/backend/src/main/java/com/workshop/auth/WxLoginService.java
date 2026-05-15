package com.workshop.auth;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.workshop.auth.dto.LoginResultDTO;
import com.workshop.auth.dto.WxBindDTO;
import com.workshop.auth.dto.WxLoginDTO;
import com.workshop.auth.dto.WxLoginResultDTO;
import com.workshop.common.exception.BusinessException;
import com.workshop.common.utils.JwtUtils;
import com.workshop.module.sys.entity.SysUser;
import com.workshop.module.sys.mapper.SysUserMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class WxLoginService {

    @Autowired
    private SysUserMapper sysUserMapper;

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
            String token = jwtUtils.generateToken(user.getId(), user.getUsername());
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

        if (user.getWxOpenid() != null && !user.getWxOpenid().isEmpty()) {
            if (!wxMock) {
                throw new BusinessException(400, "该账号已绑定其他微信");
            }
        }

        user.setWxOpenid(dto.getWxOpenid());
        sysUserMapper.updateById(user);

        String token = jwtUtils.generateToken(user.getId(), user.getUsername());
        LoginResultDTO result = new LoginResultDTO();
        result.setToken(token);
        result.setUserId(String.valueOf(user.getId()));
        result.setUsername(user.getUsername());
        result.setRealName(user.getRealName());

        return result;
    }

    private String getOpenidFromWx(String code) {
        if (wxMock) {
            try {
                java.security.MessageDigest md = java.security.MessageDigest.getInstance("MD5");
                byte[] digest = md.digest(code.getBytes());
                StringBuilder sb = new StringBuilder();
                for (byte b : digest) {
                    sb.append(String.format("%02x", b));
                }
                return "mock_openid_" + sb.substring(0, 16);
            } catch (Exception e) {
                return "mock_openid_" + code.substring(code.length() - 16);
            }
        }
        return "mock_openid_" + code.substring(code.length() - 16);
    }
}
