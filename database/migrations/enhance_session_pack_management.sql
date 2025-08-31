-- Migration: Enhanced Session Pack Management
-- Description: Adds comprehensive constraints and automation for session pack usage
-- Ensures proper session counting, expiration handling, and booking validation

BEGIN;

-- ============================================================================
-- 1. CREATE HELPER FUNCTIONS
-- ============================================================================

-- Function to get available sessions for a user's session pack
CREATE OR REPLACE FUNCTION get_available_sessions(pack_id UUID)
RETURNS INT AS $$
DECLARE
    pack_record RECORD;
    available_sessions INT;
BEGIN
    SELECT usp.sessions_used, sp.session_count, usp.is_active, usp.expiration_date
    INTO pack_record
    FROM "User_Session_Pack" usp
    JOIN "Session_Pack" sp ON usp.session_pack_id = sp.id
    WHERE usp.id = pack_id;
    
    IF NOT FOUND THEN
        RETURN 0;
    END IF;
    
    -- Check if pack is active and not expired
    IF NOT pack_record.is_active OR pack_record.expiration_date < CURRENT_DATE THEN
        RETURN 0;
    END IF;
    
    available_sessions := pack_record.session_count - pack_record.sessions_used;
    RETURN GREATEST(0, available_sessions);
END;
$$ LANGUAGE plpgsql;

-- Function to find best available session pack for a user in a specific box
CREATE OR REPLACE FUNCTION find_available_session_pack(user_uuid UUID, box_uuid UUID)
RETURNS UUID AS $$
DECLARE
    pack_id UUID;
BEGIN
    SELECT usp.id INTO pack_id
    FROM "User_Session_Pack" usp
    JOIN "Session_Pack" sp ON usp.session_pack_id = sp.id
    WHERE usp.user_id = user_uuid
      AND sp.box_id = box_uuid
      AND usp.is_active = true
      AND usp.expiration_date >= CURRENT_DATE
      AND usp.sessions_used < sp.session_count
    ORDER BY usp.expiration_date ASC, usp.created_at ASC
    LIMIT 1;
    
    RETURN pack_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 2. ENHANCED SESSION USAGE VALIDATION
-- ============================================================================

-- Replace existing validate_session_usage function with enhanced version
CREATE OR REPLACE FUNCTION validate_session_usage()
RETURNS TRIGGER AS $$
DECLARE
    max_sessions INT;
    is_expired BOOLEAN;
BEGIN
    -- Get the maximum sessions allowed from the session pack
    SELECT sp.session_count, (NEW.expiration_date < CURRENT_DATE)
    INTO max_sessions, is_expired
    FROM "Session_Pack" sp
    WHERE sp.id = NEW.session_pack_id;
    
    -- Check if sessions_used exceeds the limit
    IF NEW.sessions_used > max_sessions THEN
        RAISE EXCEPTION 'Sessions used (%) cannot exceed session pack limit (%)', 
            NEW.sessions_used, max_sessions;
    END IF;
    
    -- Automatically deactivate pack if fully used or expired
    IF NEW.sessions_used >= max_sessions OR is_expired THEN
        NEW.is_active := false;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 3. AUTOMATIC SESSION DECREMENTING ON ATTENDANCE
-- ============================================================================

CREATE OR REPLACE FUNCTION auto_decrement_session_pack()
RETURNS TRIGGER AS $$
DECLARE
    current_used INT;
BEGIN
    -- Only process if using a session pack and status is 'present'
    IF NEW.session_pack_id IS NOT NULL AND NEW.status = 'present' THEN
        
        -- Check if this is a new attendance or status change to 'present'
        IF TG_OP = 'INSERT' OR (TG_OP = 'UPDATE' AND OLD.status != 'present') THEN
            
            -- Verify the session pack has available sessions
            IF get_available_sessions(NEW.session_pack_id) <= 0 THEN
                RAISE EXCEPTION 'Session pack has no available sessions or is expired/inactive';
            END IF;
            
            -- Increment sessions_used
            UPDATE "User_Session_Pack" 
            SET sessions_used = sessions_used + 1,
                updated_at = NOW()
            WHERE id = NEW.session_pack_id;
            
        END IF;
    END IF;
    
    -- Handle status change from 'present' to something else (refund session)
    IF TG_OP = 'UPDATE' AND OLD.session_pack_id IS NOT NULL AND OLD.status = 'present' AND NEW.status != 'present' THEN
        
        -- Decrement sessions_used (refund the session)
        UPDATE "User_Session_Pack" 
        SET sessions_used = GREATEST(0, sessions_used - 1),
            updated_at = NOW(),
            is_active = true  -- Reactivate pack if it was auto-deactivated
        WHERE id = OLD.session_pack_id;
        
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic session pack management
DROP TRIGGER IF EXISTS trigger_auto_decrement_session_pack ON "Class_Attendance";
CREATE TRIGGER trigger_auto_decrement_session_pack
    AFTER INSERT OR UPDATE ON "Class_Attendance"
    FOR EACH ROW
    EXECUTE FUNCTION auto_decrement_session_pack();

-- ============================================================================
-- 4. BOOKING VALIDATION CONSTRAINTS
-- ============================================================================

CREATE OR REPLACE FUNCTION validate_class_booking()
RETURNS TRIGGER AS $$
DECLARE
    available_sessions INT;
    has_active_membership BOOLEAN;
BEGIN
    -- Skip validation for non-present statuses or drop-ins
    IF NEW.status != 'present' OR NEW.is_dropin = true THEN
        RETURN NEW;
    END IF;
    
    -- Check if user is trying to use both membership and session pack
    IF NEW.membership_id IS NOT NULL AND NEW.session_pack_id IS NOT NULL THEN
        RAISE EXCEPTION 'Cannot use both membership and session pack for the same class';
    END IF;
    
    -- If using session pack, validate availability
    IF NEW.session_pack_id IS NOT NULL THEN
        available_sessions := get_available_sessions(NEW.session_pack_id);
        
        IF available_sessions <= 0 THEN
            RAISE EXCEPTION 'Session pack has no available sessions, is expired, or is inactive';
        END IF;
    END IF;
    
    -- If using membership, validate it's active and not expired
    IF NEW.membership_id IS NOT NULL THEN
        SELECT EXISTS(
            SELECT 1 FROM "Membership" m 
            WHERE m.id = NEW.membership_id 
              AND m.is_active = true 
              AND m.end_date >= CURRENT_DATE
              AND m.deleted_at IS NULL
        ) INTO has_active_membership;
        
        IF NOT has_active_membership THEN
            RAISE EXCEPTION 'Membership is inactive, expired, or deleted';
        END IF;
    END IF;
    
    -- If neither membership nor session pack, must be drop-in
    IF NEW.membership_id IS NULL AND NEW.session_pack_id IS NULL AND NEW.is_dropin = false THEN
        RAISE EXCEPTION 'Class attendance must have either membership, session pack, or be marked as drop-in';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for booking validation
DROP TRIGGER IF EXISTS trigger_validate_class_booking ON "Class_Attendance";
CREATE TRIGGER trigger_validate_class_booking
    BEFORE INSERT OR UPDATE ON "Class_Attendance"
    FOR EACH ROW
    EXECUTE FUNCTION validate_class_booking();

-- ============================================================================
-- 5. AUTOMATIC PACK DEACTIVATION (MAINTENANCE FUNCTION)
-- ============================================================================

CREATE OR REPLACE FUNCTION deactivate_expired_session_packs()
RETURNS INT AS $$
DECLARE
    deactivated_count INT;
BEGIN
    UPDATE "User_Session_Pack" 
    SET is_active = false, updated_at = NOW()
    WHERE is_active = true 
      AND (expiration_date < CURRENT_DATE 
           OR sessions_used >= (
               SELECT session_count 
               FROM "Session_Pack" sp 
               WHERE sp.id = "User_Session_Pack".session_pack_id
           ));
    
    GET DIAGNOSTICS deactivated_count = ROW_COUNT;
    
    RAISE NOTICE 'Deactivated % expired or fully used session packs', deactivated_count;
    RETURN deactivated_count;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 6. CREATE USEFUL VIEWS FOR SESSION PACK MANAGEMENT
-- ============================================================================

-- View to see session pack usage summary
CREATE OR REPLACE VIEW session_pack_usage_summary AS
SELECT 
    u.name as user_name,
    u.email as user_email,
    b.name as box_name,
    sp.name as pack_name,
    sp.session_count as total_sessions,
    usp.sessions_used as used_sessions,
    (sp.session_count - usp.sessions_used) as remaining_sessions,
    usp.start_date,
    usp.expiration_date,
    CASE 
        WHEN usp.expiration_date < CURRENT_DATE THEN 'Expired'
        WHEN usp.sessions_used >= sp.session_count THEN 'Fully Used'
        WHEN usp.is_active = false THEN 'Inactive'
        ELSE 'Active'
    END as status,
    usp.created_at as purchased_date
FROM "User_Session_Pack" usp
JOIN "User_detail" u ON usp.user_id = u.id
JOIN "Session_Pack" sp ON usp.session_pack_id = sp.id  
JOIN "Box" b ON sp.box_id = b.id
ORDER BY usp.expiration_date DESC, u.name;

COMMIT;

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Test the helper functions
-- SELECT get_available_sessions('aaaaa005-aaaa-aaaa-aaaa-aaaaaaaaaaaa');
-- SELECT find_available_session_pack('fb76cc05-e9c4-4a04-b929-b2e89d793e09', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa');

-- View session pack summary
-- SELECT * FROM session_pack_usage_summary;

-- Run maintenance function to clean up expired packs
-- SELECT deactivate_expired_session_packs();