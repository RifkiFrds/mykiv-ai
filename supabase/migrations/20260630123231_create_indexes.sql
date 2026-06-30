/*
# Create indexes for performance
*/

CREATE INDEX IF NOT EXISTS idx_meal_logs_user_date ON meal_logs(user_id, logged_at);
CREATE INDEX IF NOT EXISTS idx_water_logs_user_date ON water_logs(user_id, logged_at);
CREATE INDEX IF NOT EXISTS idx_sleep_logs_user_date ON sleep_logs(user_id, sleep_date);
CREATE INDEX IF NOT EXISTS idx_exercise_logs_user_date ON exercise_logs(user_id, logged_at);
CREATE INDEX IF NOT EXISTS idx_mood_logs_user_date ON mood_logs(user_id, logged_at);
CREATE INDEX IF NOT EXISTS idx_medicine_logs_user_date ON medicine_logs(user_id, taken_at);
CREATE INDEX IF NOT EXISTS idx_couple_activities_couple ON couple_activities(couple_id);
CREATE INDEX IF NOT EXISTS idx_wishlist_couple ON wishlist_items(couple_id);
CREATE INDEX IF NOT EXISTS idx_expenses_couple ON expenses(couple_id);
CREATE INDEX IF NOT EXISTS idx_reminders_user ON reminders(user_id, scheduled_at);
CREATE INDEX IF NOT EXISTS idx_ai_memory_user ON ai_memory(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_reports_user ON ai_reports(user_id, generated_at);
CREATE INDEX IF NOT EXISTS idx_ai_conversations_user ON ai_conversations(user_id, created_at);