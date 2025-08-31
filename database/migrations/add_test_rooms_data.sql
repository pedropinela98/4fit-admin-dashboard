-- Migration: Add test room data
-- Description: Adds sample room data for testing purposes
-- This should be run after the Room table has been created

BEGIN;

-- ============================================================================
-- Insert test rooms for the existing test box
-- ============================================================================

INSERT INTO "Room" (id, box_id, name, description, capacity, active, created_at, updated_at)
VALUES 
  ('aaaa1001-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Main Training Area', 'Primary workout space with full equipment', 20, true, NOW(), NOW()),
  ('aaaa1002-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Small Group Studio', 'Intimate space for small group training', 8, true, NOW(), NOW()),
  ('aaaa1003-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Recovery Room', 'Space for stretching and mobility work', 12, true, NOW(), NOW()),
  ('aaaa1004-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Olympic Lifting Platform', 'Dedicated space for weightlifting', 6, true, NOW(), NOW()),
  ('aaaa1005-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Cardio Zone', 'Area for rowing, biking, and running', 15, true, NOW(), NOW())
ON CONFLICT (id) DO NOTHING; -- Prevent duplicate insertions if script is run multiple times

-- ============================================================================
-- Update existing test class to use a room
-- ============================================================================

-- Only update if the class exists and doesn't already have a room_id
UPDATE "Class" 
SET room_id = 'aaaa1001-aaaa-aaaa-aaaa-aaaaaaaaaaaa' -- Main Training Area
WHERE id = 'aaaaa006-aaaa-aaaa-aaaa-aaaaaaaaaaaa' 
  AND (room_id IS NULL OR room_id = '');

-- ============================================================================
-- Insert additional test classes using different rooms
-- ============================================================================

INSERT INTO "Class" (id, box_id, room_id, coach_id, datetime, duration, max_capacity, type, waitlist_max, created_at, updated_at)
VALUES 
  ('aaaaa016-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'aaaa1002-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '9a38ac6f-7fcc-4f3e-be98-83fe4885bf72', '2024-11-25 18:00:00', 45, 8, 'Small Group', 3, NOW(), NOW()),
  ('aaaaa017-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'aaaa1003-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '9a38ac6f-7fcc-4f3e-be98-83fe4885bf72', '2024-11-25 19:30:00', 30, 12, 'Mobility', 2, NOW(), NOW()),
  ('aaaaa018-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'aaaa1004-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '9a38ac6f-7fcc-4f3e-be98-83fe4885bf72', '2024-11-26 07:00:00', 60, 6, 'Olympic Lifting', 0, NOW(), NOW()),
  ('aaaaa019-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'aaaa1005-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '9a38ac6f-7fcc-4f3e-be98-83fe4885bf72', '2024-11-26 06:00:00', 45, 15, 'Cardio Blast', 5, NOW(), NOW())
ON CONFLICT (id) DO NOTHING; -- Prevent duplicate insertions

COMMIT;

-- ============================================================================
-- Verification queries (optional - uncomment to run)
-- ============================================================================

-- Verify rooms were created
-- SELECT r.id, r.name, r.capacity, b.name as box_name 
-- FROM "Room" r 
-- JOIN "Box" b ON r.box_id = b.id 
-- WHERE b.id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';

-- Verify classes have room assignments
-- SELECT c.id, c.type, c.datetime, r.name as room_name 
-- FROM "Class" c 
-- JOIN "Room" r ON c.room_id = r.id 
-- WHERE c.box_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'
-- ORDER BY c.datetime;

-- ============================================================================
-- Cleanup script (uncomment and run to remove test room data)
-- ============================================================================

/*
BEGIN;

-- Delete test classes that use the test rooms
DELETE FROM "Class" WHERE id IN (
  'aaaaa016-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  'aaaaa017-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 
  'aaaaa018-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  'aaaaa019-aaaa-aaaa-aaaa-aaaaaaaaaaaa'
);

-- Remove room_id from original test class
UPDATE "Class" SET room_id = NULL WHERE id = 'aaaaa006-aaaa-aaaa-aaaa-aaaaaaaaaaaa';

-- Delete test rooms
DELETE FROM "Room" WHERE id IN (
  'aaaa1001-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  'aaaa1002-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  'aaaa1003-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  'aaaa1004-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  'aaaa1005-aaaa-aaaa-aaaa-aaaaaaaaaaaa'
);

COMMIT;

SELECT 'Test room data cleaned successfully!' AS message;
*/