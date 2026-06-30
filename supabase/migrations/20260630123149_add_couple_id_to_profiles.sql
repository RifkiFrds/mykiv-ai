/*
# Add couple_id to profiles
Shared couple identifier for couple-scoped tables.
*/

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS couple_id TEXT;

CREATE INDEX IF NOT EXISTS idx_profiles_couple_id ON profiles(couple_id);