-- H2 兼容建表脚本 (MySQL 兼容模式)
-- 部门表
CREATE TABLE IF NOT EXISTS sys_department (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    dept_name VARCHAR(64) NOT NULL,
    dept_code VARCHAR(32) NOT NULL,
    parent_id BIGINT DEFAULT 0,
    sort_order INT DEFAULT 0,
    status TINYINT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (dept_name),
    UNIQUE (dept_code)
);

-- 角色表
CREATE TABLE IF NOT EXISTS sys_role (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    role_name VARCHAR(64) NOT NULL,
    role_code VARCHAR(32) NOT NULL,
    description VARCHAR(255) DEFAULT NULL,
    status TINYINT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (role_name),
    UNIQUE (role_code)
);

-- 用户表
CREATE TABLE IF NOT EXISTS sys_user (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(64) NOT NULL,
    password VARCHAR(256) NOT NULL,
    real_name VARCHAR(64) NOT NULL,
    phone VARCHAR(20) DEFAULT NULL,
    email VARCHAR(128) DEFAULT NULL,
    avatar VARCHAR(512) DEFAULT NULL,
    dept_id BIGINT DEFAULT NULL,
    role_ids VARCHAR(255) DEFAULT NULL,
    status TINYINT DEFAULT 1,
    last_login_ip VARCHAR(64) DEFAULT NULL,
    last_login_time TIMESTAMP DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (username)
);

-- 订单表
CREATE TABLE IF NOT EXISTS orders (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_no VARCHAR(64) NOT NULL,
    customer_name VARCHAR(128) NOT NULL,
    customer_contact VARCHAR(64) DEFAULT NULL,
    customer_phone VARCHAR(20) DEFAULT NULL,
    customer_address VARCHAR(256) DEFAULT NULL,
    order_date TIMESTAMP NOT NULL,
    delivery_date TIMESTAMP DEFAULT NULL,
    total_amount DECIMAL(12,2) DEFAULT 0.00,
    status TINYINT NOT NULL DEFAULT 0,
    remark VARCHAR(512) DEFAULT NULL,
    created_by BIGINT DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (order_no)
);

-- 订单附件表
CREATE TABLE IF NOT EXISTS order_files (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_id BIGINT NOT NULL,
    file_name VARCHAR(256) NOT NULL,
    file_path VARCHAR(512) NOT NULL,
    file_size BIGINT DEFAULT 0,
    file_type VARCHAR(32) DEFAULT NULL,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_order_files_order_id ON order_files(order_id);

-- 产品库表
CREATE TABLE IF NOT EXISTS products (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    product_code VARCHAR(64) NOT NULL,
    product_name VARCHAR(128) NOT NULL,
    product_type VARCHAR(64) DEFAULT NULL,
    specification VARCHAR(256) DEFAULT NULL,
    beam_length DECIMAL(10,2) DEFAULT NULL,
    beam_width DECIMAL(10,2) DEFAULT NULL,
    beam_height DECIMAL(10,2) DEFAULT NULL,
    concrete_grade VARCHAR(32) DEFAULT NULL,
    steel_spec VARCHAR(128) DEFAULT NULL,
    prestress_spec VARCHAR(128) DEFAULT NULL,
    unit_weight DECIMAL(10,2) DEFAULT NULL,
    batch_no VARCHAR(64) DEFAULT NULL,
    technical_params CLOB DEFAULT NULL,
    drawing_file VARCHAR(512) DEFAULT NULL,
    status TINYINT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (product_code)
);

-- 订单明细表
CREATE TABLE IF NOT EXISTS order_items (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_id BIGINT NOT NULL,
    product_id BIGINT NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    unit_price DECIMAL(12,2) DEFAULT 0.00,
    subtotal DECIMAL(12,2) DEFAULT 0.00,
    production_status TINYINT DEFAULT 0,
    sort_order INT DEFAULT 0,
    remark VARCHAR(255) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id);

-- 生产环节定义表
CREATE TABLE IF NOT EXISTS production_stages (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    stage_code VARCHAR(32) NOT NULL,
    stage_name VARCHAR(64) NOT NULL,
    stage_seq INT NOT NULL,
    description VARCHAR(255) DEFAULT NULL,
    need_qc TINYINT DEFAULT 0,
    need_photo TINYINT DEFAULT 0,
    estimated_hours DECIMAL(6,2) DEFAULT NULL,
    status TINYINT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (stage_code)
);

-- 生产流转记录表
CREATE TABLE IF NOT EXISTS production_records (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    record_no VARCHAR(64) NOT NULL,
    qr_code_id BIGINT NOT NULL,
    order_item_id BIGINT NOT NULL,
    stage_id BIGINT NOT NULL,
    operator_id BIGINT NOT NULL,
    scan_time TIMESTAMP NOT NULL,
    location VARCHAR(128) DEFAULT NULL,
    temperature DECIMAL(5,2) DEFAULT NULL,
    humidity DECIMAL(5,2) DEFAULT NULL,
    photo_url VARCHAR(512) DEFAULT NULL,
    qc_result TINYINT DEFAULT 0,
    qc_user_id BIGINT DEFAULT NULL,
    qc_time TIMESTAMP DEFAULT NULL,
    qc_remark VARCHAR(255) DEFAULT NULL,
    remark VARCHAR(255) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (record_no)
);
CREATE INDEX IF NOT EXISTS idx_pr_qr_stage ON production_records(qr_code_id, stage_id);
CREATE INDEX IF NOT EXISTS idx_pr_order_item ON production_records(order_item_id);

-- 二维码记录表
CREATE TABLE IF NOT EXISTS qr_codes (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    qr_content VARCHAR(256) NOT NULL,
    order_item_id BIGINT NOT NULL,
    product_id BIGINT NOT NULL,
    serial_no VARCHAR(16) NOT NULL,
    batch_no VARCHAR(64) DEFAULT NULL,
    qr_image_path VARCHAR(512) DEFAULT NULL,
    current_stage_id BIGINT DEFAULT NULL,
    status TINYINT DEFAULT 0,
    generated_by BIGINT DEFAULT NULL,
    generated_at TIMESTAMP NOT NULL,
    printed_at TIMESTAMP DEFAULT NULL,
    scrap_reason VARCHAR(255) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (qr_content)
);
