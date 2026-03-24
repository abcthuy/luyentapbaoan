-- 1. Bảng Math Progress (Lưu dữ liệu người dùng)
CREATE TABLE IF NOT EXISTS math_progress (
    id TEXT PRIMARY KEY, -- SyncID (User ID)
    data JSONB,          -- Dữ liệu học tập (JSON)
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Mở quyền truy cập (Cho phép App đọc/ghi)
ALTER TABLE math_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable all for public" ON math_progress FOR ALL USING (true) WITH CHECK (true);


-- 2. Bảng Leaderboard (Bảng Xếp Hạng)
CREATE TABLE IF NOT EXISTS leaderboard (
    id TEXT PRIMARY KEY,
    name TEXT,
    total_score INTEGER DEFAULT 0,
    last_score INTEGER DEFAULT 0,
    best_time INTEGER DEFAULT 999999,
    tier TEXT,
    is_public BOOLEAN DEFAULT TRUE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Các cột điểm thành phần mới
    math_score INTEGER DEFAULT 0,
    vietnamese_score INTEGER DEFAULT 0,
    english_score INTEGER DEFAULT 0,
    finance_score INTEGER DEFAULT 0
);

-- Mở quyền truy cập
ALTER TABLE leaderboard ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable all for public" ON leaderboard FOR ALL USING (true) WITH CHECK (true);
