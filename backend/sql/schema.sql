-- nowork.click 数据库基础结构初始化脚本
-- 运行前请确认数据库已创建，并切换至目标库（USE nowork;）

CREATE TABLE IF NOT EXISTS hit_ip_cache (
  ip            VARCHAR(45) PRIMARY KEY COMMENT 'IP 地址',
  country       VARCHAR(64) NOT NULL COMMENT '国家',
  province      VARCHAR(64) NOT NULL COMMENT '省份',
  city          VARCHAR(64) NOT NULL COMMENT '城市',
  last_update   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '最后更新时间'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='IP 地理信息缓存';

CREATE TABLE IF NOT EXISTS stat_total_region (
  country   VARCHAR(64) NOT NULL COMMENT '国家',
  province  VARCHAR(64) NOT NULL COMMENT '省份/州',
  city      VARCHAR(64) NOT NULL COMMENT '城市',
  page      VARCHAR(32) NOT NULL COMMENT '页面分类',
  count     BIGINT      NOT NULL DEFAULT 0 COMMENT '累计敲击次数',
  PRIMARY KEY (country, province, city, page)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='累计榜单';

CREATE TABLE IF NOT EXISTS stat_daily_region (
  stat_date DATE        NOT NULL COMMENT '统计日期',
  country   VARCHAR(64) NOT NULL COMMENT '国家',
  province  VARCHAR(64) NOT NULL COMMENT '省份/州',
  city      VARCHAR(64) NOT NULL COMMENT '城市',
  page      VARCHAR(32) NOT NULL COMMENT '页面分类',
  count     BIGINT      NOT NULL DEFAULT 0 COMMENT '当日敲击次数',
  PRIMARY KEY (stat_date, country, province, city, page),
  INDEX idx_daily_page (stat_date, page, count)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='每日榜单';

CREATE TABLE IF NOT EXISTS phrases (
  id        BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键',
  page      VARCHAR(32) NOT NULL COMMENT '页面分类',
  content   TEXT        NOT NULL COMMENT '吐槽文案',
  weight    INT         NOT NULL DEFAULT 1 COMMENT '权重，控制抽样概率',
  created_at DATETIME   NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  INDEX idx_phrase_page (page)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='吐槽文案池';

CREATE TABLE IF NOT EXISTS migrations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(128) NOT NULL,
  executed_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='简易迁移记录表';
