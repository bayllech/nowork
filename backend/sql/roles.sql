-- 角色定义表
CREATE TABLE IF NOT EXISTS roles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  role_key VARCHAR(50) NOT NULL UNIQUE,
  title VARCHAR(100) NOT NULL COMMENT '角色标题',
  description TEXT COMMENT '角色描述',
  quote VARCHAR(200) COMMENT '经典吐槽',
  icon VARCHAR(50) NOT NULL DEFAULT 'fa-user' COMMENT 'FontAwesome图标类名',
  color_from VARCHAR(20) NOT NULL DEFAULT '#ef4444' COMMENT '渐变色起始',
  color_to VARCHAR(20) NOT NULL DEFAULT '#dc2626' COMMENT '渐变色结束',
  badge VARCHAR(20) COMMENT '徽标',
  level INT NOT NULL DEFAULT 1 COMMENT '等级',
  weight INT NOT NULL DEFAULT 1 COMMENT '权重',
  is_active BOOLEAN NOT NULL DEFAULT TRUE COMMENT '是否启用',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_role_key (role_key),
  INDEX idx_level (level),
  INDEX idx_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='怒气角色定义表';