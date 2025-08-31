-- Migration: Optimize public results and PRs queries
-- Description: Adds indexes and views for efficient public results/PRs queries

BEGIN;

-- ============================================================================
-- 1. OPTIMIZED INDEXES FOR PUBLIC RESULTS QUERIES
-- ============================================================================

-- Index on User_detail for efficient JOIN filtering by public_results
CREATE INDEX "User_detail_public_results_id_idx" ON "User_detail" ("public_results", "id");

-- Partial index for public users only (more efficient for public-only queries)
CREATE INDEX "User_detail_public_only_idx" ON "User_detail" ("id") WHERE "public_results" = true;

-- Composite index for PR leaderboard queries (movement + user + value for sorting)
CREATE INDEX "PR_leaderboard_idx" ON "PR" ("movement_id", "user_id", "value" DESC) WHERE "deleted_at" IS NULL;

-- Composite index for workout result leaderboard queries
CREATE INDEX "Workout_Result_leaderboard_idx" ON "Workout_Result" ("workout_id", "user_id") WHERE "deleted_at" IS NULL;

-- Index for user's public PRs (optimize user profile queries)
CREATE INDEX "PR_user_public_idx" ON "PR" ("user_id", "movement_id", "achieved_at" DESC) WHERE "deleted_at" IS NULL;

-- Index for user's public workout results
CREATE INDEX "Workout_Result_user_public_idx" ON "Workout_Result" ("user_id", "date" DESC) WHERE "deleted_at" IS NULL;

-- ============================================================================
-- 2. OPTIMIZED VIEWS FOR PUBLIC DATA
-- ============================================================================

-- View for public PRs with user information
CREATE OR REPLACE VIEW public_prs_view AS
SELECT 
    pr.id,
    pr.user_id,
    u.name as user_name,
    u.email as user_email,
    pr.movement_id,
    m.name as movement_name,
    m.category as movement_category,
    pr.value,
    pr.unit,
    pr.achieved_at,
    pr.created_at
FROM "PR" pr
JOIN "User_detail" u ON pr.user_id = u.id
JOIN "Movement" m ON pr.movement_id = m.id
WHERE u.public_results = true 
  AND pr.deleted_at IS NULL
  AND u.deleted_at IS NULL;

-- View for public workout results with user information  
CREATE OR REPLACE VIEW public_workout_results_view AS
SELECT 
    wr.id,
    wr.user_id,
    u.name as user_name,
    u.email as user_email,
    wr.workout_id,
    w.name as workout_name,
    wr.result_type,
    wr.value,
    wr.date,
    wr.created_at
FROM "Workout_Result" wr
JOIN "User_detail" u ON wr.user_id = u.id
JOIN "Workout" w ON wr.workout_id = w.id
WHERE u.public_results = true 
  AND wr.deleted_at IS NULL
  AND u.deleted_at IS NULL
  AND w.deleted_at IS NULL;

-- ============================================================================
-- 3. SPECIALIZED LEADERBOARD VIEWS
-- ============================================================================

-- PR Leaderboard view by movement (optimized for leaderboard queries)
CREATE OR REPLACE VIEW pr_leaderboard_view AS
SELECT 
    pr.movement_id,
    m.name as movement_name,
    m.category as movement_category,
    pr.unit,
    pr.user_id,
    u.name as user_name,
    pr.value,
    pr.achieved_at,
    -- Ranking within movement/unit combination
    ROW_NUMBER() OVER (
        PARTITION BY pr.movement_id, pr.unit 
        ORDER BY 
            CASE 
                -- For time-based results, lower is better
                WHEN pr.unit = 'minutes' THEN pr.value 
                -- For everything else, higher is better
                ELSE -pr.value 
            END,
            pr.achieved_at DESC
    ) as rank
FROM "PR" pr
JOIN "User_detail" u ON pr.user_id = u.id
JOIN "Movement" m ON pr.movement_id = m.id
WHERE u.public_results = true 
  AND pr.deleted_at IS NULL
  AND u.deleted_at IS NULL;

-- Workout Result Leaderboard view (optimized for workout leaderboards)
CREATE OR REPLACE VIEW workout_leaderboard_view AS
SELECT 
    wr.workout_id,
    w.name as workout_name,
    w.type as workout_type,
    wr.result_type,
    wr.user_id,
    u.name as user_name,
    wr.value,
    wr.date,
    -- Ranking within workout/result_type combination
    ROW_NUMBER() OVER (
        PARTITION BY wr.workout_id, wr.result_type 
        ORDER BY 
            CASE wr.result_type
                -- For time-based results, lower is better (convert to seconds for comparison)
                WHEN 'time' THEN 
                    CASE 
                        WHEN wr.value ~ '^\d+:\d+$' THEN 
                            CAST(split_part(wr.value, ':', 1) AS INT) * 60 + CAST(split_part(wr.value, ':', 2) AS INT)
                        ELSE CAST(wr.value AS INT)
                    END
                -- For everything else, higher is better (negate for DESC order)
                ELSE -CAST(wr.value AS INT)
            END,
            wr.date DESC
    ) as rank
FROM "Workout_Result" wr
JOIN "User_detail" u ON wr.user_id = u.id
JOIN "Workout" w ON wr.workout_id = w.id
WHERE u.public_results = true 
  AND wr.deleted_at IS NULL
  AND u.deleted_at IS NULL
  AND w.deleted_at IS NULL;

-- ============================================================================
-- 4. USER PERFORMANCE SUMMARY VIEW
-- ============================================================================

-- View for user's complete public performance summary
CREATE OR REPLACE VIEW user_performance_summary AS
SELECT 
    u.id as user_id,
    u.name as user_name,
    u.email as user_email,
    
    -- PR statistics
    COUNT(DISTINCT pr.id) as total_prs,
    COUNT(DISTINCT pr.movement_id) as movements_with_prs,
    MAX(pr.achieved_at) as latest_pr_date,
    
    -- Workout result statistics  
    COUNT(DISTINCT wr.id) as total_workout_results,
    COUNT(DISTINCT wr.workout_id) as unique_workouts_completed,
    MAX(wr.date) as latest_workout_date,
    
    -- Recent activity
    COUNT(DISTINCT CASE WHEN pr.achieved_at >= CURRENT_DATE - INTERVAL '30 days' THEN pr.id END) as prs_last_30_days,
    COUNT(DISTINCT CASE WHEN wr.date >= CURRENT_DATE - INTERVAL '30 days' THEN wr.id END) as workouts_last_30_days
    
FROM "User_detail" u
LEFT JOIN "PR" pr ON u.id = pr.user_id AND pr.deleted_at IS NULL
LEFT JOIN "Workout_Result" wr ON u.id = wr.user_id AND wr.deleted_at IS NULL
WHERE u.public_results = true 
  AND u.deleted_at IS NULL
GROUP BY u.id, u.name, u.email;

-- ============================================================================
-- 5. CREATE PERFORMANCE MONITORING FUNCTIONS
-- ============================================================================

-- Function to get top performers for a specific movement
CREATE OR REPLACE FUNCTION get_movement_leaderboard(
    movement_uuid UUID, 
    unit_filter movement_unit DEFAULT NULL,
    limit_count INT DEFAULT 10
)
RETURNS TABLE (
    rank INT,
    user_name VARCHAR,
    value INT,
    unit movement_unit,
    achieved_at TIMESTAMP
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        plv.rank::INT,
        plv.user_name::VARCHAR,
        plv.value,
        plv.unit,
        plv.achieved_at
    FROM pr_leaderboard_view plv
    WHERE plv.movement_id = movement_uuid
      AND (unit_filter IS NULL OR plv.unit = unit_filter)
      AND plv.rank <= limit_count
    ORDER BY plv.rank;
END;
$$ LANGUAGE plpgsql;

-- Function to get workout leaderboard
CREATE OR REPLACE FUNCTION get_workout_leaderboard(
    workout_uuid UUID,
    result_type_filter result_type DEFAULT NULL,
    limit_count INT DEFAULT 10
)
RETURNS TABLE (
    rank INT,
    user_name VARCHAR,
    value VARCHAR,
    result_type result_type,
    date DATE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        wlv.rank::INT,
        wlv.user_name::VARCHAR,
        wlv.value,
        wlv.result_type,
        wlv.date
    FROM workout_leaderboard_view wlv
    WHERE wlv.workout_id = workout_uuid
      AND (result_type_filter IS NULL OR wlv.result_type = result_type_filter)
      AND wlv.rank <= limit_count
    ORDER BY wlv.rank;
END;
$$ LANGUAGE plpgsql;

COMMIT;

-- ============================================================================
-- USAGE EXAMPLES (commented out - uncomment to test)
-- ============================================================================

-- Get Back Squat leaderboard for kg
-- SELECT * FROM get_movement_leaderboard(
--     'aaaaa009-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 
--     'kg', 
--     5
-- );

-- Get workout leaderboard for time results
-- SELECT * FROM get_workout_leaderboard(
--     'aaaaa00c-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
--     'time',
--     10
-- );

-- View all public PRs for a movement
-- SELECT * FROM public_prs_view 
-- WHERE movement_id = 'aaaaa009-aaaa-aaaa-aaaa-aaaaaaaaaaaa' 
-- ORDER BY value DESC;

-- View user performance summary
-- SELECT * FROM user_performance_summary 
-- ORDER BY total_prs DESC;

-- View PR leaderboard with rankings
-- SELECT * FROM pr_leaderboard_view 
-- WHERE movement_name = 'Back Squat' AND unit = 'kg'
-- ORDER BY rank
-- LIMIT 10;