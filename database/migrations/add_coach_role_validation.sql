-- Migration: Add coach role validation for class assignments
-- Description: Ensures only users with coach, admin, or super_admin roles can be assigned to classes

BEGIN;

-- ============================================================================
-- COACH ROLE VALIDATION FUNCTION AND TRIGGER
-- ============================================================================

-- Function to validate that only users with appropriate roles can be assigned to classes
CREATE OR REPLACE FUNCTION validate_class_coach()
RETURNS TRIGGER AS $$
BEGIN
    -- If coach_id is NULL, allow (no coach assigned)
    IF NEW.coach_id IS NULL THEN
        RETURN NEW;
    END IF;
    
    -- Check if the user has coach, admin, or super_admin role in the same box as the class
    IF NOT EXISTS (
        SELECT 1 
        FROM "Box_Staff" bs
        WHERE bs.user_id = NEW.coach_id 
        AND bs.box_id = NEW.box_id 
        AND bs.role IN ('coach', 'admin', 'super_admin')
        AND (bs.end_date IS NULL OR bs.end_date >= CURRENT_DATE)
    ) THEN
        RAISE EXCEPTION 'User % must have coach, admin, or super_admin role in box % to be assigned to classes', 
            NEW.coach_id, NEW.box_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to validate coach role on Class table
DROP TRIGGER IF EXISTS validate_class_coach_trigger ON "Class";
CREATE TRIGGER validate_class_coach_trigger
    BEFORE INSERT OR UPDATE OF coach_id, box_id ON "Class"
    FOR EACH ROW
    EXECUTE FUNCTION validate_class_coach();

-- ============================================================================
-- ADD COMMENTS FOR DOCUMENTATION
-- ============================================================================

COMMENT ON FUNCTION validate_class_coach() IS 'Validates that only users with coach, admin, or super_admin roles can be assigned as coaches to classes';

COMMIT;

-- ============================================================================
-- TEST EXAMPLES (commented out - uncomment to test)
-- ============================================================================

-- Test 1: Try to assign a user without coach role (should fail)
-- INSERT INTO "Class" (box_id, room_id, coach_id, datetime, duration, max_capacity, type)
-- VALUES (
--     'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
--     'aaaa1001-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 
--     'd9bbcfa3-027a-4b7c-881e-7f8c163949d7', -- Pedro Member (not a coach)
--     NOW() + INTERVAL '1 day',
--     60,
--     12,
--     'WOD'
-- );

-- Test 2: Assign a user with coach role (should succeed)
-- INSERT INTO "Class" (box_id, room_id, coach_id, datetime, duration, max_capacity, type)
-- VALUES (
--     'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
--     'aaaa1001-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 
--     '9a38ac6f-7fcc-4f3e-be98-83fe4885bf72', -- Miguel Coach (has coach role)
--     NOW() + INTERVAL '1 day',
--     60,
--     12,
--     'WOD'
-- );

-- Test 3: Create class without coach (should succeed)
-- INSERT INTO "Class" (box_id, room_id, coach_id, datetime, duration, max_capacity, type)
-- VALUES (
--     'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
--     'aaaa1001-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 
--     NULL, -- No coach assigned
--     NOW() + INTERVAL '1 day',
--     60,
--     12,
--     'Open Gym'
-- );