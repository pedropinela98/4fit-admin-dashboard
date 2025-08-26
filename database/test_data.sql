-- ============================================================================
-- Test Data Script for 4Fit Database
-- ============================================================================
-- This script inserts test data into all tables for testing purposes
-- Run the cleanup section at the end to remove all test data
-- ============================================================================

-- ============================================================================
-- REMOVE CONSTRAINT - Run this before inserting test data
-- ============================================================================
-- This removes the foreign key constraint that links User_detail.id to auth.users
-- ALTER TABLE "User_detail" DROP CONSTRAINT IF EXISTS "User_detail_id_fkey";

SET search_path TO public;

BEGIN;

-- ============================================================================
-- STEP 1: Insert test users (these will be referenced by other tables)
-- ============================================================================

-- Note: In production with Supabase, users are created via auth.users first
-- For testing, we'll insert directly into User_detail with test UUIDs

INSERT INTO "User_detail" (id, name, email, phone, created_at, updated_at)
VALUES 
  ('9a38ac6f-7fcc-4f3e-be98-83fe4885bf72', 'Miguel Coach', 'miguel.coach@test.com', '+351912345678', NOW(), NOW()),
  ('d9bbcfa3-027a-4b7c-881e-7f8c163949d7', 'Pedro Member', 'pedro.member@test.com', '+351923456789', NOW(), NOW()),
  ('82296266-8f1c-41c0-a1ef-45bef7f64bd3', 'Natan Admin', 'natan.admin@test.com', '+351934567890', NOW(), NOW()),
  ('fb76cc05-e9c4-4a04-b929-b2e89d793e09', 'Camila Athlete', 'camila.athlete@test.com', '+351945678901', NOW(), NOW()),
  ('a41a1153-5668-4d3f-942d-2642dc57199c', 'Adriana Receptionist', 'adriana.receptionist@test.com', '+351956789012', NOW(), NOW());

-- ============================================================================
-- STEP 2: Insert box data
-- ============================================================================

INSERT INTO "Box" (id, name, location, latitude, longitude, timezone, currency, active)
VALUES 
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'CrossFit Test Box', 'Lisboa, Portugal', 38.7223, -9.1393, 'Europe/Lisbon', 'EUR', true);

-- ============================================================================
-- STEP 3: Insert box staff
-- ============================================================================

INSERT INTO "Box_Staff" (id, box_id, user_id, role, start_date)
VALUES 
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '82296266-8f1c-41c0-a1ef-45bef7f64bd3', 'admin', '2024-01-01'),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '9a38ac6f-7fcc-4f3e-be98-83fe4885bf72', 'coach', '2024-01-15'),
  ('dddddddd-0000-0000-0000-000000000000', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'a41a1153-5668-4d3f-942d-2642dc57199c', 'receptionist', '2024-01-20');

-- ============================================================================
-- STEP 4: Insert box members
-- ============================================================================

INSERT INTO "Box_Member" (id, box_id, user_id, seguro_validade, joined_at)
VALUES 
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'd9bbcfa3-027a-4b7c-881e-7f8c163949d7', '2025-12-31', '2024-01-01'),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'fb76cc05-e9c4-4a04-b929-b2e89d793e09', '2025-06-30', '2024-02-01');

-- ============================================================================
-- STEP 5: Insert membership request
-- ============================================================================

INSERT INTO "Box_Membership_Request" (id, user_id, box_id, status, processed_by, processed_at)
VALUES 
  ('fffff000-ffff-ffff-ffff-ffffffffffff', 'fb76cc05-e9c4-4a04-b929-b2e89d793e09', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'approved', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', NOW());

-- ============================================================================
-- STEP 6: Insert announcement
-- ============================================================================

INSERT INTO "Announcement" (id, box_id, admin_id, title, message, send_date)
VALUES 
  ('aaaaa000-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '82296266-8f1c-41c0-a1ef-45bef7f64bd3', 'Welcome to CrossFit Test Box!', 'We are excited to have you as part of our community.', NOW());

-- ============================================================================
-- STEP 7: Insert plans
-- ============================================================================

INSERT INTO "Plan" (id, box_id, name, description, price, max_sessions)
VALUES 
  ('aaaaa001-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Unlimited Monthly', 'Unlimited classes per month', 80.00, 999),
  ('aaaaa002-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '3x Week', 'Up to 12 classes per month', 60.00, 12);

-- ============================================================================
-- STEP 8: Insert membership
-- ============================================================================

INSERT INTO "Membership" (id, user_id, plan_id, start_date, end_date, is_active, payment_status)
VALUES 
  ('aaaaa003-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'd9bbcfa3-027a-4b7c-881e-7f8c163949d7', 'aaaaa001-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '2024-11-01', '2024-11-30', true, 'paid');

-- ============================================================================
-- STEP 9: Insert session packs
-- ============================================================================

INSERT INTO "Session_Pack" (id, name, description, price, session_count, validity_days, box_id)
VALUES 
  ('aaaaa004-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '10 Session Pack', 'Pack of 10 sessions valid for 60 days', 100.00, 10, 60, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa');

-- ============================================================================
-- STEP 10: Insert user session pack
-- ============================================================================

INSERT INTO "User_Session_Pack" (id, user_id, session_pack_id, start_date, expiration_date, sessions_used, is_active)
VALUES 
  ('aaaaa005-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'fb76cc05-e9c4-4a04-b929-b2e89d793e09', 'aaaaa004-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '2024-11-01', '2024-12-31', 3, true);

-- ============================================================================
-- STEP 11: Insert class
-- ============================================================================

INSERT INTO "Class" (id, box_id, coach_id, datetime, duration, max_capacity, type, waitlist_max)
VALUES 
  ('aaaaa006-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '9a38ac6f-7fcc-4f3e-be98-83fe4885bf72', '2024-11-25 09:00:00', 60, 12, 'CrossFit', 5);

-- ============================================================================
-- STEP 12: Insert class attendance
-- ============================================================================

INSERT INTO "Class_Attendance" (id, class_id, user_id, membership_id, status, is_dropin)
VALUES 
  ('aaaaa007-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'aaaaa006-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'd9bbcfa3-027a-4b7c-881e-7f8c163949d7', 'aaaaa003-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'present', false);

-- ============================================================================
-- STEP 13: Insert class waitlist
-- ============================================================================

INSERT INTO "Class_Waitlist" (id, class_id, user_id, position, joined_at)
VALUES 
  ('aaaaa008-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'aaaaa006-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'fb76cc05-e9c4-4a04-b929-b2e89d793e09', 1, NOW());

-- ============================================================================
-- STEP 14: Insert movements
-- ============================================================================

INSERT INTO "Movement" (id, name, category, url)
VALUES 
  ('aaaaa009-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Back Squat', 'weightlifting', 'https://example.com/back-squat'),
  ('aaaaa00a-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Pull-up', 'gymnastics', 'https://example.com/pull-up'),
  ('aaaaa00b-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Row', 'cardio', 'https://example.com/row');

-- ============================================================================
-- STEP 15: Insert workout
-- ============================================================================

INSERT INTO "Workout" (id, class_id, name, description, type)
VALUES 
  ('aaaaa00c-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'aaaaa006-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Test WOD', '21-15-9 Thrusters and Pull-ups', 'for_time');

-- ============================================================================
-- STEP 16: Insert workout section
-- ============================================================================

INSERT INTO "Workout_Section" (id, workout_id, title, type, duration_minutes, notes)
VALUES 
  ('aaaaa00d-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'aaaaa00c-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Part A - Strength', 'not_timed', 15, 'Build to heavy single'),
  ('aaaaa00e-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'aaaaa00c-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Part B - MetCon', 'for_time', 20, 'Scale as needed');

-- ============================================================================
-- STEP 17: Insert workout section exercises
-- ============================================================================

INSERT INTO "Workout_Section_Exercise" (id, section_id, movement_id, objective, reps, sets, load, order_number, notes)
VALUES 
  ('aaaaa00f-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'aaaaa00d-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'aaaaa009-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'strength', 1, 5, 'Build to heavy', 1, 'Focus on form'),
  ('aaaaa010-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'aaaaa00e-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'aaaaa00a-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'conditioning', 21, 1, 'bodyweight', 1, 'Kipping allowed');

-- ============================================================================
-- STEP 18: Insert workout result
-- ============================================================================

INSERT INTO "Workout_Result" (id, user_id, workout_id, result_type, value, date, public)
VALUES 
  ('aaaaa011-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'd9bbcfa3-027a-4b7c-881e-7f8c163949d7', 'aaaaa00c-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'time', '12:34', '2024-11-25', true);

-- ============================================================================
-- STEP 19: Insert workout result like
-- ============================================================================

INSERT INTO "Workout_Result_Like" (id, result_id, user_id, icon)
VALUES 
  ('aaaaa012-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'aaaaa011-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'fb76cc05-e9c4-4a04-b929-b2e89d793e09', '🔥');

-- ============================================================================
-- STEP 20: Insert PR
-- ============================================================================

INSERT INTO "PR" (id, user_id, movement_id, value, unit, achieved_at, public)
VALUES 
  ('aaaaa013-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'd9bbcfa3-027a-4b7c-881e-7f8c163949d7', 'aaaaa009-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 100, 'kg', '2024-11-25', true);

-- ============================================================================
-- STEP 21: Insert achievements (templates)
-- ============================================================================

INSERT INTO "Achievement" (id, title, target_value, target_unit, movement_id, badge_url, is_active)
VALUES 
  ('aaaa1111-aaaa-1111-aaaa-111111111111', '100kg Back Squat', 100, 'kg', 'aaaaa009-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'https://example.com/badge-100kg-squat.png', true),
  ('bbbb2222-bbbb-2222-bbbb-222222222222', '10 Strict Pull-ups', 10, 'reps', 'aaaaa00a-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'https://example.com/badge-10-pullups.png', true);

-- ============================================================================
-- STEP 22: Insert achievement unlocked
-- ============================================================================

INSERT INTO "Achievement_Unlocked" (id, achievement_id, user_id, workout_result_id, achieved_at)
VALUES 
  ('cccc3333-cccc-3333-cccc-333333333333', 'aaaa1111-aaaa-1111-aaaa-111111111111', 'd9bbcfa3-027a-4b7c-881e-7f8c163949d7', 'aaaaa011-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '2024-11-25');

-- ============================================================================
-- STEP 23: Insert payment
-- ============================================================================

INSERT INTO "Payment" (id, user_id, membership_id, amount, method, status, paid_at)
VALUES 
  ('dddd4444-dddd-4444-dddd-444444444444', 'd9bbcfa3-027a-4b7c-881e-7f8c163949d7', 'aaaaa003-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 80.00, 'card', 'paid', '2024-11-01');

-- ============================================================================
-- STEP 24: Insert discount
-- ============================================================================

INSERT INTO "Discount" (id, code, type, amount, applies_to, start_date, end_date, max_uses, usage_count, active)
VALUES 
  ('eeee5555-eeee-5555-eeee-555555555555', 'WELCOME20', 'percent', 20.00, 'all', '2024-11-01', '2024-12-31', 100, 0, true);

-- ============================================================================
-- STEP 25: Insert applied discount
-- ============================================================================

INSERT INTO "Applied_Discount" (id, user_id, discount_id, membership_id, amount_applied, applied_at)
VALUES 
  ('ffff6666-ffff-6666-ffff-666666666666', 'd9bbcfa3-027a-4b7c-881e-7f8c163949d7', 'eeee5555-eeee-5555-eeee-555555555555', 'aaaaa003-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 16.00, '2024-11-01');

-- ============================================================================
-- STEP 26: Insert expense
-- ============================================================================

INSERT INTO "Expense" (id, box_id, user_id, description, amount, type, expense_date)
VALUES 
  ('aaaa7000-aaaa-7777-aaaa-777777777777', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '82296266-8f1c-41c0-a1ef-45bef7f64bd3', 'Monthly cleaning supplies', 150.00, 'cleaning', '2024-11-01');

COMMIT;

-- ============================================================================
-- SUCCESS MESSAGE
-- ============================================================================
SELECT 'Test data inserted successfully!' AS message;

-- ============================================================================
-- CLEANUP SCRIPT - RUN THIS TO REMOVE ALL TEST DATA
-- ============================================================================
/*
BEGIN;

-- Delete in reverse order of dependencies
DELETE FROM "Expense" WHERE id IN ('aaaa7000-aaaa-7777-aaaa-777777777777');
DELETE FROM "Applied_Discount" WHERE id IN ('ffff6666-ffff-6666-ffff-666666666666');
DELETE FROM "Discount" WHERE id IN ('eeee5555-eeee-5555-eeee-555555555555');
DELETE FROM "Payment" WHERE id IN ('dddd4444-dddd-4444-dddd-444444444444');
DELETE FROM "Achievement_Unlocked" WHERE id IN ('cccc3333-cccc-3333-cccc-333333333333');
DELETE FROM "Achievement" WHERE id IN ('aaaa1111-aaaa-1111-aaaa-111111111111', 'bbbb2222-bbbb-2222-bbbb-222222222222');
DELETE FROM "PR" WHERE id IN ('aaaaa013-aaaa-aaaa-aaaa-aaaaaaaaaaaa');
DELETE FROM "Workout_Result_Like" WHERE id IN ('aaaaa012-aaaa-aaaa-aaaa-aaaaaaaaaaaa');
DELETE FROM "Workout_Result" WHERE id IN ('aaaaa011-aaaa-aaaa-aaaa-aaaaaaaaaaaa');
DELETE FROM "Workout_Section_Exercise" WHERE id IN ('aaaaa00f-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'aaaaa010-aaaa-aaaa-aaaa-aaaaaaaaaaaa');
DELETE FROM "Workout_Section" WHERE id IN ('aaaaa00d-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'aaaaa00e-aaaa-aaaa-aaaa-aaaaaaaaaaaa');
DELETE FROM "Workout" WHERE id IN ('aaaaa00c-aaaa-aaaa-aaaa-aaaaaaaaaaaa');
DELETE FROM "Movement" WHERE id IN ('aaaaa009-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'aaaaa00a-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'aaaaa00b-aaaa-aaaa-aaaa-aaaaaaaaaaaa');
DELETE FROM "Class_Waitlist" WHERE id IN ('aaaaa008-aaaa-aaaa-aaaa-aaaaaaaaaaaa');
DELETE FROM "Class_Attendance" WHERE id IN ('aaaaa007-aaaa-aaaa-aaaa-aaaaaaaaaaaa');
DELETE FROM "Class" WHERE id IN ('aaaaa006-aaaa-aaaa-aaaa-aaaaaaaaaaaa');
DELETE FROM "User_Session_Pack" WHERE id IN ('aaaaa005-aaaa-aaaa-aaaa-aaaaaaaaaaaa');
DELETE FROM "Session_Pack" WHERE id IN ('aaaaa004-aaaa-aaaa-aaaa-aaaaaaaaaaaa');
DELETE FROM "Membership" WHERE id IN ('aaaaa003-aaaa-aaaa-aaaa-aaaaaaaaaaaa');
DELETE FROM "Plan" WHERE id IN ('aaaaa001-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'aaaaa002-aaaa-aaaa-aaaa-aaaaaaaaaaaa');
DELETE FROM "Announcement" WHERE id IN ('aaaaa000-aaaa-aaaa-aaaa-aaaaaaaaaaaa');
DELETE FROM "Box_Membership_Request" WHERE id IN ('fffff000-ffff-ffff-ffff-ffffffffffff');
DELETE FROM "Box_Member" WHERE id IN ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee');
DELETE FROM "Box_Staff" WHERE id IN ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'dddddddd-0000-0000-0000-000000000000');
DELETE FROM "Box" WHERE id IN ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa');
DELETE FROM "User_detail" WHERE id IN ('9a38ac6f-7fcc-4f3e-be98-83fe4885bf72', 'd9bbcfa3-027a-4b7c-881e-7f8c163949d7', '82296266-8f1c-41c0-a1ef-45bef7f64bd3', 'fb76cc05-e9c4-4a04-b929-b2e89d793e09', 'a41a1153-5668-4d3f-942d-2642dc57199c');

COMMIT;

SELECT 'Test data cleaned successfully!' AS message;
*/

-- ============================================================================
-- RESTORE CONSTRAINT - Run this after testing is complete
-- ============================================================================
-- This restores the foreign key constraint that links User_detail.id to auth.users
-- Only run this if you have Supabase auth.users table set up
-- ALTER TABLE "User_detail" 
-- ADD CONSTRAINT "User_detail_id_fkey" 
-- FOREIGN KEY ("id") REFERENCES auth.users ("id") 
-- ON DELETE CASCADE ON UPDATE NO ACTION;