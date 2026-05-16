package com.workshop.auth.annotation;

import java.lang.annotation.*;

/**
 * 标注在 Controller 方法或类上，声明该接口需要哪些角色才能访问。
 * <p>
 * 使用示例：
 * <pre>{@code
 * @RequireRoles(RoleConstant.PRODUCTION)
 * @PutMapping("/{id}/status")
 * public Result<?> updateStatus(...) { ... }
 * }</pre>
 */
@Target({ElementType.METHOD, ElementType.TYPE})
@Retention(RetentionPolicy.RUNTIME)
@Documented
public @interface RequireRoles {

    /**
     * 允许访问的角色编码列表（OR 关系），满足其一即可。
     */
    String[] value();
}
