-- nowork.click 数据库基础结构初始化脚本
-- 执行前请确认目标数据库已创建（例如：USE nowork;）

CREATE TABLE IF NOT EXISTS hit_ip_cache (
  ip          VARCHAR(45) PRIMARY KEY COMMENT 'IP 地址',
  country     VARCHAR(64) NOT NULL COMMENT '国家',
  province    VARCHAR(64) NOT NULL COMMENT '省份',
  city        VARCHAR(64) NOT NULL COMMENT '城市',
  last_update DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '最近更新时间'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='IP 信息缓存';

CREATE TABLE IF NOT EXISTS stat_total_region (
  country  VARCHAR(64) NOT NULL COMMENT '国家',
  province VARCHAR(64) NOT NULL COMMENT '省份/州',
  city     VARCHAR(64) NOT NULL COMMENT '城市',
  page     VARCHAR(32) NOT NULL COMMENT '页面标识',
  count    BIGINT      NOT NULL DEFAULT 0 COMMENT '累计次数',
  PRIMARY KEY (country, province, city, page)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='累积统计';

CREATE TABLE IF NOT EXISTS stat_daily_region (
  stat_date DATE        NOT NULL COMMENT '统计日期',
  country   VARCHAR(64) NOT NULL COMMENT '国家',
  province  VARCHAR(64) NOT NULL COMMENT '省份/州',
  city      VARCHAR(64) NOT NULL COMMENT '城市',
  page      VARCHAR(32) NOT NULL COMMENT '页面标识',
  count     BIGINT      NOT NULL DEFAULT 0 COMMENT '当日次数',
  PRIMARY KEY (stat_date, country, province, city, page),
  INDEX idx_daily_page (stat_date, page, count)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='每日统计';

CREATE TABLE IF NOT EXISTS phrases (
  id         BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键',
  page       VARCHAR(32) NOT NULL COMMENT '页面标识',
  content    TEXT        NOT NULL COMMENT '短语内容',
  weight     INT         NOT NULL DEFAULT 1 COMMENT '权重',
  created_at DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  INDEX idx_phrase_page (page)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='短语文案';

CREATE TABLE IF NOT EXISTS roles (
  id          INT AUTO_INCREMENT PRIMARY KEY COMMENT '角色ID',
  role_key    VARCHAR(50)  NOT NULL UNIQUE COMMENT '角色唯一标识',
  title       VARCHAR(100) NOT NULL COMMENT '角色名称',
  description TEXT COMMENT '角色描述',
  quote       VARCHAR(200) COMMENT '角色名言',
  icon        VARCHAR(50)  NOT NULL DEFAULT 'fa-user' COMMENT 'FontAwesome图标类名',
  color_from  VARCHAR(20)  NOT NULL DEFAULT '#ef4444' COMMENT '渐变色起点',
  color_to    VARCHAR(20)  NOT NULL DEFAULT '#dc2626' COMMENT '渐变色终点',
  badge       VARCHAR(20) COMMENT '徽章标签',
  level       INT NOT NULL DEFAULT 1 COMMENT '角色等级',
  weight      INT NOT NULL DEFAULT 1 COMMENT '权重',
  is_active   BOOLEAN NOT NULL DEFAULT TRUE COMMENT '是否启用',
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  INDEX idx_role_key (role_key),
  INDEX idx_level (level),
  INDEX idx_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='职场角色配置';

CREATE TABLE IF NOT EXISTS button_click_counters (
  button_id   VARCHAR(64) NOT NULL PRIMARY KEY COMMENT '按钮 ID',
  total_count BIGINT      NOT NULL DEFAULT 0 COMMENT '累计点击次数',
  updated_at  DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '最近一次更新时间',
  created_at  DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='按钮点击累计';

CREATE TABLE IF NOT EXISTS migrations (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(128) NOT NULL,
  executed_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='迁移记录';
