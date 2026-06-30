-- ============================================
-- MyKiv AI — Mock Seed Database Data
-- Version: 1.0.0
-- Seeds 2 weeks of history for two couples:
-- 1. Rifki & Mayly
-- 2. Adrian & Nabila
-- ============================================

-- Note: In a production Supabase project, user IDs map to auth.users.
-- Run this directly in the SQL Editor to insert mock accounts.

-- Clear existing data
TRUNCATE public.locations, public.expenses, public.wishlists, public.anniversaries, 
         public.couple_activities, public.ai_reports, public.ai_conversations, 
         public.ai_memory, public.reminder_logs, public.reminders, 
         public.medicines, public.health_logs, public.users, public.couples CASCADE;

-- ────────────────────────────────────────────────
-- 1. SEED USERS (auth.users + public.users initially without couple_id)
-- ────────────────────────────────────────────────

-- Seed auth.users first to satisfy foreign key constraints
INSERT INTO auth.users (id, email, raw_user_meta_data, raw_app_meta_data, aud, role, email_confirmed_at)
VALUES
  ('58bc3861-f7c9-4012-9d76-53f03dbcd473', 'muhamadrifkifirdaus22@gmail.com', '{"full_name": "Rifki"}', '{"provider": "email", "providers": ["email"]}', 'authenticated', 'authenticated', NOW()),
  ('01fd208b-c234-4d52-888d-3dbf49a2556d', 'meelidewi234@gmail.com', '{"full_name": "Mayly"}', '{"provider": "email", "providers": ["email"]}', 'authenticated', 'authenticated', NOW()),
  ('33333333-3333-3333-3333-333333333333', 'adrian@example.com', '{"full_name": "Adrian"}', '{"provider": "email", "providers": ["email"]}', 'authenticated', 'authenticated', NOW()),
  ('44444444-4444-4444-4444-444444444444', 'nabila@example.com', '{"full_name": "Nabila"}', '{"provider": "email", "providers": ["email"]}', 'authenticated', 'authenticated', NOW())
ON CONFLICT (id) DO NOTHING;

-- Seed public.users initially without couple_id
INSERT INTO public.users (id, couple_id, full_name, email, avatar, birth_date, gender, timezone, created_at)
VALUES
  ('58bc3861-f7c9-4012-9d76-53f03dbcd473', NULL, 'Rifki', 'muhamadrifkifirdaus22@gmail.com', null, '1996-08-12', 'male', 'Asia/Jakarta', NOW() - INTERVAL '1 year'),
  ('01fd208b-c234-4d52-888d-3dbf49a2556d', NULL, 'Mayly', 'meelidewi234@gmail.com', null, '1997-04-22', 'female', 'Asia/Jakarta', NOW() - INTERVAL '1 year'),
  ('33333333-3333-3333-3333-333333333333', NULL, 'Adrian', 'adrian@example.com', null, '1995-12-05', 'male', 'Asia/Jakarta', NOW() - INTERVAL '6 months'),
  ('44444444-4444-4444-4444-444444444444', NULL, 'Nabila', 'nabila@example.com', null, '1998-09-30', 'female', 'Asia/Jakarta', NOW() - INTERVAL '6 months');

-- ────────────────────────────────────────────────
-- 2. SEED COUPLES
-- ────────────────────────────────────────────────

-- Couple 1: Rifki & Mayly
INSERT INTO public.couples (id, partner_a, partner_b, anniversary_date, relationship_status, created_at)
VALUES (
  'c1111111-1111-1111-1111-111111111111',
  '58bc3861-f7c9-4012-9d76-53f03dbcd473', -- Rifki
  '01fd208b-c234-4d52-888d-3dbf49a2556d', -- Mayly
  '2022-10-15',
  'active',
  NOW() - INTERVAL '2 year'
);

-- Couple 2: Adrian & Nabila
INSERT INTO public.couples (id, partner_a, partner_b, anniversary_date, relationship_status, created_at)
VALUES (
  'c2222222-2222-2222-2222-222222222222',
  '33333333-3333-3333-3333-333333333333', -- Adrian
  '44444444-4444-4444-4444-444444444444', -- Nabila
  '2023-05-20',
  'active',
  NOW() - INTERVAL '6 months'
);

-- Update public.users with their couple_id
UPDATE public.users SET couple_id = 'c1111111-1111-1111-1111-111111111111' WHERE id IN ('58bc3861-f7c9-4012-9d76-53f03dbcd473', '01fd208b-c234-4d52-888d-3dbf49a2556d');
UPDATE public.users SET couple_id = 'c2222222-2222-2222-2222-222222222222' WHERE id IN ('33333333-3333-3333-3333-333333333333', '44444444-4444-4444-4444-444444444444');

-- ────────────────────────────────────────────────
-- 3. SEED HEALTH LOGS (2 weeks of history)
-- ────────────────────────────────────────────────

-- Helper seed function to populate logs efficiently for testing
CREATE OR REPLACE FUNCTION seed_health_history(user_uuid UUID, day_offset INTEGER)
RETURNS VOID AS $$
BEGIN
  -- Log Water
  INSERT INTO public.health_logs (user_id, type, value, unit, datetime)
  VALUES (user_uuid, 'water', '{"amountMl": 250}', 'ml', NOW() - (day_offset || ' day')::INTERVAL + INTERVAL '8 hours');
  INSERT INTO public.health_logs (user_id, type, value, unit, datetime)
  VALUES (user_uuid, 'water', '{"amountMl": 500}', 'ml', NOW() - (day_offset || ' day')::INTERVAL + INTERVAL '12 hours');
  INSERT INTO public.health_logs (user_id, type, value, unit, datetime)
  VALUES (user_uuid, 'water', '{"amountMl": 500}', 'ml', NOW() - (day_offset || ' day')::INTERVAL + INTERVAL '15 hours');
  INSERT INTO public.health_logs (user_id, type, value, unit, datetime)
  VALUES (user_uuid, 'water', '{"amountMl": 250}', 'ml', NOW() - (day_offset || ' day')::INTERVAL + INTERVAL '19 hours');

  -- Log Meals
  INSERT INTO public.health_logs (user_id, type, value, unit, datetime)
  VALUES (user_uuid, 'meal', '{"mealType": "breakfast", "description": "Oatmeal and Bananas", "calories": 320}', '', NOW() - (day_offset || ' day')::INTERVAL + INTERVAL '7 hours');
  INSERT INTO public.health_logs (user_id, type, value, unit, datetime)
  VALUES (user_uuid, 'meal', '{"mealType": "lunch", "description": "Chicken Breast and Rice", "calories": 550}', '', NOW() - (day_offset || ' day')::INTERVAL + INTERVAL '13 hours');
  INSERT INTO public.health_logs (user_id, type, value, unit, datetime)
  VALUES (user_uuid, 'meal', '{"mealType": "dinner", "description": "Salmon Salad", "calories": 420}', '', NOW() - (day_offset || ' day')::INTERVAL + INTERVAL '19 hours');

  -- Log Sleep
  INSERT INTO public.health_logs (user_id, type, value, unit, datetime)
  VALUES (user_uuid, 'sleep', 
    jsonb_build_object(
      'sleepTime', (NOW() - ((day_offset + 1) || ' day')::INTERVAL + INTERVAL '22 hours')::text,
      'wakeTime', (NOW() - (day_offset || ' day')::INTERVAL + INTERVAL '6 hours')::text,
      'quality', 4
    ), 'hours', NOW() - (day_offset || ' day')::INTERVAL + INTERVAL '6 hours');

  -- Log Mood
  INSERT INTO public.health_logs (user_id, type, value, unit, datetime)
  VALUES (user_uuid, 'mood', '{"moodValue": "happy"}', '', NOW() - (day_offset || ' day')::INTERVAL + INTERVAL '20 hours');

  -- Log Exercise
  INSERT INTO public.health_logs (user_id, type, value, unit, datetime)
  VALUES (user_uuid, 'exercise', '{"exerciseType": "walking", "durationMinutes": 30}', 'minutes', NOW() - (day_offset || ' day')::INTERVAL + INTERVAL '17 hours');
END;
$$ LANGUAGE plpgsql;

-- Execute seed_health_history for Rifki & Mayly over past 14 days
SELECT seed_health_history('58bc3861-f7c9-4012-9d76-53f03dbcd473', i) FROM generate_series(0, 14) i;
SELECT seed_health_history('01fd208b-c234-4d52-888d-3dbf49a2556d', i) FROM generate_series(0, 14) i;

-- Execute seed_health_history for Adrian & Nabila over past 14 days
SELECT seed_health_history('33333333-3333-3333-3333-333333333333', i) FROM generate_series(0, 14) i;
SELECT seed_health_history('44444444-4444-4444-4444-444444444444', i) FROM generate_series(0, 14) i;

DROP FUNCTION seed_health_history(UUID, INTEGER);

-- ────────────────────────────────────────────────
-- 4. SEED LONG-TERM MEMORIES
-- ────────────────────────────────────────────────

-- Rifki & Mayly memories
INSERT INTO public.ai_memory (couple_id, user_id, category, title, content, importance, source)
VALUES
  ('c1111111-1111-1111-1111-111111111111', '58bc3861-f7c9-4012-9d76-53f03dbcd473', 'favorite_food', 'Mayly''s Favorite Coffee', 'Cafe Latte with Soy Milk and 50% sugar', 'high', 'user'),
  ('c1111111-1111-1111-1111-111111111111', '01fd208b-c234-4d52-888d-3dbf49a2556d', 'favorite_place', 'Our First Date Spot', 'Giyanti Coffee Roastery in Menteng', 'medium', 'user'),
  ('c1111111-1111-1111-1111-111111111111', '58bc3861-f7c9-4012-9d76-53f03dbcd473', 'preference', 'Mayly''s flowers preference', 'Prefers white tulips over red roses', 'high', 'user');

-- Adrian & Nabila memories
INSERT INTO public.ai_memory (couple_id, user_id, category, title, content, importance, source)
VALUES
  ('c2222222-2222-2222-2222-222222222222', '33333333-3333-3333-3333-333333333333', 'favorite_food', 'Nabila''s Seafood Allergy', 'Severe allergy to crabs and lobsters. Can eat fish and shrimp.', 'critical', 'user'),
  ('c2222222-2222-2222-2222-222222222222', '44444444-4444-4444-4444-444444444444', 'favorite_place', 'Dream Honeymoon Destination', 'Kyoto, Japan during autumn season', 'medium', 'user');

-- ────────────────────────────────────────────────
-- 5. SEED COUPLE ACTIVITIES
-- ────────────────────────────────────────────────

-- Rifki & Mayly activities
INSERT INTO public.couple_activities (couple_id, category, title, description, activity_date)
VALUES
  ('c1111111-1111-1111-1111-111111111111', 'dinner', 'Dinner at Kemang Steakhouse', 'Celebrated Mayly''s promotion at work. Had T-Bone steak.', NOW() - INTERVAL '5 days'),
  ('c1111111-1111-1111-1111-111111111111', 'movie', 'Watched Dune: Part Two', 'Cinema XXI Plaza Senayan. Mayly loved the cinematography.', NOW() - INTERVAL '12 days');

-- Adrian & Nabila activities
INSERT INTO public.couple_activities (couple_id, category, title, description, activity_date)
VALUES
  ('c2222222-2222-2222-2222-222222222222', 'travel', 'Weekend in Bandung', 'Stayed at a cabin in Lembang. Visited Tangkuban Perahu.', NOW() - INTERVAL '8 days');

-- ────────────────────────────────────────────────
-- 6. SEED WISHLISTS
-- ────────────────────────────────────────────────

-- Rifki & Mayly wishlists
INSERT INTO public.wishlists (couple_id, title, category, progress, completed)
VALUES
  ('c1111111-1111-1111-1111-111111111111', 'Trip to Japan 2026', 'travel', 45, false),
  ('c1111111-1111-1111-1111-111111111111', 'Matching winter hoodies', 'shopping', 100, true);

-- Adrian & Nabila wishlists
INSERT INTO public.wishlists (couple_id, title, category, progress, completed)
VALUES
  ('c2222222-2222-2222-2222-222222222222', 'Buy a espresso machine', 'shopping', 70, false);

-- ────────────────────────────────────────────────
-- 7. SEED SHARED EXPENSES
-- ────────────────────────────────────────────────

-- Rifki & Mayly expenses
INSERT INTO public.expenses (couple_id, user_id, category, amount, description, expense_date)
VALUES
  ('c1111111-1111-1111-1111-111111111111', '58bc3861-f7c9-4012-9d76-53f03dbcd473', 'food', 350000.00, 'Steakhouse Promotion Dinner', NOW() - INTERVAL '5 days'),
  ('c1111111-1111-1111-1111-111111111111', '01fd208b-c234-4d52-888d-3dbf49a2556d', 'bills', 1200000.00, 'Shared Internet Bill', NOW() - INTERVAL '2 days');

-- Adrian & Nabila expenses
INSERT INTO public.expenses (couple_id, user_id, category, amount, description, expense_date)
VALUES
  ('c2222222-2222-2222-2222-222222222222', '33333333-3333-3333-3333-333333333333', 'vacation', 2500000.00, 'Bandung Cabin Reservation', NOW() - INTERVAL '9 days');
