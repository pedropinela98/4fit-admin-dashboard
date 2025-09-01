-- ===============================================
-- CORE SECURITY FUNCTIONS FOR 4FIT RLS SYSTEM
-- Run this FIRST before any table-specific RLS policies
-- ===============================================

-- Function to get current user's role in a specific box
CREATE OR REPLACE FUNCTION get_user_box_role(box_uuid UUID DEFAULT NULL)
RETURNS staff_role AS $$
DECLARE
    user_role staff_role;
BEGIN
    -- Return null if no authenticated user
    IF auth.uid() IS NULL THEN
        RETURN NULL;
    END IF;
    
    -- Check for super_admin role (cross-box access)
    SELECT bs.role INTO user_role
    FROM "Box_Staff" bs
    WHERE bs.user_id = auth.uid()
    AND bs.role = 'super_admin'
    AND (bs.end_date IS NULL OR bs.end_date >= CURRENT_DATE)
    LIMIT 1;
    
    IF user_role = 'super_admin' THEN
        RETURN user_role;
    END IF;
    
    -- If no specific box provided, return NULL (box context required)
    IF box_uuid IS NULL THEN
        RETURN NULL;
    END IF;
    
    -- Check for box-specific role
    SELECT bs.role INTO user_role
    FROM "Box_Staff" bs
    WHERE bs.user_id = auth.uid()
    AND bs.box_id = box_uuid
    AND (bs.end_date IS NULL OR bs.end_date >= CURRENT_DATE)
    LIMIT 1;
    
    RETURN user_role;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Function to check if user is a member of a specific box
CREATE OR REPLACE FUNCTION is_box_member(box_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
    -- Return false if no authenticated user
    IF auth.uid() IS NULL THEN
        RETURN FALSE;
    END IF;
    
    -- Check if user is a member of the box
    RETURN EXISTS (
        SELECT 1 
        FROM "Box_Member" bm
        WHERE bm.user_id = auth.uid()
        AND bm.box_id = box_uuid
        AND bm.deleted_at IS NULL
    );
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Function to check if user has staff access to a box
CREATE OR REPLACE FUNCTION has_box_staff_access(box_uuid UUID, min_role staff_role DEFAULT 'receptionist')
RETURNS BOOLEAN AS $$
DECLARE
    user_role staff_role;
    role_hierarchy INT;
    min_role_hierarchy INT;
BEGIN
    -- Return false if no authenticated user
    IF auth.uid() IS NULL THEN
        RETURN FALSE;
    END IF;
    
    -- Get user's role in the box
    user_role := get_user_box_role(box_uuid);
    
    IF user_role IS NULL THEN
        RETURN FALSE;
    END IF;
    
    -- Define role hierarchy (higher number = more privileges)
    role_hierarchy := CASE user_role
        WHEN 'super_admin' THEN 4
        WHEN 'admin' THEN 3
        WHEN 'coach' THEN 2
        WHEN 'receptionist' THEN 1
        ELSE 0
    END;
    
    min_role_hierarchy := CASE min_role
        WHEN 'super_admin' THEN 4
        WHEN 'admin' THEN 3
        WHEN 'coach' THEN 2
        WHEN 'receptionist' THEN 1
        ELSE 0
    END;
    
    RETURN role_hierarchy >= min_role_hierarchy;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Function to get all box IDs where user is a member
CREATE OR REPLACE FUNCTION get_user_member_boxes()
RETURNS UUID[] AS $$
BEGIN
    -- Return empty array if no authenticated user
    IF auth.uid() IS NULL THEN
        RETURN ARRAY[]::UUID[];
    END IF;
    
    -- Return array of box IDs where user is a member
    RETURN ARRAY(
        SELECT bm.box_id
        FROM "Box_Member" bm
        WHERE bm.user_id = auth.uid()
        AND bm.deleted_at IS NULL
    );
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Function to check if user is super admin (global access)
CREATE OR REPLACE FUNCTION is_super_admin()
RETURNS BOOLEAN AS $$
BEGIN
    -- Return false if no authenticated user
    IF auth.uid() IS NULL THEN
        RETURN FALSE;
    END IF;
    
    -- Check if user has super_admin role
    RETURN EXISTS (
        SELECT 1 
        FROM "Box_Staff" bs
        WHERE bs.user_id = auth.uid()
        AND bs.role = 'super_admin'
        AND (bs.end_date IS NULL OR bs.end_date >= CURRENT_DATE)
    );
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Create indexes on security-critical columns for performance
CREATE INDEX IF NOT EXISTS idx_box_staff_security 
ON "Box_Staff" (user_id, box_id, role, end_date) 
WHERE end_date IS NULL;

CREATE INDEX IF NOT EXISTS idx_box_member_security 
ON "Box_Member" (user_id, box_id) 
WHERE deleted_at IS NULL;

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION get_user_box_role(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION is_box_member(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION has_box_staff_access(UUID, staff_role) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_member_boxes() TO authenticated;
GRANT EXECUTE ON FUNCTION is_super_admin() TO authenticated;

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Core security functions created successfully!';
    RAISE NOTICE 'Next: Run table-specific RLS policies in order';
END $$;