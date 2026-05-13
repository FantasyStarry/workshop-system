-- =============================================
-- 车间管理系统 - 数据库建表脚本
-- =============================================

CREATE DATABASE IF NOT EXISTS workshop_db
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_general_ci;

USE workshop_db;

-- =============================================
-- 1. 部门表
-- =============================================
DROP TABLE IF EXISTS `sys_department`;
CREATE TABLE `sys_department` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键',
  `dept_name` VARCHAR(64) NOT NULL COMMENT '部门名称',
  `dept_code` VARCHAR(32) NOT NULL COMMENT '部门编码',
  `parent_id` BIGINT DEFAULT 0 COMMENT '上级部门ID',
  `sort_order` INT DEFAULT 0 COMMENT '排序',
  `status` TINYINT DEFAULT 1 COMMENT '0=禁用 1=启用',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_dept_name` (`dept_name`),
  UNIQUE KEY `uk_dept_code` (`dept_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='部门表';

-- =============================================
-- 2. 角色表
-- =============================================
DROP TABLE IF EXISTS `sys_role`;
CREATE TABLE `sys_role` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键',
  `role_name` VARCHAR(64) NOT NULL COMMENT '角色名称',
  `role_code` VARCHAR(32) NOT NULL COMMENT '角色编码',
  `description` VARCHAR(255) DEFAULT NULL COMMENT '角色描述',
  `status` TINYINT DEFAULT 1 COMMENT '0=禁用 1=启用',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_role_name` (`role_name`),
  UNIQUE KEY `uk_role_code` (`role_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='角色表';

-- =============================================
-- 3. 用户表
-- =============================================
DROP TABLE IF EXISTS `sys_user`;
CREATE TABLE `sys_user` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键',
  `username` VARCHAR(64) NOT NULL COMMENT '登录账号',
  `password` VARCHAR(256) NOT NULL COMMENT 'BCrypt加密',
  `real_name` VARCHAR(64) NOT NULL COMMENT '真实姓名',
  `phone` VARCHAR(20) DEFAULT NULL COMMENT '手机号',
  `email` VARCHAR(128) DEFAULT NULL COMMENT '邮箱',
  `avatar` VARCHAR(512) DEFAULT NULL COMMENT '头像URL',
  `dept_id` BIGINT DEFAULT NULL COMMENT '所属部门ID',
  `role_ids` VARCHAR(255) DEFAULT NULL COMMENT '角色ID列表，逗号分隔',
  `status` TINYINT DEFAULT 1 COMMENT '0=禁用 1=启用',
  `last_login_ip` VARCHAR(64) DEFAULT NULL COMMENT '最后登录IP',
  `last_login_time` DATETIME DEFAULT NULL COMMENT '最后登录时间',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_username` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户表';

-- =============================================
-- 4. 订单表
-- =============================================
DROP TABLE IF EXISTS `orders`;
CREATE TABLE `orders` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键',
  `order_no` VARCHAR(64) NOT NULL COMMENT '订单号',
  `customer_name` VARCHAR(128) NOT NULL COMMENT '客户名称',
  `customer_contact` VARCHAR(64) DEFAULT NULL COMMENT '客户联系人',
  `customer_phone` VARCHAR(20) DEFAULT NULL COMMENT '客户联系电话',
  `customer_address` VARCHAR(256) DEFAULT NULL COMMENT '客户地址',
  `order_date` DATETIME NOT NULL COMMENT '下单时间',
  `delivery_date` DATETIME DEFAULT NULL COMMENT '要求交货日期',
  `total_amount` DECIMAL(12,2) DEFAULT 0.00 COMMENT '订单总金额',
  `status` TINYINT NOT NULL DEFAULT 0 COMMENT '0=待确认 1=生产中 2=已完成 3=已取消',
  `remark` VARCHAR(512) DEFAULT NULL COMMENT '备注',
  `created_by` BIGINT DEFAULT NULL COMMENT '创建人ID',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_order_no` (`order_no`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='订单表';

-- =============================================
-- 5. 订单附件表
-- =============================================
DROP TABLE IF EXISTS `order_files`;
CREATE TABLE `order_files` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键',
  `order_id` BIGINT NOT NULL COMMENT '所属订单ID',
  `file_name` VARCHAR(256) NOT NULL COMMENT '原始文件名',
  `file_path` VARCHAR(512) NOT NULL COMMENT '存储路径',
  `file_size` BIGINT DEFAULT 0 COMMENT '文件大小（字节）',
  `file_type` VARCHAR(32) DEFAULT NULL COMMENT '文件类型：IMAGE/PDF/DWG',
  `sort_order` INT DEFAULT 0 COMMENT '排序',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '上传时间',
  PRIMARY KEY (`id`),
  KEY `idx_order_id` (`order_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='订单附件表';

-- =============================================
-- 6. 产品库表
-- =============================================
DROP TABLE IF EXISTS `products`;
CREATE TABLE `products` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键',
  `product_code` VARCHAR(64) NOT NULL COMMENT '产品编号',
  `product_name` VARCHAR(128) NOT NULL COMMENT '产品名称',
  `product_type` VARCHAR(64) DEFAULT NULL COMMENT '产品类型：箱梁/T梁/空心板',
  `specification` VARCHAR(256) DEFAULT NULL COMMENT '规格型号',
  `beam_length` DECIMAL(10,2) DEFAULT NULL COMMENT '梁体长度（米）',
  `beam_width` DECIMAL(10,2) DEFAULT NULL COMMENT '梁体宽度（米）',
  `beam_height` DECIMAL(10,2) DEFAULT NULL COMMENT '梁体高度（米）',
  `concrete_grade` VARCHAR(32) DEFAULT NULL COMMENT '混凝土标号',
  `steel_spec` VARCHAR(128) DEFAULT NULL COMMENT '钢筋规格',
  `prestress_spec` VARCHAR(128) DEFAULT NULL COMMENT '预应力规格',
  `unit_weight` DECIMAL(10,2) DEFAULT NULL COMMENT '单件重量（吨）',
  `batch_no` VARCHAR(64) DEFAULT NULL COMMENT '批次号',
  `technical_params` TEXT DEFAULT NULL COMMENT '技术参数JSON扩展',
  `drawing_file` VARCHAR(512) DEFAULT NULL COMMENT '图纸文件路径',
  `status` TINYINT DEFAULT 1 COMMENT '0=停用 1=启用',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_product_code` (`product_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='产品库表';

-- =============================================
-- 7. 订单明细表（订单-产品关联）
-- =============================================
DROP TABLE IF EXISTS `order_items`;
CREATE TABLE `order_items` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键',
  `order_id` BIGINT NOT NULL COMMENT '订单ID',
  `product_id` BIGINT NOT NULL COMMENT '产品ID',
  `quantity` INT NOT NULL DEFAULT 1 COMMENT '数量',
  `unit_price` DECIMAL(12,2) DEFAULT 0.00 COMMENT '单价',
  `subtotal` DECIMAL(12,2) DEFAULT 0.00 COMMENT '小计金额',
  `production_status` TINYINT DEFAULT 0 COMMENT '生产状态：0=待生产 1=生产中 2=已完成',
  `sort_order` INT DEFAULT 0 COMMENT '排序',
  `remark` VARCHAR(255) DEFAULT NULL COMMENT '备注',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`),
  KEY `idx_order_id` (`order_id`),
  KEY `idx_product_id` (`product_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='订单明细表';

-- =============================================
-- 8. 生产环节定义表
-- =============================================
DROP TABLE IF EXISTS `production_stages`;
CREATE TABLE `production_stages` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键',
  `stage_code` VARCHAR(32) NOT NULL COMMENT '环节编码',
  `stage_name` VARCHAR(64) NOT NULL COMMENT '环节名称',
  `stage_seq` INT NOT NULL COMMENT '环节序号（决定生产顺序）',
  `description` VARCHAR(255) DEFAULT NULL COMMENT '环节说明',
  `need_qc` TINYINT DEFAULT 0 COMMENT '是否需要质检：0=否 1=是',
  `need_photo` TINYINT DEFAULT 0 COMMENT '是否需要拍照上传',
  `estimated_hours` DECIMAL(6,2) DEFAULT NULL COMMENT '预估工时（小时）',
  `status` TINYINT DEFAULT 1 COMMENT '0=停用 1=启用',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_stage_code` (`stage_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='生产环节定义表';

-- =============================================
-- 9. 生产流转记录表（核心业务表）
-- =============================================
DROP TABLE IF EXISTS `production_records`;
CREATE TABLE `production_records` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键',
  `record_no` VARCHAR(64) NOT NULL COMMENT '记录编号',
  `qr_code_id` BIGINT NOT NULL COMMENT '二维码ID',
  `order_item_id` BIGINT NOT NULL COMMENT '订单明细ID',
  `stage_id` BIGINT NOT NULL COMMENT '生产环节ID',
  `operator_id` BIGINT NOT NULL COMMENT '操作人ID',
  `scan_time` DATETIME NOT NULL COMMENT '扫码时间',
  `location` VARCHAR(128) DEFAULT NULL COMMENT '作业位置/工位',
  `temperature` DECIMAL(5,2) DEFAULT NULL COMMENT '温度记录',
  `humidity` DECIMAL(5,2) DEFAULT NULL COMMENT '湿度记录',
  `photo_url` VARCHAR(512) DEFAULT NULL COMMENT '现场拍照URL',
  `qc_result` TINYINT DEFAULT 0 COMMENT '质检结果：0=未检 1=通过 2=不通过',
  `qc_user_id` BIGINT DEFAULT NULL COMMENT '质检人ID',
  `qc_time` DATETIME DEFAULT NULL COMMENT '质检时间',
  `qc_remark` VARCHAR(255) DEFAULT NULL COMMENT '质检备注',
  `remark` VARCHAR(255) DEFAULT NULL COMMENT '备注',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_record_no` (`record_no`),
  KEY `idx_qr_code_stage` (`qr_code_id`, `stage_id`),
  KEY `idx_order_item` (`order_item_id`),
  KEY `idx_operator_time` (`operator_id`, `scan_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='生产流转记录表';

-- =============================================
-- 10. 二维码记录表
-- =============================================
DROP TABLE IF EXISTS `qr_codes`;
CREATE TABLE `qr_codes` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键',
  `qr_content` VARCHAR(256) NOT NULL COMMENT '二维码内容（编码字符串）',
  `order_item_id` BIGINT NOT NULL COMMENT '订单明细ID',
  `product_id` BIGINT NOT NULL COMMENT '产品ID',
  `serial_no` VARCHAR(16) NOT NULL COMMENT '4位序列号',
  `batch_no` VARCHAR(64) DEFAULT NULL COMMENT '批次号',
  `qr_image_path` VARCHAR(512) DEFAULT NULL COMMENT '生成的二维码图片路径',
  `current_stage_id` BIGINT DEFAULT NULL COMMENT '当前所在环节ID',
  `status` TINYINT DEFAULT 0 COMMENT '0=待生产 1=生产中 2=已完成 3=报废',
  `generated_by` BIGINT DEFAULT NULL COMMENT '生成人ID',
  `generated_at` DATETIME NOT NULL COMMENT '生成时间',
  `printed_at` DATETIME DEFAULT NULL COMMENT '打印时间',
  `scrap_reason` VARCHAR(255) DEFAULT NULL COMMENT '报废原因',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_qr_content` (`qr_content`),
  KEY `idx_order_item` (`order_item_id`),
  KEY `idx_product` (`product_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='二维码记录表';
