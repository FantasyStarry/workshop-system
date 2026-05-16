package com.workshop.auth;

import com.workshop.auth.annotation.RequireRoles;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.method.HandlerMethod;
import org.springframework.web.servlet.HandlerInterceptor;

import java.util.Arrays;
import java.util.List;

/**
 * 角色权限校验拦截器。
 * <p>
 * 读取 Controller 方法或类上的 {@link RequireRoles} 注解，
 * 检查当前用户的角色是否在允许列表内，不满足则返回 403。
 * <p>
 * 如果没有 {@link RequireRoles} 注解，则放行（不校验权限）。
 */
@Component
public class RoleCheckInterceptor implements HandlerInterceptor {

    @Override
    @SuppressWarnings("unchecked")
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
        if (!(handler instanceof HandlerMethod handlerMethod)) {
            return true;
        }

        // 优先取方法上的注解，再取类上的注解
        RequireRoles roles = handlerMethod.getMethodAnnotation(RequireRoles.class);
        if (roles == null) {
            roles = handlerMethod.getBeanType().getAnnotation(RequireRoles.class);
        }
        if (roles == null) {
            return true; // 没有标注 @RequireRoles 则不校验
        }

        List<String> required = Arrays.asList(roles.value());
        List<String> userRoles = (List<String>) request.getAttribute("roleCodes");

        if (userRoles == null || userRoles.isEmpty()) {
            response.setStatus(HttpServletResponse.SC_FORBIDDEN);
            return false;
        }

        // OR 关系：满足其一即可
        boolean matched = userRoles.stream().anyMatch(required::contains);
        if (!matched) {
            response.setStatus(HttpServletResponse.SC_FORBIDDEN);
            return false;
        }

        return true;
    }
}
