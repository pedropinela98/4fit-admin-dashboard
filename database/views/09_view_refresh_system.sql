-- ===============================================
-- VIEW REFRESH SYSTEM
-- ===============================================
-- PURPOSE: Automate materialized view refresh with triggers and schedules
--          to ensure data freshness while minimizing refresh overhead
-- IMPACT:  Automated maintenance, optimal refresh timing, monitoring
-- ===============================================

SET search_path TO public;

-- ===============================================
-- REFRESH MANAGEMENT TABLE
-- ===============================================

-- Create table to track view refresh status and schedules
CREATE TABLE IF NOT EXISTS view_refresh_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    view_name TEXT NOT NULL,
    refresh_type TEXT NOT NULL, -- 'manual', 'triggered', 'scheduled'
    refresh_started_at TIMESTAMP NOT NULL DEFAULT NOW(),
    refresh_completed_at TIMESTAMP,
    refresh_duration_ms INT,
    rows_affected INT,
    success BOOLEAN,
    error_message TEXT,
    triggered_by TEXT, -- function name, user, or 'cron'
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_view_refresh_log_view_name ON view_refresh_log (view_name, refresh_started_at DESC);
CREATE INDEX idx_view_refresh_log_success ON view_refresh_log (success, refresh_started_at DESC);

-- ===============================================
-- ENHANCED REFRESH FUNCTIONS WITH LOGGING
-- ===============================================

-- Enhanced user box access refresh with logging
CREATE OR REPLACE FUNCTION refresh_user_box_access_view_logged()
RETURNS JSON AS $$
DECLARE
    start_time TIMESTAMP;
    end_time TIMESTAMP;
    duration_ms INT;
    rows_count INT;
    log_id UUID;
    error_msg TEXT;
BEGIN
    start_time := clock_timestamp();
    
    -- Insert start log
    INSERT INTO view_refresh_log (view_name, refresh_type, triggered_by)
    VALUES ('user_box_access_view', 'manual', 'refresh_user_box_access_view_logged')
    RETURNING id INTO log_id;
    
    BEGIN
        -- Refresh the materialized view
        REFRESH MATERIALIZED VIEW CONCURRENTLY user_box_access_view;
        
        -- Get row count
        SELECT COUNT(*) INTO rows_count FROM user_box_access_view;
        
        end_time := clock_timestamp();
        duration_ms := EXTRACT(milliseconds FROM (end_time - start_time))::INT;
        
        -- Update log with success
        UPDATE view_refresh_log 
        SET refresh_completed_at = end_time,
            refresh_duration_ms = duration_ms,
            rows_affected = rows_count,
            success = true
        WHERE id = log_id;
        
        RETURN json_build_object(
            'success', true,
            'view_name', 'user_box_access_view',
            'duration_ms', duration_ms,
            'rows_affected', rows_count,
            'message', 'User box access view refreshed successfully'
        );
        
    EXCEPTION WHEN OTHERS THEN
        error_msg := SQLERRM;
        end_time := clock_timestamp();
        duration_ms := EXTRACT(milliseconds FROM (end_time - start_time))::INT;
        
        -- Update log with error
        UPDATE view_refresh_log 
        SET refresh_completed_at = end_time,
            refresh_duration_ms = duration_ms,
            success = false,
            error_message = error_msg
        WHERE id = log_id;
        
        RETURN json_build_object(
            'success', false,
            'view_name', 'user_box_access_view',
            'error', error_msg,
            'duration_ms', duration_ms
        );
    END;
END;
$$ LANGUAGE plpgsql;

-- Enhanced class attendance summary refresh with logging
CREATE OR REPLACE FUNCTION refresh_class_attendance_summary_view_logged()
RETURNS JSON AS $$
DECLARE
    start_time TIMESTAMP;
    end_time TIMESTAMP;
    duration_ms INT;
    rows_count INT;
    log_id UUID;
    error_msg TEXT;
BEGIN
    start_time := clock_timestamp();
    
    INSERT INTO view_refresh_log (view_name, refresh_type, triggered_by)
    VALUES ('class_attendance_summary_view', 'manual', 'refresh_class_attendance_summary_view_logged')
    RETURNING id INTO log_id;
    
    BEGIN
        REFRESH MATERIALIZED VIEW CONCURRENTLY class_attendance_summary_view;
        
        SELECT COUNT(*) INTO rows_count FROM class_attendance_summary_view;
        
        end_time := clock_timestamp();
        duration_ms := EXTRACT(milliseconds FROM (end_time - start_time))::INT;
        
        UPDATE view_refresh_log 
        SET refresh_completed_at = end_time,
            refresh_duration_ms = duration_ms,
            rows_affected = rows_count,
            success = true
        WHERE id = log_id;
        
        RETURN json_build_object(
            'success', true,
            'view_name', 'class_attendance_summary_view',
            'duration_ms', duration_ms,
            'rows_affected', rows_count,
            'message', 'Class attendance summary view refreshed successfully'
        );
        
    EXCEPTION WHEN OTHERS THEN
        error_msg := SQLERRM;
        end_time := clock_timestamp();
        duration_ms := EXTRACT(milliseconds FROM (end_time - start_time))::INT;
        
        UPDATE view_refresh_log 
        SET refresh_completed_at = end_time,
            refresh_duration_ms = duration_ms,
            success = false,
            error_message = error_msg
        WHERE id = log_id;
        
        RETURN json_build_object(
            'success', false,
            'view_name', 'class_attendance_summary_view',
            'error', error_msg,
            'duration_ms', duration_ms
        );
    END;
END;
$$ LANGUAGE plpgsql;

-- Enhanced box member stats refresh with logging
CREATE OR REPLACE FUNCTION refresh_box_member_stats_view_logged()
RETURNS JSON AS $$
DECLARE
    start_time TIMESTAMP;
    end_time TIMESTAMP;
    duration_ms INT;
    rows_count INT;
    log_id UUID;
    error_msg TEXT;
BEGIN
    start_time := clock_timestamp();
    
    INSERT INTO view_refresh_log (view_name, refresh_type, triggered_by)
    VALUES ('box_member_stats_view', 'manual', 'refresh_box_member_stats_view_logged')
    RETURNING id INTO log_id;
    
    BEGIN
        REFRESH MATERIALIZED VIEW CONCURRENTLY box_member_stats_view;
        
        SELECT COUNT(*) INTO rows_count FROM box_member_stats_view;
        
        end_time := clock_timestamp();
        duration_ms := EXTRACT(milliseconds FROM (end_time - start_time))::INT;
        
        UPDATE view_refresh_log 
        SET refresh_completed_at = end_time,
            refresh_duration_ms = duration_ms,
            rows_affected = rows_count,
            success = true
        WHERE id = log_id;
        
        RETURN json_build_object(
            'success', true,
            'view_name', 'box_member_stats_view',
            'duration_ms', duration_ms,
            'rows_affected', rows_count,
            'message', 'Box member stats view refreshed successfully'
        );
        
    EXCEPTION WHEN OTHERS THEN
        error_msg := SQLERRM;
        end_time := clock_timestamp();
        duration_ms := EXTRACT(milliseconds FROM (end_time - start_time))::INT;
        
        UPDATE view_refresh_log 
        SET refresh_completed_at = end_time,
            refresh_duration_ms = duration_ms,
            success = false,
            error_message = error_msg
        WHERE id = log_id;
        
        RETURN json_build_object(
            'success', false,
            'view_name', 'box_member_stats_view',
            'error', error_msg,
            'duration_ms', duration_ms
        );
    END;
END;
$$ LANGUAGE plpgsql;

-- Enhanced workout leaderboard refresh with logging
CREATE OR REPLACE FUNCTION refresh_workout_leaderboard_view_logged()
RETURNS JSON AS $$
DECLARE
    start_time TIMESTAMP;
    end_time TIMESTAMP;
    duration_ms INT;
    rows_count INT;
    log_id UUID;
    error_msg TEXT;
BEGIN
    start_time := clock_timestamp();
    
    INSERT INTO view_refresh_log (view_name, refresh_type, triggered_by)
    VALUES ('workout_leaderboard_view', 'manual', 'refresh_workout_leaderboard_view_logged')
    RETURNING id INTO log_id;
    
    BEGIN
        REFRESH MATERIALIZED VIEW CONCURRENTLY workout_leaderboard_view;
        
        SELECT COUNT(*) INTO rows_count FROM workout_leaderboard_view;
        
        end_time := clock_timestamp();
        duration_ms := EXTRACT(milliseconds FROM (end_time - start_time))::INT;
        
        UPDATE view_refresh_log 
        SET refresh_completed_at = end_time,
            refresh_duration_ms = duration_ms,
            rows_affected = rows_count,
            success = true
        WHERE id = log_id;
        
        RETURN json_build_object(
            'success', true,
            'view_name', 'workout_leaderboard_view',
            'duration_ms', duration_ms,
            'rows_affected', rows_count,
            'message', 'Workout leaderboard view refreshed successfully'
        );
        
    EXCEPTION WHEN OTHERS THEN
        error_msg := SQLERRM;
        end_time := clock_timestamp();
        duration_ms := EXTRACT(milliseconds FROM (end_time - start_time))::INT;
        
        UPDATE view_refresh_log 
        SET refresh_completed_at = end_time,
            refresh_duration_ms = duration_ms,
            success = false,
            error_message = error_msg
        WHERE id = log_id;
        
        RETURN json_build_object(
            'success', false,
            'view_name', 'workout_leaderboard_view',
            'error', error_msg,
            'duration_ms', duration_ms
        );
    END;
END;
$$ LANGUAGE plpgsql;

-- ===============================================
-- INTELLIGENT BATCH REFRESH FUNCTION
-- ===============================================

-- Function to refresh multiple views efficiently
CREATE OR REPLACE FUNCTION refresh_all_materialized_views(
    force_refresh BOOLEAN DEFAULT false,
    max_age_minutes INT DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
    start_time TIMESTAMP;
    end_time TIMESTAMP;
    total_duration_ms INT;
    refresh_results JSON[];
    result JSON;
    view_list TEXT[] := ARRAY[
        'user_box_access_view',
        'class_attendance_summary_view', 
        'box_member_stats_view',
        'workout_leaderboard_view'
    ];
    view_name TEXT;
    last_refresh TIMESTAMP;
BEGIN
    start_time := clock_timestamp();
    refresh_results := ARRAY[]::JSON[];
    
    FOREACH view_name IN ARRAY view_list LOOP
        -- Check if refresh is needed (if max_age_minutes is specified)
        IF max_age_minutes IS NOT NULL AND force_refresh = false THEN
            SELECT MAX(refresh_completed_at) 
            INTO last_refresh
            FROM view_refresh_log 
            WHERE view_refresh_log.view_name = refresh_all_materialized_views.view_name
            AND success = true;
            
            -- Skip if recently refreshed
            IF last_refresh IS NOT NULL 
               AND last_refresh > NOW() - (max_age_minutes || ' minutes')::INTERVAL THEN
                
                result := json_build_object(
                    'view_name', view_name,
                    'skipped', true,
                    'reason', 'Recently refreshed',
                    'last_refresh', last_refresh
                );
                refresh_results := array_append(refresh_results, result);
                CONTINUE;
            END IF;
        END IF;
        
        -- Refresh the view
        CASE view_name
            WHEN 'user_box_access_view' THEN
                result := refresh_user_box_access_view_logged();
            WHEN 'class_attendance_summary_view' THEN
                result := refresh_class_attendance_summary_view_logged();
            WHEN 'box_member_stats_view' THEN
                result := refresh_box_member_stats_view_logged();
            WHEN 'workout_leaderboard_view' THEN
                result := refresh_workout_leaderboard_view_logged();
            ELSE
                result := json_build_object(
                    'success', false,
                    'view_name', view_name,
                    'error', 'Unknown view name'
                );
        END CASE;
        
        refresh_results := array_append(refresh_results, result);
    END LOOP;
    
    end_time := clock_timestamp();
    total_duration_ms := EXTRACT(milliseconds FROM (end_time - start_time))::INT;
    
    RETURN json_build_object(
        'success', true,
        'total_duration_ms', total_duration_ms,
        'refreshed_at', end_time,
        'results', array_to_json(refresh_results)
    );
END;
$$ LANGUAGE plpgsql;

-- ===============================================
-- TRIGGER-BASED REFRESH FUNCTIONS
-- ===============================================

-- Function to conditionally refresh attendance summary after attendance changes
CREATE OR REPLACE FUNCTION trigger_attendance_summary_refresh()
RETURNS TRIGGER AS $$
DECLARE
    last_refresh TIMESTAMP;
    log_entry JSON;
BEGIN
    -- Check if we refreshed in the last 4 hours to avoid excessive refreshes (conservative)
    SELECT MAX(refresh_completed_at)
    INTO last_refresh
    FROM view_refresh_log 
    WHERE view_name = 'class_attendance_summary_view'
    AND success = true;
    
    -- Only refresh if it's been more than 4 hours or never refreshed (conservative)
    IF last_refresh IS NULL OR last_refresh < NOW() - INTERVAL '4 hours' THEN
        -- Perform async refresh (in a background job if possible)
        -- For now, we'll just log that a refresh is needed
        INSERT INTO view_refresh_log (
            view_name, 
            refresh_type, 
            triggered_by,
            success,
            error_message
        ) VALUES (
            'class_attendance_summary_view',
            'triggered',
            'trigger_attendance_summary_refresh',
            false,
            'Refresh needed - schedule background job'
        );
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Function to refresh user access after membership/staff changes
CREATE OR REPLACE FUNCTION trigger_user_access_refresh()
RETURNS TRIGGER AS $$
DECLARE
    last_refresh TIMESTAMP;
BEGIN
    -- Check if we refreshed in the last 12 hours (conservative)
    SELECT MAX(refresh_completed_at)
    INTO last_refresh
    FROM view_refresh_log 
    WHERE view_name = 'user_box_access_view'
    AND success = true;
    
    -- Only trigger if it's been more than 12 hours (conservative)
    IF last_refresh IS NULL OR last_refresh < NOW() - INTERVAL '12 hours' THEN
        INSERT INTO view_refresh_log (
            view_name, 
            refresh_type, 
            triggered_by,
            success,
            error_message
        ) VALUES (
            'user_box_access_view',
            'triggered',
            'trigger_user_access_refresh',
            false,
            'Refresh needed - schedule background job'
        );
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Function to refresh workout leaderboard after new results
CREATE OR REPLACE FUNCTION trigger_leaderboard_refresh()
RETURNS TRIGGER AS $$
DECLARE
    last_refresh TIMESTAMP;
BEGIN
    -- Check if we refreshed in the last 12 hours (conservative)
    SELECT MAX(refresh_completed_at)
    INTO last_refresh
    FROM view_refresh_log 
    WHERE view_name = 'workout_leaderboard_view'
    AND success = true;
    
    -- Only trigger if it's been more than 12 hours (conservative)
    IF last_refresh IS NULL OR last_refresh < NOW() - INTERVAL '12 hours' THEN
        INSERT INTO view_refresh_log (
            view_name, 
            refresh_type, 
            triggered_by,
            success,
            error_message
        ) VALUES (
            'workout_leaderboard_view',
            'triggered',
            'trigger_leaderboard_refresh',
            false,
            'Refresh needed - schedule background job'
        );
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- ===============================================
-- CREATE TRIGGERS
-- ===============================================

-- Triggers for attendance summary refresh
DROP TRIGGER IF EXISTS attendance_summary_refresh_trigger ON "Class_Attendance";
CREATE TRIGGER attendance_summary_refresh_trigger
    AFTER INSERT OR UPDATE OR DELETE ON "Class_Attendance"
    FOR EACH STATEMENT
    EXECUTE FUNCTION trigger_attendance_summary_refresh();

DROP TRIGGER IF EXISTS waitlist_summary_refresh_trigger ON "Class_Waitlist";
CREATE TRIGGER waitlist_summary_refresh_trigger
    AFTER INSERT OR UPDATE OR DELETE ON "Class_Waitlist"
    FOR EACH STATEMENT
    EXECUTE FUNCTION trigger_attendance_summary_refresh();

-- Triggers for user access refresh
DROP TRIGGER IF EXISTS user_access_refresh_trigger_staff ON "Box_Staff";
CREATE TRIGGER user_access_refresh_trigger_staff
    AFTER INSERT OR UPDATE OR DELETE ON "Box_Staff"
    FOR EACH STATEMENT
    EXECUTE FUNCTION trigger_user_access_refresh();

DROP TRIGGER IF EXISTS user_access_refresh_trigger_member ON "Box_Member";
CREATE TRIGGER user_access_refresh_trigger_member
    AFTER INSERT OR UPDATE OR DELETE ON "Box_Member"
    FOR EACH STATEMENT
    EXECUTE FUNCTION trigger_user_access_refresh();

-- Triggers for workout leaderboard refresh
DROP TRIGGER IF EXISTS leaderboard_refresh_trigger ON "Workout_Result";
CREATE TRIGGER leaderboard_refresh_trigger
    AFTER INSERT OR UPDATE OR DELETE ON "Workout_Result"
    FOR EACH STATEMENT
    EXECUTE FUNCTION trigger_leaderboard_refresh();

-- ===============================================
-- MONITORING AND MAINTENANCE FUNCTIONS
-- ===============================================

-- Function to get refresh status summary
CREATE OR REPLACE FUNCTION get_view_refresh_status()
RETURNS TABLE(
    view_name TEXT,
    last_success_refresh TIMESTAMP,
    last_failure_refresh TIMESTAMP,
    avg_duration_ms INT,
    total_refreshes BIGINT,
    success_rate DECIMAL,
    needs_refresh BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    WITH refresh_stats AS (
        SELECT 
            vrl.view_name,
            MAX(vrl.refresh_completed_at) FILTER (WHERE vrl.success = true) as last_success,
            MAX(vrl.refresh_completed_at) FILTER (WHERE vrl.success = false) as last_failure,
            AVG(vrl.refresh_duration_ms) FILTER (WHERE vrl.success = true) as avg_duration,
            COUNT(*) as total_refreshes,
            (COUNT(*) FILTER (WHERE vrl.success = true)::decimal / COUNT(*)) * 100 as success_rate
        FROM view_refresh_log vrl
        WHERE vrl.refresh_completed_at >= NOW() - INTERVAL '7 days'
        GROUP BY vrl.view_name
    )
    SELECT 
        rs.view_name,
        rs.last_success as last_success_refresh,
        rs.last_failure as last_failure_refresh,
        rs.avg_duration::INT as avg_duration_ms,
        rs.total_refreshes,
        ROUND(rs.success_rate, 2) as success_rate,
        CASE 
            WHEN rs.last_success IS NULL THEN true
            -- Conservative schedule: all views refresh daily
            WHEN rs.last_success < NOW() - INTERVAL '1 day' THEN true
            -- Optimized schedule (commented for future use):
            -- WHEN rs.view_name = 'class_attendance_summary_view' AND rs.last_success < NOW() - INTERVAL '15 minutes' THEN true
            -- WHEN rs.view_name = 'user_box_access_view' AND rs.last_success < NOW() - INTERVAL '1 hour' THEN true
            -- WHEN rs.view_name = 'workout_leaderboard_view' AND rs.last_success < NOW() - INTERVAL '4 hours' THEN true
            ELSE false
        END as needs_refresh
    FROM refresh_stats rs
    ORDER BY rs.view_name;
END;
$$ LANGUAGE plpgsql STABLE;

-- Function to clean old refresh logs
CREATE OR REPLACE FUNCTION cleanup_view_refresh_logs(days_to_keep INT DEFAULT 30)
RETURNS INT AS $$
DECLARE
    deleted_count INT;
BEGIN
    DELETE FROM view_refresh_log 
    WHERE refresh_started_at < NOW() - (days_to_keep || ' days')::INTERVAL;
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    RAISE NOTICE 'Cleaned up % old refresh log entries', deleted_count;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Grant permissions
GRANT SELECT, INSERT, UPDATE ON view_refresh_log TO authenticated;
GRANT EXECUTE ON FUNCTION refresh_user_box_access_view_logged() TO authenticated;
GRANT EXECUTE ON FUNCTION refresh_class_attendance_summary_view_logged() TO authenticated;
GRANT EXECUTE ON FUNCTION refresh_box_member_stats_view_logged() TO authenticated;
GRANT EXECUTE ON FUNCTION refresh_workout_leaderboard_view_logged() TO authenticated;
GRANT EXECUTE ON FUNCTION refresh_all_materialized_views(BOOLEAN, INT) TO authenticated;
GRANT EXECUTE ON FUNCTION get_view_refresh_status() TO authenticated;
GRANT EXECUTE ON FUNCTION cleanup_view_refresh_logs(INT) TO authenticated;

-- Success message
DO $$
BEGIN
    RAISE NOTICE '✅ View Refresh System created successfully!';
    RAISE NOTICE '';
    RAISE NOTICE '🔄 REFRESH FUNCTIONS:';
    RAISE NOTICE '  - refresh_user_box_access_view_logged()';
    RAISE NOTICE '  - refresh_class_attendance_summary_view_logged()';
    RAISE NOTICE '  - refresh_box_member_stats_view_logged()';
    RAISE NOTICE '  - refresh_workout_leaderboard_view_logged()';
    RAISE NOTICE '  - refresh_all_materialized_views(force_refresh, max_age_minutes)';
    RAISE NOTICE '';
    RAISE NOTICE '📊 MONITORING FUNCTIONS:';
    RAISE NOTICE '  - get_view_refresh_status() - Check refresh health';
    RAISE NOTICE '  - cleanup_view_refresh_logs(days_to_keep) - Maintenance';
    RAISE NOTICE '';
    RAISE NOTICE '⚡ TRIGGERS CREATED:';
    RAISE NOTICE '  - Auto-refresh triggers on data changes (with throttling)';
    RAISE NOTICE '  - Logs refresh requests for background processing';
    RAISE NOTICE '';
    RAISE NOTICE '⏰ CURRENT SCHEDULE (CONSERVATIVE - DAILY REFRESHES):';
    RAISE NOTICE '  - Daily: SELECT refresh_all_materialized_views();';
    RAISE NOTICE '  - Weekly: SELECT cleanup_view_refresh_logs(30);';
    RAISE NOTICE '';
    RAISE NOTICE '⚡ OPTIMIZED SCHEDULE (FOR HIGHER TRAFFIC):';
    RAISE NOTICE '  -- Uncomment these when ready for optimized refresh frequency';
    RAISE NOTICE '  -- Every 15 min: SELECT refresh_class_attendance_summary_view_logged();';
    RAISE NOTICE '  -- Every hour:   SELECT refresh_user_box_access_view_logged();';
    RAISE NOTICE '  -- Every 4 hours: SELECT refresh_workout_leaderboard_view_logged();';
    RAISE NOTICE '  -- Daily:        SELECT refresh_box_member_stats_view_logged();';
END $$;