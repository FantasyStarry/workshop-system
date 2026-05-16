# Workshop Management System - 车间管理系统

一套面向预制构件车间的生产管理系统，支持订单管理、产品追溯、二维码扫码报工、数据统计等功能。

## 项目架构

```
workshop-system/
├── backend/          # Spring Boot 后端服务
├── frontend/         # React + Ant Design 管理后台
├── mini-program/     # 微信小程序（扫码报工）
└── sql/              # 数据库脚本
```

## 技术栈

### 后端

- **框架**：Spring Boot 3.2.5 (Java 17)
- **ORM**：MyBatis-Plus 3.5.9
- **数据库**：MySQL 8.0
- **认证**：JWT + Spring Security
- **API文档**：Knife4j (Swagger)
- **二维码**：ZXing
- **工具库**：Hutool 5.8

### 前端

- **框架**：React 18 + TypeScript
- **构建工具**：Vite 5.4
- **UI组件**：Ant Design 5.17
- **图表**：@ant-design/charts
- **状态管理**：Zustand
- **HTTP客户端**：Axios
- **路由**：React Router 6

### 微信小程序

- 原生微信小程序
- 支持扫码、报工、进度查看

## 功能模块

### 1. 系统管理

| 模块 | 功能 |
|------|------|
| 用户管理 | 用户CRUD、角色分配、状态启用/禁用 |
| 角色管理 | 角色CRUD、权限配置 |
| 部门管理 | 组织架构管理、树形结构展示 |

### 2. 订单管理

- 订单创建、编辑、删除
- 订单状态流转（待确认 → 生产中 → 已完成 → 已取消）
- 订单附件上传（图纸、PDF）
- 订单明细管理（关联产品）

### 3. 产品管理

- 产品库维护
- 产品类型：箱梁、T梁、空心板
- 规格参数管理（长、宽、高、混凝土标号等）
- 技术参数扩展

### 4. 生产管理

- 生产环节定义与排序
- 工序流转记录
- 扫码报工（微信小程序）
- 质检记录（拍照、温度、湿度）
- 实时生产进度追踪

### 5. 二维码追溯

- 自动生成产品二维码
- 二维码打印
- 全流程追溯
- 报废管理

### 6. 数据统计

- 今日扫码次数
- 在产订单数
- 月完成产品数
- 各环节在制品分布
- 近7天扫码趋势

## 快速开始

### 环境要求

- JDK 17+
- Node.js 18+
- MySQL 8.0
- Maven 3.6+
- 微信开发者工具（小程序）

### 1. 数据库初始化

**方式一：使用 Docker**

```bash
cd workshop-system
docker-compose up -d
```

**方式二：手动导入**

```bash
mysql -u root -p < sql/01-schema.sql
mysql -u root -p < sql/02-init-data.sql
mysql -u root -p < sql/03-position-tables.sql
```

### 2. 后端启动

```bash
cd backend

# 复制配置
cp src/main/resources/application.yml.example src/main/resources/application.yml
# 编辑 application.yml，修改数据库连接和 JWT secret

# 启动
mvn spring-boot:run
```

后端地址：http://localhost:8080
API文档：http://localhost:8080/swagger-ui.html

### 3. 前端启动

```bash
cd frontend

# 安装依赖
npm install

# 开发模式
npm run dev
```

前端地址：http://localhost:5173

### 4. 微信小程序

1. 使用微信开发者工具打开 `mini-program` 目录
2. 修改 `utils/api.js` 中的接口地址
3. 配置小程序 AppID

## 默认账号

| 角色 | 用户名 | 密码 |
|------|--------|------|
| 管理员 | admin | admin123 |
| 车间主任 | director | director123 |
| 工人 | worker | worker123 |

## 核心业务流程

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   创建订单   │───▶│  关联产品    │───▶│  生成二维码  │───▶│  打印贴标   │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
                                                                    │
        ┌───────────────────────────────────────────────────────────┘
        ▼
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   扫码报工   │───▶│  质检记录   │───▶│  下一工序   │───▶│   完成     │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
```

## 项目结构

### 后端结构

```
backend/src/main/java/com/workshop/
├── auth/                 # 认证授权
│   ├── annotation/       # 自定义注解（@RequireRoles）
│   ├── constant/         # 角色常量
│   ├── dto/              # 数据传输对象
│   └── JwtInterceptor.java
├── common/              # 公共组件
│   ├── constant/         # 枚举常量
│   ├── exception/        # 异常处理
│   ├── result/           # 统一响应
│   └── utils/            # 工具类
├── config/              # 配置类
│   ├── CorsConfig.java
│   ├── SecurityConfig.java
│   └── SwaggerConfig.java
└── WorkshopApplication.java
```

### 前端结构

```
frontend/src/
├── api/                 # API 接口封装
├── components/          # 通用组件
│   ├── AuthGuard/       # 权限守卫
│   ├── ProTable/        # 高级表格
│   └── QrCodeImage/     # 二维码展示
├── layouts/             # 布局组件
├── pages/               # 页面组件
├── router/              # 路由配置
├── store/               # 状态管理
├── styles/              # 全局样式
└── types/               # TypeScript 类型定义
```

## API 接口

### 认证接口

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | /api/auth/login | 用户登录 |
| POST | /api/auth/logout | 登出 |
| POST | /api/auth/wx/login | 微信登录 |
| POST | /api/auth/wx/bind | 微信绑定 |

### 业务接口

| 模块 | 接口前缀 | 说明 |
|------|----------|------|
| 用户 | /api/users | 用户管理 |
| 订单 | /api/orders | 订单管理 |
| 产品 | /api/products | 产品管理 |
| 二维码 | /api/qrcodes | 二维码管理 |
| 生产记录 | /api/records | 生产流转 |
| 工序 | /api/stages | 生产环节 |

## 微信小程序功能

- **扫码报工**：扫描产品二维码进行报工
- **生产报工**：填写报工信息（位置、温度、湿度、拍照）
- **进度查看**：查看产品生产进度
- **数据上报**：生产数据实时上报

## 配置说明

### application.yml 关键配置

```yaml
server:
  port: 8080

spring:
  datasource:
    url: jdbc:mysql://localhost:3306/workshop_db
    username: root
    password: your_password

jwt:
  secret: your-secret-key  # 生产环境请修改
  expiration: 86400000      # 24小时

wx:
  appid: your_wx_appid     # 微信小程序 AppID
  secret: your_wx_secret   # 微信小程序 Secret
  mock: true                # 生产环境设为 false
```

## 数据库表

| 表名 | 说明 |
|------|------|
| sys_department | 部门表 |
| sys_role | 角色表 |
| sys_user | 用户表 |
| orders | 订单表 |
| order_files | 订单附件表 |
| products | 产品库表 |
| order_items | 订单明细表 |
| production_stages | 生产环节表 |
| production_records | 生产流转记录表 |
| qr_codes | 二维码表 |
| positions | 工位表 |
| position_stages | 工位-环节关联表 |

## 开发指南

### 添加新的业务模块

1. **后端**
   - 创建 Entity 实体类
   - 创建 Mapper 接口
   - 创建 Service 服务层
   - 创建 Controller 控制器
   - 添加权限注解 `@RequireRoles`

2. **前端**
   - 在 `api/` 添加接口封装
   - 在 `pages/` 创建页面组件
   - 在 `router/routes.ts` 添加路由配置
   - 在 `types/` 添加类型定义

3. **数据库**
   - 添加对应的表结构
   - 更新 SQL 脚本

### 权限控制

使用 `@RequireRoles` 注解控制接口权限：

```java
@RequireRoles({"ADMIN", "DIRECTOR"})
@PostMapping("/create")
public Result<?> create() {
    // ...
}
```

## License

MIT License
