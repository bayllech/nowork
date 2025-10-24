-- 设置字符集
SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;

-- 删除旧表
DROP TABLE IF EXISTS roles;

-- 重新创建roles表，包含完整的中文字段描述
CREATE TABLE roles (
  id INT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
  role_key VARCHAR(50) NOT NULL UNIQUE COMMENT '角色唯一标识',
  title VARCHAR(100) NOT NULL COMMENT '角色标题',
  description TEXT COMMENT '角色描述',
  quote VARCHAR(200) COMMENT '经典吐槽',
  icon VARCHAR(50) NOT NULL DEFAULT 'fa-user' COMMENT 'FontAwesome图标类名',
  color_from VARCHAR(20) NOT NULL DEFAULT '#ef4444' COMMENT '渐变色起始',
  color_to VARCHAR(20) NOT NULL DEFAULT '#dc2626' COMMENT '渐变色结束',
  badge VARCHAR(20) COMMENT '徽标文字',
  level INT NOT NULL DEFAULT 1 COMMENT '角色等级',
  weight INT NOT NULL DEFAULT 1 COMMENT '权重（用于排序）',
  is_active BOOLEAN NOT NULL DEFAULT TRUE COMMENT '是否启用',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  INDEX idx_role_key (role_key),
  INDEX idx_level (level),
  INDEX idx_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='怒气角色定义表';