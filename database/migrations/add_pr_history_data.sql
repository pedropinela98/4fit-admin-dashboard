-- Migration: Add test data for PR_History table
-- Description: Inserts sample PR history data showing progression of athletes' personal records

BEGIN;

-- ============================================================================
-- INSERT PR HISTORY DATA
-- ============================================================================

-- Pedro Member's Back Squat progression: 80kg → 90kg (current: 100kg)
INSERT INTO "PR_History" (user_id, movement_id, value, unit, achieved_at, created_at) VALUES
-- First PR: 80kg (achieved 6 months ago, superseded 3 months ago)
('d9bbcfa3-027a-4b7c-881e-7f8c163949d7', 
 'aaaaa009-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 
 80, 'kg', 
 NOW() - INTERVAL '6 months', 
 NOW() - INTERVAL '3 months'),

-- Second PR: 90kg (achieved 3 months ago, superseded 1 month ago) 
('d9bbcfa3-027a-4b7c-881e-7f8c163949d7', 
 'aaaaa009-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 
 90, 'kg', 
 NOW() - INTERVAL '3 months', 
 NOW() - INTERVAL '1 month');

-- Camila Athlete's Pull-up progression: 5 reps → 8 reps (current: 12 reps)
INSERT INTO "PR_History" (user_id, movement_id, value, unit, achieved_at, created_at) VALUES
-- First PR: 5 reps (achieved 5 months ago, superseded 2 months ago)
('fb76cc05-e9c4-4a04-b929-b2e89d793e09', 
 'aaaaa00a-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 
 5, 'reps', 
 NOW() - INTERVAL '5 months', 
 NOW() - INTERVAL '2 months'),

-- Second PR: 8 reps (achieved 2 months ago, superseded 3 weeks ago)
('fb76cc05-e9c4-4a04-b929-b2e89d793e09', 
 'aaaaa00a-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 
 8, 'reps', 
 NOW() - INTERVAL '2 months', 
 NOW() - INTERVAL '3 weeks');

-- Test User 1's Row progression: 2200m → 2400m (current: 2500m)
INSERT INTO "PR_History" (user_id, movement_id, value, unit, achieved_at, created_at) VALUES
-- First PR: 2200m (achieved 4 months ago, superseded 6 weeks ago)
('40279432-b72e-46d9-8eda-9bd45866c872', 
 'aaaaa00b-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 
 2200, 'meters', 
 NOW() - INTERVAL '4 months', 
 NOW() - INTERVAL '6 weeks'),

-- Second PR: 2400m (achieved 6 weeks ago, superseded 1 week ago)
('40279432-b72e-46d9-8eda-9bd45866c872', 
 'aaaaa00b-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 
 2400, 'meters', 
 NOW() - INTERVAL '6 weeks', 
 NOW() - INTERVAL '1 week');

COMMIT;

-- ============================================================================
-- VERIFICATION QUERIES (commented out - uncomment to verify data)
-- ============================================================================

-- Check PR history for Pedro Member's Back Squat progression
-- SELECT 
--     ph.value,
--     ph.unit,
--     ph.achieved_at,
--     ph.created_at as moved_to_history_at
-- FROM "PR_History" ph
-- JOIN "User_detail" u ON ph.user_id = u.id
-- JOIN "Movement" m ON ph.movement_id = m.id
-- WHERE u.name = 'Pedro Member'
--   AND m.name = 'Back Squat'
-- ORDER BY ph.achieved_at;

-- Compare current PR vs historical PRs for all users
-- WITH current_prs AS (
--     SELECT 
--         u.name as athlete_name,
--         m.name as movement_name,
--         pr.value as current_value,
--         pr.unit,
--         pr.achieved_at as current_achieved_at
--     FROM "PR" pr
--     JOIN "User_detail" u ON pr.user_id = u.id
--     JOIN "Movement" m ON pr.movement_id = m.id
--     WHERE pr.deleted_at IS NULL
-- ),
-- historical_prs AS (
--     SELECT 
--         u.name as athlete_name,
--         m.name as movement_name,
--         ph.value as historical_value,
--         ph.unit,
--         ph.achieved_at as historical_achieved_at
--     FROM "PR_History" ph
--     JOIN "User_detail" u ON ph.user_id = u.id
--     JOIN "Movement" m ON ph.movement_id = m.id
-- )
-- SELECT 
--     c.athlete_name,
--     c.movement_name,
--     h.historical_value || ' ' || h.unit as previous_pr,
--     h.historical_achieved_at,
--     c.current_value || ' ' || c.unit as current_pr,
--     c.current_achieved_at
-- FROM current_prs c
-- LEFT JOIN historical_prs h ON c.athlete_name = h.athlete_name 
--                            AND c.movement_name = h.movement_name
-- WHERE h.historical_value IS NOT NULL
-- ORDER BY c.athlete_name, c.movement_name, h.historical_achieved_at;