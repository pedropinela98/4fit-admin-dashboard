-- Migration: Add new CrossFit box test data
-- Description: Creates a new CrossFit box and assigns existing test users as members
-- Uses existing test users instead of creating new ones

BEGIN;

-- ============================================================================
-- STEP 1: Insert new CrossFit box
-- ============================================================================

INSERT INTO "Box" (id, name, location, latitude, longitude, timezone, currency, active, created_at, updated_at)
VALUES 
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'CrossFit Power Porto', 'Porto, Portugal', 41.1579, -8.6291, 'Europe/Lisbon', 'EUR', true, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- STEP 2: Insert rooms for the new box
-- ============================================================================

INSERT INTO "Room" (id, box_id, name, description, capacity, active, created_at, updated_at)
VALUES 
  ('bbbb2001-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Competition Floor', 'Main competition-style training area', 25, true, NOW(), NOW()),
  ('bbbb2002-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Strength Zone', 'Heavy lifting and powerlifting area', 12, true, NOW(), NOW()),
  ('bbbb2003-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Gymnastics Studio', 'Bodyweight and gymnastics training', 10, true, NOW(), NOW()),
  ('bbbb2004-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Cardio Arena', 'High-intensity cardio workouts', 18, true, NOW(), NOW()),
  ('bbbb2005-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Recovery Lounge', 'Stretching, mobility and recovery', 8, true, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- STEP 3: Add existing users as staff for the new box
-- ============================================================================

INSERT INTO "Box_Staff" (id, box_id, user_id, role, start_date, created_at, updated_at)
VALUES 
  ('bbbb3001-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '82296266-8f1c-41c0-a1ef-45bef7f64bd3', 'admin', '2024-01-01', NOW(), NOW()),
  ('bbbb3002-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '9a38ac6f-7fcc-4f3e-be98-83fe4885bf72', 'coach', '2024-01-01', NOW(), NOW()),
  ('bbbb3003-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'a41a1153-5668-4d3f-942d-2642dc57199c', 'receptionist', '2024-01-01', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- STEP 4: Add existing test users as members of the new box
-- ============================================================================

INSERT INTO "Box_Member" (id, box_id, user_id, seguro_validade, joined_at, created_at, updated_at)
VALUES 
  -- Move existing test users to new box
  ('bbbb4001-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '40279432-b72e-46d9-8eda-9bd45866c872', '2025-12-31', '2024-01-15', NOW(), NOW()),
  ('bbbb4002-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '5ce63e9d-1bcb-471b-97ed-b38683d83bbb', '2025-12-31', '2024-01-20', NOW(), NOW()),
  ('bbbb4003-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '2823b608-353c-4256-90d5-1e6a656532e9', '2025-12-31', '2024-02-01', NOW(), NOW()),
  ('bbbb4004-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '150f85a6-74b8-45c4-b347-b14e05d09b1c', '2025-12-31', '2024-02-05', NOW(), NOW()),
  ('bbbb4005-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '7ce8bbf9-d2d0-4371-a1ff-c18f3ca13f5a', '2025-12-31', '2024-02-10', NOW(), NOW()),
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- STEP 5: Create membership plans for the new box
-- ============================================================================

INSERT INTO "Plan" (id, box_id, name, description, price, max_sessions, created_at, updated_at)
VALUES 
  ('bbbb5001-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Elite Unlimited', 'Unlimited access to all classes and facilities', 90.00, 999, NOW(), NOW()),
  ('bbbb5002-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Competition Prep', 'Specialized training for competitions', 120.00, 999, NOW(), NOW()),
  ('bbbb5003-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Weekend Warrior', 'Perfect for weekend training', 45.00, 8, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- STEP 6: Create classes for the new box with room assignments
-- ============================================================================

INSERT INTO "Class" (id, box_id, room_id, coach_id, datetime, duration, max_capacity, type, waitlist_max, created_at, updated_at)
VALUES 
  -- Monday classes
  ('bbbb6001-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'bbbb2001-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '9a38ac6f-7fcc-4f3e-be98-83fe4885bf72', '2024-12-02 06:30:00', 60, 25, 'CrossFit WOD', 8, NOW(), NOW()),
  ('bbbb6002-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'bbbb2002-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '9a38ac6f-7fcc-4f3e-be98-83fe4885bf72', '2024-12-02 18:00:00', 75, 12, 'Strength & Power', 4, NOW(), NOW()),
  ('bbbb6003-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'bbbb2003-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '9a38ac6f-7fcc-4f3e-be98-83fe4885bf72', '2024-12-02 19:30:00', 45, 10, 'Gymnastics Skills', 3, NOW(), NOW()),
  
  -- Tuesday classes  
  ('bbbb6004-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'bbbb2004-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '9a38ac6f-7fcc-4f3e-be98-83fe4885bf72', '2024-12-03 07:00:00', 45, 18, 'HIIT Cardio', 5, NOW(), NOW()),
  ('bbbb6005-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'bbbb2001-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '9a38ac6f-7fcc-4f3e-be98-83fe4885bf72', '2024-12-03 18:30:00', 60, 25, 'Competition Prep', 10, NOW(), NOW()),
  
  -- Wednesday classes
  ('bbbb6006-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'bbbb2005-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '9a38ac6f-7fcc-4f3e-be98-83fe4885bf72', '2024-12-04 19:00:00', 30, 8, 'Recovery & Mobility', 2, NOW(), NOW()),
  ('bbbb6007-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'bbbb2001-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '9a38ac6f-7fcc-4f3e-be98-83fe4885bf72', '2024-12-04 06:00:00', 60, 25, 'Morning Grind', 8, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

COMMIT;

-- ============================================================================
-- Verification queries (uncomment to run)
-- ============================================================================

-- Verify the new box and its rooms
-- SELECT b.name as box_name, r.name as room_name, r.capacity 
-- FROM "Box" b 
-- JOIN "Room" r ON b.id = r.box_id 
-- WHERE b.id = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'
-- ORDER BY r.name;

-- Verify box members
-- SELECT u.name, bm.joined_at, b.name as box_name
-- FROM "Box_Member" bm
-- JOIN "User_detail" u ON bm.user_id = u.id
-- JOIN "Box" b ON bm.box_id = b.id
-- WHERE bm.box_id = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'
-- ORDER BY bm.joined_at;

-- Verify classes and room assignments
-- SELECT c.type, c.datetime, r.name as room_name, r.capacity
-- FROM "Class" c
-- JOIN "Room" r ON c.room_id = r.id
-- WHERE c.box_id = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'
-- ORDER BY c.datetime;

-- ============================================================================
-- Cleanup script (uncomment to remove new box data)
-- ============================================================================

/*
BEGIN;

-- Delete classes
DELETE FROM "Class" WHERE box_id = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';

-- Delete plans
DELETE FROM "Plan" WHERE box_id = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';

-- Delete box members
DELETE FROM "Box_Member" WHERE box_id = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';

-- Delete box staff
DELETE FROM "Box_Staff" WHERE box_id = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';

-- Delete rooms
DELETE FROM "Room" WHERE box_id = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';

-- Delete box
DELETE FROM "Box" WHERE id = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';

COMMIT;

SELECT 'New CrossFit box data cleaned successfully!' AS message;
*/