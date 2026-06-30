/*
# Create health tracking tables
Meal, water, sleep, exercise, mood, and medicine logs.
*/

CREATE TABLE IF NOT EXISTS meal_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  meal_type TEXT CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')),
  food_name TEXT NOT NULL,
  calories NUMERIC(8,2),
  protein_g NUMERIC(6,2),
  carbs_g NUMERIC(6,2),
  fat_g NUMERIC(6,2),
  photo_url TEXT,
  logged_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS water_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  amount_ml NUMERIC(6,2) NOT NULL,
  logged_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS sleep_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  sleep_date DATE NOT NULL,
  duration_minutes NUMERIC(6,2),
  quality_score NUMERIC(3,2) CHECK (quality_score >= 0 AND quality_score <= 10),
  bed_time TIMESTAMPTZ,
  wake_time TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS exercise_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  exercise_type TEXT NOT NULL,
  duration_minutes NUMERIC(6,2),
  calories_burned NUMERIC(8,2),
  intensity TEXT CHECK (intensity IN ('low', 'moderate', 'high')),
  notes TEXT,
  logged_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS mood_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  mood_score NUMERIC(3,2) CHECK (mood_score >= 1 AND mood_score <= 10),
  mood_label TEXT,
  notes TEXT,
  logged_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS medicine_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  medicine_name TEXT NOT NULL,
  dosage TEXT,
  taken_at TIMESTAMPTZ DEFAULT NOW(),
  status TEXT CHECK (status IN ('taken', 'skipped', 'missed')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE meal_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE water_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE sleep_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercise_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE mood_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE medicine_logs ENABLE ROW LEVEL SECURITY;

-- meal_logs policies
DROP POLICY IF EXISTS "select_own_meals" ON meal_logs;
CREATE POLICY "select_own_meals" ON meal_logs FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_meals" ON meal_logs;
CREATE POLICY "insert_own_meals" ON meal_logs FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_meals" ON meal_logs;
CREATE POLICY "update_own_meals" ON meal_logs FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_meals" ON meal_logs;
CREATE POLICY "delete_own_meals" ON meal_logs FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- water_logs policies
DROP POLICY IF EXISTS "select_own_water" ON water_logs;
CREATE POLICY "select_own_water" ON water_logs FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_water" ON water_logs;
CREATE POLICY "insert_own_water" ON water_logs FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_water" ON water_logs;
CREATE POLICY "update_own_water" ON water_logs FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_water" ON water_logs;
CREATE POLICY "delete_own_water" ON water_logs FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- sleep_logs policies
DROP POLICY IF EXISTS "select_own_sleep" ON sleep_logs;
CREATE POLICY "select_own_sleep" ON sleep_logs FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_sleep" ON sleep_logs;
CREATE POLICY "insert_own_sleep" ON sleep_logs FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_sleep" ON sleep_logs;
CREATE POLICY "update_own_sleep" ON sleep_logs FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_sleep" ON sleep_logs;
CREATE POLICY "delete_own_sleep" ON sleep_logs FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- exercise_logs policies
DROP POLICY IF EXISTS "select_own_exercise" ON exercise_logs;
CREATE POLICY "select_own_exercise" ON exercise_logs FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_exercise" ON exercise_logs;
CREATE POLICY "insert_own_exercise" ON exercise_logs FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_exercise" ON exercise_logs;
CREATE POLICY "update_own_exercise" ON exercise_logs FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_exercise" ON exercise_logs;
CREATE POLICY "delete_own_exercise" ON exercise_logs FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- mood_logs policies
DROP POLICY IF EXISTS "select_own_mood" ON mood_logs;
CREATE POLICY "select_own_mood" ON mood_logs FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_mood" ON mood_logs;
CREATE POLICY "insert_own_mood" ON mood_logs FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_mood" ON mood_logs;
CREATE POLICY "update_own_mood" ON mood_logs FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_mood" ON mood_logs;
CREATE POLICY "delete_own_mood" ON mood_logs FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- medicine_logs policies
DROP POLICY IF EXISTS "select_own_medicine" ON medicine_logs;
CREATE POLICY "select_own_medicine" ON medicine_logs FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_medicine" ON medicine_logs;
CREATE POLICY "insert_own_medicine" ON medicine_logs FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_medicine" ON medicine_logs;
CREATE POLICY "update_own_medicine" ON medicine_logs FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_medicine" ON medicine_logs;
CREATE POLICY "delete_own_medicine" ON medicine_logs FOR DELETE TO authenticated USING (auth.uid() = user_id);