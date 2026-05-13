-- =============================================
-- 岗位管理表
-- =============================================
CREATE TABLE IF NOT EXISTS `sys_position` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键',
    `position_name` VARCHAR(64) NOT NULL COMMENT '岗位名称',
    `position_code` VARCHAR(32) NOT NULL COMMENT '岗位编码',
    `dept_id` BIGINT DEFAULT NULL COMMENT '所属部门ID',
    `description` VARCHAR(255) DEFAULT NULL COMMENT '描述',
    `sort_order` INT DEFAULT 0 COMMENT '排序序号',
    `status` TINYINT DEFAULT 1 COMMENT '状态：0=禁用，1=启用',
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_position_code` (`position_code`),
    KEY `idx_dept_id` (`dept_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='岗位管理';

-- =============================================
-- 环节-岗位关联表
-- =============================================
CREATE TABLE IF NOT EXISTS `stage_position` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键',
    `stage_id` BIGINT NOT NULL COMMENT '环节ID',
    `position_id` BIGINT NOT NULL COMMENT '岗位ID',
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_stage_position` (`stage_id`, `position_id`),
    KEY `idx_position_id` (`position_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='环节-岗位关联';

-- =============================================
-- 初始化岗位数据（隶属部门：3=生产部，4=质检部）
-- =============================================
INSERT INTO `sys_position` (`position_name`, `position_code`, `dept_id`, `description`, `sort_order`) VALUES
('钢筋工',     'POS_STEEL',    3, '负责钢筋加工与绑扎成型',       1),
('模板工',     'POS_FORM',     3, '负责模板安装与校正',           2),
('浇筑工',     'POS_POUR',     3, '负责混凝土搅拌、浇筑与振捣',   3),
('养护工',     'POS_CURE',     3, '负责混凝土养护（自然/蒸汽）',  4),
('张拉工',     'POS_TENSION',  3, '负责预应力张拉作业',           5),
('压浆工',     'POS_GROUT',    3, '负责孔道压浆与封锚',           6),
('质检员',     'POS_QC',       4, '负责工序质量检验',             7),
('成品检验员', 'POS_FINAL_QC', 4, '负责成品最终检验与出厂',      8);

-- =============================================
-- 初始化环节-岗位绑定
-- 说明：每个生产环节关联可执行的岗位
--   stage_id 1=钢筋绑扎 → position 1=钢筋工
--   stage_id 2=模板安装 → position 2=模板工
--   stage_id 3=混凝土浇筑 → position 3=浇筑工
--   stage_id 4=养护 → position 4=养护工
--   stage_id 5=张拉 → position 5=张拉工
--   stage_id 6=压浆 → position 6=压浆工
--   stage_id 7=成品检验 → position 8=成品检验员
-- =============================================
INSERT INTO `stage_position` (`stage_id`, `position_id`) VALUES
(1, 1),
(2, 2),
(3, 3),
(4, 4),
(5, 5),
(6, 6),
(7, 8);
