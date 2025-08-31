-- Migration: Add test data for Weight_History table
-- Description: Inserts sample weight history data showing users' weight progression over time

BEGIN;

-- ============================================================================
-- INSERT WEIGHT HISTORY DATA
-- ============================================================================

-- Pedro Member's weight progression over 12 months
INSERT INTO "Weight_History" (user_id, weight, notes, created_at) VALUES
-- Starting weight: 85.5kg (12 months ago)
('d9bbcfa3-027a-4b7c-881e-7f8c163949d7', 85.50, 'Initial weigh-in', NOW() - INTERVAL '12 months'),
-- Weight after 3 months: 82.2kg (9 months ago)
('d9bbcfa3-027a-4b7c-881e-7f8c163949d7', 82.20, 'After cutting phase', NOW() - INTERVAL '9 months'),
-- Weight after bulking: 87.8kg (6 months ago)
('d9bbcfa3-027a-4b7c-881e-7f8c163949d7', 87.80, 'End of bulk', NOW() - INTERVAL '6 months'),
-- Current cut progress: 84.5kg (3 months ago)
('d9bbcfa3-027a-4b7c-881e-7f8c163949d7', 84.50, 'Mid cut', NOW() - INTERVAL '3 months'),
-- Latest weight: 81.2kg (1 month ago)
('d9bbcfa3-027a-4b7c-881e-7f8c163949d7', 81.20, 'Competition prep', NOW() - INTERVAL '1 month');

-- Camila Athlete's weight progression
INSERT INTO "Weight_History" (user_id, weight, notes, created_at) VALUES
-- Starting weight: 62.5kg (8 months ago)
('fb76cc05-e9c4-4a04-b929-b2e89d793e09', 62.50, 'Started training', NOW() - INTERVAL '8 months'),
-- Gained muscle: 64.8kg (5 months ago)
('fb76cc05-e9c4-4a04-b929-b2e89d793e09', 64.80, 'Strength gains', NOW() - INTERVAL '5 months'),
-- Leaned out: 61.3kg (2 months ago)
('fb76cc05-e9c4-4a04-b929-b2e89d793e09', 61.30, 'Summer cut', NOW() - INTERVAL '2 months'),
-- Current: 63.2kg (2 weeks ago)
('fb76cc05-e9c4-4a04-b929-b2e89d793e09', 63.20, 'Maintenance phase', NOW() - INTERVAL '2 weeks');

-- Test User 1's weight progression  
INSERT INTO "Weight_History" (user_id, weight, notes, created_at) VALUES
-- Starting: 95.2kg (6 months ago)
('40279432-b72e-46d9-8eda-9bd45866c872', 95.20, 'New member weigh-in', NOW() - INTERVAL '6 months'),
-- Progress: 91.5kg (4 months ago)
('40279432-b72e-46d9-8eda-9bd45866c872', 91.50, 'Diet and training', NOW() - INTERVAL '4 months'),
-- More progress: 88.7kg (2 months ago)
('40279432-b72e-46d9-8eda-9bd45866c872', 88.70, 'Consistent progress', NOW() - INTERVAL '2 months'),
-- Current: 86.1kg (3 weeks ago)
('40279432-b72e-46d9-8eda-9bd45866c872', 86.10, 'Goal weight approaching', NOW() - INTERVAL '3 weeks');

-- Test User 3's weight maintenance
INSERT INTO "Weight_History" (user_id, weight, notes, created_at) VALUES
-- Stable weight: 70.5kg (4 months ago)
('2823b608-353c-4256-90d5-1e6a656532e9', 70.50, 'Baseline measurement', NOW() - INTERVAL '4 months'),
-- Slight fluctuation: 71.2kg (2 months ago)
('2823b608-353c-4256-90d5-1e6a656532e9', 71.20, 'Holiday weight', NOW() - INTERVAL '2 months'),
-- Back to baseline: 70.8kg (1 month ago)
('2823b608-353c-4256-90d5-1e6a656532e9', 70.80, 'Back on track', NOW() - INTERVAL '1 month');

COMMIT;

-- ============================================================================
-- VERIFICATION QUERIES (commented out - uncomment to verify data)
-- ============================================================================

-- Check Pedro Member's weight progression
-- SELECT 
--     wh.weight,
--     wh.notes,
--     wh.created_at
-- FROM "Weight_History" wh
-- JOIN "User_detail" u ON wh.user_id = u.id
-- WHERE u.name = 'Pedro Member'
-- ORDER BY wh.created_at;

-- Calculate weight changes for all users
-- WITH weight_changes AS (
--     SELECT 
--         u.name,
--         wh.weight,
--         wh.created_at,
--         LAG(wh.weight) OVER (PARTITION BY wh.user_id ORDER BY wh.created_at) as previous_weight
--     FROM "Weight_History" wh
--     JOIN "User_detail" u ON wh.user_id = u.id
-- )
-- SELECT 
--     name,
--     weight || 'kg' as current_weight,
--     previous_weight || 'kg' as previous_weight,
--     ROUND((weight - previous_weight), 1) || 'kg' as weight_change,
--     created_at
-- FROM weight_changes
-- WHERE previous_weight IS NOT NULL
-- ORDER BY name, created_at;