/*
# Create couple features, reminders, and AI tables
*/

CREATE TABLE IF NOT EXISTS couple_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  couple_id TEXT NOT NULL,
  created_by UUID NOT NULL REFERENCES profiles(id),
  title TEXT NOT NULL,
  description TEXT,
  activity_type TEXT CHECK (activity_type IN ('date', 'travel', 'fitness', 'cooking', 'movie', 'other')),
  scheduled_at TIMESTAMPTZ,
  status TEXT CHECK (status IN ('planned', 'completed', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS wishlist_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  couple_id TEXT NOT NULL,
  created_by UUID NOT NULL REFERENCES profiles(id),
  title TEXT NOT NULL,
  description TEXT,
  category TEXT CHECK (category IN ('experience', 'item', 'travel', 'food', 'other')),
  estimated_cost NUMERIC(10,2),
  priority NUMERIC(2,1) CHECK (priority >= 1 AND priority <= 5),
  is_fulfilled BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  couple_id TEXT NOT NULL,
  created_by UUID NOT NULL REFERENCES profiles(id),
  title TEXT NOT NULL,
  amount NUMERIC(10,2) NOT NULL,
  category TEXT CHECK (category IN ('food', 'travel', 'entertainment', 'bills', 'shopping', 'health', 'other')),
  split_type TEXT CHECK (split_type IN ('equal', 'percentage', 'custom')),
  paid_by UUID REFERENCES profiles(id),
  expense_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  reminder_type TEXT CHECK (reminder_type IN ('medicine', 'water', 'exercise', 'meal', 'sleep', 'custom')),
  scheduled_at TIMESTAMPTZ NOT NULL,
  recurring TEXT CHECK (recurring IN ('none', 'daily', 'weekly', 'monthly')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ai_memory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  memory_type TEXT CHECK (memory_type IN ('preference', 'fact', 'goal', 'insight')),
  content TEXT NOT NULL,
  category TEXT,
  confidence NUMERIC(3,2) DEFAULT 1.0,
  source TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ai_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  report_type TEXT CHECK (report_type IN ('daily', 'weekly', 'monthly', 'relationship')),
  title TEXT NOT NULL,
  summary TEXT,
  content JSONB,
  generated_at TIMESTAMPTZ DEFAULT NOW(),
  is_read BOOLEAN DEFAULT false
);

CREATE TABLE IF NOT EXISTS ai_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  role TEXT CHECK (role IN ('user', 'assistant', 'system')),
  context JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE couple_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_memory ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_conversations ENABLE ROW LEVEL SECURITY;

-- couple_activities policies
DROP POLICY IF EXISTS "select_couple_activities" ON couple_activities;
CREATE POLICY "select_couple_activities" ON couple_activities FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND (profiles.couple_id = couple_activities.couple_id OR profiles.id = couple_activities.created_by))
);
DROP POLICY IF EXISTS "insert_couple_activities" ON couple_activities;
CREATE POLICY "insert_couple_activities" ON couple_activities FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by);
DROP POLICY IF EXISTS "update_couple_activities" ON couple_activities;
CREATE POLICY "update_couple_activities" ON couple_activities FOR UPDATE TO authenticated USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.couple_id = couple_activities.couple_id)
) WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.couple_id = couple_activities.couple_id)
);
DROP POLICY IF EXISTS "delete_couple_activities" ON couple_activities;
CREATE POLICY "delete_couple_activities" ON couple_activities FOR DELETE TO authenticated USING (auth.uid() = created_by);

-- wishlist_items policies
DROP POLICY IF EXISTS "select_wishlist" ON wishlist_items;
CREATE POLICY "select_wishlist" ON wishlist_items FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND (profiles.couple_id = wishlist_items.couple_id OR profiles.id = wishlist_items.created_by))
);
DROP POLICY IF EXISTS "insert_wishlist" ON wishlist_items;
CREATE POLICY "insert_wishlist" ON wishlist_items FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by);
DROP POLICY IF EXISTS "update_wishlist" ON wishlist_items;
CREATE POLICY "update_wishlist" ON wishlist_items FOR UPDATE TO authenticated USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.couple_id = wishlist_items.couple_id)
) WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.couple_id = wishlist_items.couple_id)
);
DROP POLICY IF EXISTS "delete_wishlist" ON wishlist_items;
CREATE POLICY "delete_wishlist" ON wishlist_items FOR DELETE TO authenticated USING (auth.uid() = created_by);

-- expenses policies
DROP POLICY IF EXISTS "select_expenses" ON expenses;
CREATE POLICY "select_expenses" ON expenses FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND (profiles.couple_id = expenses.couple_id OR profiles.id = expenses.created_by))
);
DROP POLICY IF EXISTS "insert_expenses" ON expenses;
CREATE POLICY "insert_expenses" ON expenses FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by);
DROP POLICY IF EXISTS "update_expenses" ON expenses;
CREATE POLICY "update_expenses" ON expenses FOR UPDATE TO authenticated USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.couple_id = expenses.couple_id)
) WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.couple_id = expenses.couple_id)
);
DROP POLICY IF EXISTS "delete_expenses" ON expenses;
CREATE POLICY "delete_expenses" ON expenses FOR DELETE TO authenticated USING (auth.uid() = created_by);

-- reminders policies
DROP POLICY IF EXISTS "select_own_reminders" ON reminders;
CREATE POLICY "select_own_reminders" ON reminders FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_reminders" ON reminders;
CREATE POLICY "insert_own_reminders" ON reminders FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_reminders" ON reminders;
CREATE POLICY "update_own_reminders" ON reminders FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_reminders" ON reminders;
CREATE POLICY "delete_own_reminders" ON reminders FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- ai_memory policies
DROP POLICY IF EXISTS "select_own_ai_memory" ON ai_memory;
CREATE POLICY "select_own_ai_memory" ON ai_memory FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_ai_memory" ON ai_memory;
CREATE POLICY "insert_own_ai_memory" ON ai_memory FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_ai_memory" ON ai_memory;
CREATE POLICY "update_own_ai_memory" ON ai_memory FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_ai_memory" ON ai_memory;
CREATE POLICY "delete_own_ai_memory" ON ai_memory FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- ai_reports policies
DROP POLICY IF EXISTS "select_own_ai_reports" ON ai_reports;
CREATE POLICY "select_own_ai_reports" ON ai_reports FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_ai_reports" ON ai_reports;
CREATE POLICY "insert_own_ai_reports" ON ai_reports FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_ai_reports" ON ai_reports;
CREATE POLICY "update_own_ai_reports" ON ai_reports FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_ai_reports" ON ai_reports;
CREATE POLICY "delete_own_ai_reports" ON ai_reports FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- ai_conversations policies
DROP POLICY IF EXISTS "select_own_ai_conversations" ON ai_conversations;
CREATE POLICY "select_own_ai_conversations" ON ai_conversations FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_ai_conversations" ON ai_conversations;
CREATE POLICY "insert_own_ai_conversations" ON ai_conversations FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_ai_conversations" ON ai_conversations;
CREATE POLICY "update_own_ai_conversations" ON ai_conversations FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_ai_conversations" ON ai_conversations;
CREATE POLICY "delete_own_ai_conversations" ON ai_conversations FOR DELETE TO authenticated USING (auth.uid() = user_id);