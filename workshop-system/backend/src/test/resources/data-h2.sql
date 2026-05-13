-- 测试种子数据
-- 部门
INSERT INTO sys_department (dept_name, dept_code, parent_id, sort_order) VALUES
('管理部', 'DEPT_ADMIN', 0, 1),
('销售部', 'DEPT_SALES', 0, 2),
('生产部', 'DEPT_PRODUCTION', 0, 3),
('质检部', 'DEPT_QC', 0, 4),
('技术部', 'DEPT_TECH', 0, 5);

-- 角色
INSERT INTO sys_role (role_name, role_code, description) VALUES
('管理员', 'ADMIN', '系统管理员'),
('销售人员', 'SALES', '负责订单管理'),
('生产人员', 'PRODUCTION', '负责生产操作'),
('质检员', 'QC', '负责质量检验');

-- 用户 (密码均为 admin123 的 BCrypt 哈希)
INSERT INTO sys_user (username, password, real_name, phone, dept_id, role_ids, status) VALUES
('admin', '$2b$12$/YozhnTs2ow.am14wOSJVulL7K9ZOFC9gcEhLRnEm3A3h29Ld9WVC', '系统管理员', '13800000000', 1, '1', 1),
('sales01', '$2b$12$/YozhnTs2ow.am14wOSJVulL7K9ZOFC9gcEhLRnEm3A3h29Ld9WVC', '销售张三', '13800000001', 2, '2', 1),
('prod01', '$2b$12$/YozhnTs2ow.am14wOSJVulL7K9ZOFC9gcEhLRnEm3A3h29Ld9WVC', '生产李四', '13800000002', 3, '3', 1),
('qc01', '$2b$12$/YozhnTs2ow.am14wOSJVulL7K9ZOFC9gcEhLRnEm3A3h29Ld9WVC', '质检王五', '13800000003', 4, '4', 1),
('disabled_user', '$2b$12$/YozhnTs2ow.am14wOSJVulL7K9ZOFC9gcEhLRnEm3A3h29Ld9WVC', '禁用用户', '13800000004', 1, '1', 0);

-- 产品
INSERT INTO products (product_code, product_name, product_type, specification, status) VALUES
('BEAM001', '30米预制箱梁', '箱梁', '30m×2.4m×1.6m', 1),
('BEAM002', '25米预制T梁', 'T梁', '25m×1.8m×1.5m', 1),
('BEAM003', '20米空心板', '空心板', '20m×1.24m×0.9m', 1),
('BEAM_DISABLED', '停用产品', '箱梁', '测试', 0);

-- 订单
INSERT INTO orders (order_no, customer_name, order_date, status, created_by) VALUES
('ORD-2026-001', '测试客户A', CURRENT_TIMESTAMP, 1, 1),
('ORD-2026-002', '测试客户B', CURRENT_TIMESTAMP, 0, 1),
('ORD-2026-003', '已完成订单', CURRENT_TIMESTAMP, 2, 1);

-- 订单明细
INSERT INTO order_items (order_id, product_id, quantity, unit_price, subtotal, production_status) VALUES
(1, 1, 10, 5000.00, 50000.00, 1),
(1, 2, 5, 3000.00, 15000.00, 0);

-- 订单附件
INSERT INTO order_files (order_id, file_name, file_path, file_size, file_type) VALUES
(1, 'test-drawing.pdf', '/uploads/test-drawing.pdf', 102400, 'PDF');

-- 生产环节
INSERT INTO production_stages (stage_code, stage_name, stage_seq, description, need_qc, need_photo, estimated_hours, status) VALUES
('STAGE_REBAR', '钢筋绑扎', 1, '钢筋加工与绑扎成型', 1, 1, 8.00, 1),
('STAGE_FORMWORK', '模板安装', 2, '模板安装与校正', 1, 1, 6.00, 1),
('STAGE_POURING', '混凝土浇筑', 3, '混凝土搅拌、浇筑与振捣', 1, 1, 4.00, 1),
('STAGE_CURING', '养护', 4, '混凝土养护', 0, 0, 72.00, 1),
('STAGE_TENSIONING', '张拉', 5, '预应力张拉', 1, 1, 8.00, 1),
('STAGE_GROUTING', '压浆', 6, '孔道压浆', 1, 1, 4.00, 1),
('STAGE_FINISHED', '成品', 7, '成品检验与出厂', 1, 1, 2.00, 1),
('STAGE_DISABLED', '停用环节', 8, '测试停用', 0, 0, 1.00, 0);

-- 二维码 (不同状态)
INSERT INTO qr_codes (qr_content, order_item_id, product_id, serial_no, current_stage_id, status, generated_by, generated_at) VALUES
('ORD-2026-001-BEAM001-20260101-0001', 1, 1, '0001', 1, 1, 1, CURRENT_TIMESTAMP),
('ORD-2026-001-BEAM001-20260101-0002', 1, 1, '0002', 2, 1, 1, CURRENT_TIMESTAMP),
('ORD-2026-001-BEAM002-20260101-0003', 2, 2, '0003', NULL, 0, 1, CURRENT_TIMESTAMP),
('ORD-2026-001-BEAM001-20260101-0004', 1, 1, '0004', 7, 2, 1, CURRENT_TIMESTAMP);

-- 生产流转记录 (今天产生的)
INSERT INTO production_records (record_no, qr_code_id, order_item_id, stage_id, operator_id, scan_time, created_at) VALUES
('REC-2026-001', 1, 1, 1, 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('REC-2026-002', 2, 1, 1, 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
