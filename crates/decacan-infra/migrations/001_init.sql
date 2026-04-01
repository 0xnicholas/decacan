-- 初始迁移：创建键值存储表
-- 用于实现 StoragePort

CREATE TABLE IF NOT EXISTS storage_kv (
    key VARCHAR(255) PRIMARY KEY,
    value TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 索引
CREATE INDEX IF NOT EXISTS idx_storage_kv_updated ON storage_kv(updated_at);
