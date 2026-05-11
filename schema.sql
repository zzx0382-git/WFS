-- 创建心声表
CREATE TABLE echos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 创建回复表
CREATE TABLE replies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  echo_id UUID REFERENCES echos(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 为 echos 表创建索引
CREATE INDEX idx_echos_created_at ON echos(created_at DESC);

-- 为 replies 表创建索引
CREATE INDEX idx_replies_echo_id ON replies(echo_id);
CREATE INDEX idx_replies_created_at ON replies(created_at DESC);

-- 启用 RLS (Row Level Security)
ALTER TABLE echos ENABLE ROW LEVEL SECURITY;
ALTER TABLE replies ENABLE ROW LEVEL SECURITY;

-- 创建策略：允许所有人读取
CREATE POLICY "Allow public read access to echos" ON echos
  FOR SELECT USING (true);

CREATE POLICY "Allow public read access to replies" ON replies
  FOR SELECT USING (true);

-- 创建策略：允许所有人插入
CREATE POLICY "Allow public insert access to echos" ON echos
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public insert access to replies" ON replies
  FOR INSERT WITH CHECK (true);

-- 创建策略：允许所有人删除自己的数据（可选）
CREATE POLICY "Allow public delete access to echos" ON echos
  FOR DELETE USING (true);

CREATE POLICY "Allow public delete access to replies" ON replies
  FOR DELETE USING (true);