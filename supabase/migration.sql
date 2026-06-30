-- ============================================
-- MyKiv AI — Database Migration
-- Version: 1.0.0
-- Run this in Supabase SQL Editor
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- ENUMS
-- ============================================

CREATE TYPE health_log_type AS ENUM ('meal', 'water', 'sleep', 'exercise', 'medicine', 'mood');
CREATE TYPE meal_type AS ENUM ('breakfast', 'lunch', 'dinner', 'snack');
CREATE TYPE exercise_type AS ENUM ('walking', 'running', 'gym', 'stretching', 'cycling');
CREATE TYPE mood_value AS ENUM ('happy', 'neutral', 'sad', 'stress', 'sick', 'tired');
CREATE TYPE medicine_type AS ENUM ('medicine', 'vitamin', 'supplement');
CREATE TYPE reminder_category AS ENUM ('meal', 'water', 'medicine', 'sleep', 'exercise', 'couple_activity', 'wishlist', 'anniversary', 'expense', 'custom');
CREATE TYPE repeat_type AS ENUM ('once', 'daily', 'weekly', 'monthly', 'yearly');
CREATE TYPE reminder_status AS ENUM ('active', 'completed', 'snoozed', 'cancelled');
CREATE TYPE ai_memory_category AS ENUM ('favorite_food', 'favorite_drink', 'favorite_place', 'favorite_color', 'important_date', 'gift', 'habit', 'goal', 'personality', 'preference');
CREATE TYPE ai_report_type AS ENUM ('daily', 'weekly', 'monthly');
CREATE TYPE expense_category AS ENUM ('food', 'transportation', 'shopping', 'gift', 'vacation', 'bills', 'other');
CREATE TYPE relationship_status AS ENUM ('active', 'paused');
CREATE TYPE gender AS ENUM ('male', 'female');
CREATE TYPE importance_level AS ENUM ('low', 'medium', 'high', 'critical');
CREATE TYPE memory_source AS ENUM ('user', 'ai', 'system');
CREATE TYPE activity_category AS ENUM ('date', 'travel', 'movie', 'dinner', 'sport', 'game', 'celebration', 'other');
CREATE TYPE wishlist_category AS ENUM ('travel', 'gift', 'experience', 'food', 'shopping', 'other');

-- ============================================
-- TABLES
-- ============================================

-- Couples (created first because users references it)
CREATE TABLE couples (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  partner_a UUID NOT NULL,
  partner_b UUID NOT NULL,
  anniversary_date DATE,
  relationship_status relationship_status DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Users (extends Supabase auth.users)
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  couple_id UUID REFERENCES couples(id) ON DELETE SET NULL,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  avatar TEXT,
  birth_date DATE,
  gender gender,
  timezone TEXT DEFAULT 'Asia/Jakarta',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add foreign keys for couples after users table exists
ALTER TABLE couples ADD CONSTRAINT fk_partner_a FOREIGN KEY (partner_a) REFERENCES users(id);
ALTER TABLE couples ADD CONSTRAINT fk_partner_b FOREIGN KEY (partner_b) REFERENCES users(id);

-- Health Logs
CREATE TABLE health_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type health_log_type NOT NULL,
  value JSONB NOT NULL DEFAULT '{}',
  unit TEXT,
  datetime TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Medicines
CREATE TABLE medicines (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  dosage TEXT,
  type medicine_type DEFAULT 'medicine',
  schedule TEXT,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Reminders
CREATE TABLE reminders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category reminder_category NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  reminder_time TIMESTAMPTZ NOT NULL,
  repeat_type repeat_type DEFAULT 'once',
  ai_generated BOOLEAN DEFAULT FALSE,
  status reminder_status DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Reminder Logs
CREATE TABLE reminder_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reminder_id UUID NOT NULL REFERENCES reminders(id) ON DELETE CASCADE,
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  opened_at TIMESTAMPTZ,
  completed BOOLEAN DEFAULT FALSE
);

-- AI Memory (Long-term)
CREATE TABLE ai_memory (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  couple_id UUID NOT NULL REFERENCES couples(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  category ai_memory_category NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  importance importance_level DEFAULT 'medium',
  source memory_source DEFAULT 'user',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- AI Conversations
CREATE TABLE ai_conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  prompt TEXT NOT NULL,
  response TEXT NOT NULL,
  token_usage INTEGER,
  latency INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- AI Reports
CREATE TABLE ai_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type ai_report_type NOT NULL,
  period TEXT NOT NULL,
  summary TEXT NOT NULL,
  recommendation TEXT,
  generated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Couple Activities
CREATE TABLE couple_activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  couple_id UUID NOT NULL REFERENCES couples(id) ON DELETE CASCADE,
  category activity_category DEFAULT 'other',
  title TEXT NOT NULL,
  description TEXT,
  activity_date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Anniversaries
CREATE TABLE anniversaries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  couple_id UUID NOT NULL REFERENCES couples(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  event_date DATE NOT NULL,
  reminder_before INTEGER DEFAULT 7,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Wishlists
CREATE TABLE wishlists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  couple_id UUID NOT NULL REFERENCES couples(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  category wishlist_category DEFAULT 'other',
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Expenses
CREATE TABLE expenses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  couple_id UUID NOT NULL REFERENCES couples(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category expense_category DEFAULT 'other',
  amount DECIMAL(12, 2) NOT NULL CHECK (amount > 0),
  description TEXT NOT NULL,
  expense_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Locations
CREATE TABLE locations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  accuracy DOUBLE PRECISION,
  recorded_at TIMESTAMPTZ DEFAULT NOW()
);

-- Photos
CREATE TABLE photos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  couple_id UUID NOT NULL REFERENCES couples(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL,
  caption TEXT,
  taken_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES (per 02_DATABASE §10)
-- ============================================

CREATE INDEX idx_health_logs_user ON health_logs(user_id);
CREATE INDEX idx_health_logs_type ON health_logs(type);
CREATE INDEX idx_health_logs_datetime ON health_logs(datetime);
CREATE INDEX idx_health_logs_created ON health_logs(created_at);

CREATE INDEX idx_reminders_user ON reminders(user_id);
CREATE INDEX idx_reminders_category ON reminders(category);
CREATE INDEX idx_reminders_time ON reminders(reminder_time);

CREATE INDEX idx_ai_memory_couple ON ai_memory(couple_id);
CREATE INDEX idx_ai_memory_category ON ai_memory(category);

CREATE INDEX idx_ai_conversations_user ON ai_conversations(user_id);
CREATE INDEX idx_ai_conversations_created ON ai_conversations(created_at);

CREATE INDEX idx_couple_activities_couple ON couple_activities(couple_id);
CREATE INDEX idx_couple_activities_date ON couple_activities(activity_date);

CREATE INDEX idx_expenses_couple ON expenses(couple_id);
CREATE INDEX idx_expenses_date ON expenses(expense_date);
CREATE INDEX idx_expenses_category ON expenses(category);

CREATE INDEX idx_locations_user ON locations(user_id);
CREATE INDEX idx_locations_recorded ON locations(recorded_at);

CREATE INDEX idx_photos_couple ON photos(couple_id);

-- ============================================
-- TRIGGERS
-- ============================================

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trigger_medicines_updated_at BEFORE UPDATE ON medicines
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trigger_reminders_updated_at BEFORE UPDATE ON reminders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trigger_ai_memory_updated_at BEFORE UPDATE ON ai_memory
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trigger_wishlists_updated_at BEFORE UPDATE ON wishlists
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- ROW LEVEL SECURITY (per 02_DATABASE §7)
-- ============================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE couples ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE medicines ENABLE ROW LEVEL SECURITY;
ALTER TABLE reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE reminder_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_memory ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE couple_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE anniversaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE photos ENABLE ROW LEVEL SECURITY;

-- Users: can read/write own profile, read partner profile
CREATE POLICY "Users can view own profile" ON users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can view partner profile" ON users FOR SELECT
  USING (
    couple_id IN (
      SELECT id FROM couples WHERE partner_a = auth.uid() OR partner_b = auth.uid()
    )
  );

CREATE POLICY "Users can update own profile" ON users FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON users FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Couples: can read own couple
CREATE POLICY "Users can view own couple" ON couples FOR SELECT
  USING (partner_a = auth.uid() OR partner_b = auth.uid());

CREATE POLICY "Users can insert couple" ON couples FOR INSERT
  WITH CHECK (partner_a = auth.uid() OR partner_b = auth.uid());

CREATE POLICY "Users can update own couple" ON couples FOR UPDATE
  USING (partner_a = auth.uid() OR partner_b = auth.uid());

-- Health Logs: own data + partner's data (read)
CREATE POLICY "Users can manage own health logs" ON health_logs FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view partner health logs" ON health_logs FOR SELECT
  USING (
    user_id IN (
      SELECT CASE
        WHEN partner_a = auth.uid() THEN partner_b
        WHEN partner_b = auth.uid() THEN partner_a
      END FROM couples
      WHERE partner_a = auth.uid() OR partner_b = auth.uid()
    )
  );

-- Medicines: own data only
CREATE POLICY "Users can manage own medicines" ON medicines FOR ALL
  USING (auth.uid() = user_id);

-- Reminders: own data only
CREATE POLICY "Users can manage own reminders" ON reminders FOR ALL
  USING (auth.uid() = user_id);

-- Reminder Logs: via reminder ownership
CREATE POLICY "Users can manage own reminder logs" ON reminder_logs FOR ALL
  USING (
    reminder_id IN (
      SELECT id FROM reminders WHERE user_id = auth.uid()
    )
  );

-- AI Memory: couple-scoped
CREATE POLICY "Users can manage couple AI memory" ON ai_memory FOR ALL
  USING (
    couple_id IN (
      SELECT couple_id FROM users WHERE id = auth.uid()
    )
  );

-- AI Conversations: own data only
CREATE POLICY "Users can manage own AI conversations" ON ai_conversations FOR ALL
  USING (auth.uid() = user_id);

-- AI Reports: own data only
CREATE POLICY "Users can manage own AI reports" ON ai_reports FOR ALL
  USING (auth.uid() = user_id);

-- Couple Activities: couple-scoped
CREATE POLICY "Users can manage couple activities" ON couple_activities FOR ALL
  USING (
    couple_id IN (
      SELECT couple_id FROM users WHERE id = auth.uid()
    )
  );

-- Anniversaries: couple-scoped
CREATE POLICY "Users can manage couple anniversaries" ON anniversaries FOR ALL
  USING (
    couple_id IN (
      SELECT couple_id FROM users WHERE id = auth.uid()
    )
  );

-- Wishlists: couple-scoped
CREATE POLICY "Users can manage couple wishlists" ON wishlists FOR ALL
  USING (
    couple_id IN (
      SELECT couple_id FROM users WHERE id = auth.uid()
    )
  );

-- Expenses: couple-scoped
CREATE POLICY "Users can manage couple expenses" ON expenses FOR ALL
  USING (
    couple_id IN (
      SELECT couple_id FROM users WHERE id = auth.uid()
    )
  );

-- Locations: own data + partner's (read)
CREATE POLICY "Users can manage own locations" ON locations FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view partner location" ON locations FOR SELECT
  USING (
    user_id IN (
      SELECT CASE
        WHEN partner_a = auth.uid() THEN partner_b
        WHEN partner_b = auth.uid() THEN partner_a
      END FROM couples
      WHERE partner_a = auth.uid() OR partner_b = auth.uid()
    )
  );

-- Photos: couple-scoped
CREATE POLICY "Users can manage couple photos" ON photos FOR ALL
  USING (
    couple_id IN (
      SELECT couple_id FROM users WHERE id = auth.uid()
    )
  );

-- ============================================
-- STORAGE BUCKETS (per 02_DATABASE §8)
-- ============================================

INSERT INTO storage.buckets (id, name, public)
VALUES
  ('avatars', 'avatars', true),
  ('health-images', 'health-images', false),
  ('photos', 'photos', false),
  ('attachments', 'attachments', false)
ON CONFLICT DO NOTHING;

-- Storage RLS: avatars (public read, authenticated write)
CREATE POLICY "Avatar images are publicly accessible" ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload own avatar" ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Storage RLS: photos (couple-scoped)
CREATE POLICY "Users can view couple photos" ON storage.objects FOR SELECT
  USING (
    bucket_id = 'photos' AND
    (storage.foldername(name))[1] IN (
      SELECT couple_id::text FROM users WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can upload couple photos" ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'photos' AND
    (storage.foldername(name))[1] IN (
      SELECT couple_id::text FROM users WHERE id = auth.uid()
    )
  );

-- ============================================
-- REALTIME (per 02_DATABASE §9)
-- ============================================

-- Enable realtime for key tables
ALTER PUBLICATION supabase_realtime ADD TABLE health_logs;
ALTER PUBLICATION supabase_realtime ADD TABLE reminders;
ALTER PUBLICATION supabase_realtime ADD TABLE locations;
ALTER PUBLICATION supabase_realtime ADD TABLE couple_activities;
