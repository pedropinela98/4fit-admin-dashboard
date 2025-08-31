-- Migration: Add test data for Class_Type table
-- Description: Inserts sample class types for CrossFit Test Box

BEGIN;

-- ============================================================================
-- INSERT CLASS TYPE DATA
-- ============================================================================

-- Add comprehensive class types for CrossFit Test Box
INSERT INTO "Class_Type" (id, box_id, name, description, active, created_at, updated_at) VALUES
-- Standard CrossFit classes
('aaaab001-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Regular WOD', 'Standard daily workout of the day for all fitness levels', true, NOW(), NOW()),
('aaaab002-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Beginner WOD', 'Modified workouts designed for new members', true, NOW(), NOW()),
('aaaab003-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Competition Prep', 'Advanced training for competitive athletes', true, NOW(), NOW()),

-- Specialty classes
('aaaab004-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Olympic Lifting', 'Focus on snatch and clean & jerk techniques', true, NOW(), NOW()),
('aaaab005-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Powerlifting', 'Squat, bench press, and deadlift focused sessions', true, NOW(), NOW()),
('aaaab006-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Gymnastics', 'Bodyweight movements and skill development', true, NOW(), NOW()),

-- Cardio and endurance
('aaaab007-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Endurance', 'Longer duration cardio-focused workouts', true, NOW(), NOW()),
('aaaab008-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Rowing', 'Rowing machine technique and endurance training', true, NOW(), NOW()),

-- Recovery and mobility
('aaaab009-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Mobility', 'Stretching and movement quality sessions', true, NOW(), NOW()),
('aaaab00a-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Recovery', 'Active recovery and regeneration sessions', true, NOW(), NOW()),

-- Open sessions
('aaaab00b-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Open Gym', 'Unsupervised training time for members', true, NOW(), NOW()),
('aaaab00c-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Personal Training', 'One-on-one coaching sessions', true, NOW(), NOW());

COMMIT;

-- ============================================================================
-- VERIFICATION QUERIES (commented out - uncomment to verify data)
-- ============================================================================

-- Check all class types for CrossFit Test Box
-- SELECT 
--     ct.name,
--     ct.description,
--     ct.active,
--     ct.created_at
-- FROM "Class_Type" ct
-- JOIN "Box" b ON ct.box_id = b.id
-- WHERE b.name = 'CrossFit Test Box'
-- ORDER BY ct.name;

-- Count class types by box
-- SELECT 
--     b.name as box_name,
--     COUNT(ct.id) as total_class_types,
--     COUNT(CASE WHEN ct.active = true THEN 1 END) as active_class_types
-- FROM "Box" b
-- LEFT JOIN "Class_Type" ct ON b.id = ct.box_id
-- GROUP BY b.id, b.name
-- ORDER BY b.name;