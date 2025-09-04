-- ===============================================
-- SESSION_USAGE_AUDIT TABLE RLS POLICIES
-- ===============================================
-- Security Model: ADMIN-ONLY AUDIT ACCESS
-- - Session usage audit is admin/receptionist access only (coaches excluded)
-- - Box isolation through User_Session_Pack → Session_Pack → box_id chain
-- - Suspicious entries (is_suspicious = true) restricted to admins and super_admins only
-- - Performance optimized with 12-month visibility window
-- - Users cannot see their own audit entries (staff oversight only)
-- - Immutable audit table (INSERT-only, no UPDATE/DELETE policies)
-- - No cross-box visibility for user transfers
-- ===============================================

SET search_path TO public;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "session_audit_staff_regular" ON "Session_Usage_Audit";
DROP POLICY IF EXISTS "session_audit_admin_suspicious" ON "Session_Usage_Audit";
DROP POLICY IF EXISTS "session_audit_system_insert" ON "Session_Usage_Audit";

-- Enable RLS on Session_Usage_Audit table
ALTER TABLE "Session_Usage_Audit" ENABLE ROW LEVEL SECURITY;

-- Policy 1: Staff (admins/receptionists) can see regular audit entries in their boxes (last 12 months)
CREATE POLICY "session_audit_staff_regular"
ON "Session_Usage_Audit"
FOR SELECT
TO authenticated
USING (
    -- Super admin can see all regular audit entries
    is_super_admin()
    OR
    (
        -- Non-suspicious entries only
        is_suspicious = false
        AND
        -- Performance: Last 12 months only
        created_at >= (CURRENT_DATE - INTERVAL '12 months')
        AND
        -- Box staff except coaches can see audit entries for users in their boxes
        EXISTS (
            SELECT 1
            FROM "User_Session_Pack" usp
            INNER JOIN "Session_Pack" sp ON sp.id = usp.session_pack_id
            INNER JOIN "Box_Staff" bs ON bs.box_id = sp.box_id
            WHERE usp.id = "Session_Usage_Audit".user_session_pack_id
            AND bs.user_id = auth.uid()
            AND bs.role IN ('admin', 'receptionist', 'super_admin')  -- Explicitly exclude coaches
            AND (bs.end_date IS NULL OR bs.end_date >= CURRENT_DATE)
        )
    )
);

-- Policy 2: Only admins and super_admins can see suspicious audit entries
CREATE POLICY "session_audit_admin_suspicious"
ON "Session_Usage_Audit"
FOR SELECT
TO authenticated
USING (
    -- Super admin can see all suspicious entries
    is_super_admin()
    OR
    (
        -- Suspicious entries only
        is_suspicious = true
        AND
        -- Performance: Last 12 months only
        created_at >= (CURRENT_DATE - INTERVAL '12 months')
        AND
        -- Only box admins can see suspicious entries for users in their boxes
        EXISTS (
            SELECT 1
            FROM "User_Session_Pack" usp
            INNER JOIN "Session_Pack" sp ON sp.id = usp.session_pack_id
            INNER JOIN "Box_Staff" bs ON bs.box_id = sp.box_id
            WHERE usp.id = "Session_Usage_Audit".user_session_pack_id
            AND bs.user_id = auth.uid()
            AND bs.role IN ('admin', 'super_admin')  -- Only admins for suspicious entries
            AND (bs.end_date IS NULL OR bs.end_date >= CURRENT_DATE)
        )
    )
);

-- Policy 3: System can insert audit entries (INSERT-only audit table)
CREATE POLICY "session_audit_system_insert"
ON "Session_Usage_Audit"
FOR INSERT
TO authenticated
WITH CHECK (
    -- Super admin can create audit entries
    is_super_admin()
    OR
    -- System-level inserts (typically through triggers/functions)
    -- Box staff can create audit entries for manual adjustments in their boxes
    EXISTS (
        SELECT 1
        FROM "User_Session_Pack" usp
        INNER JOIN "Session_Pack" sp ON sp.id = usp.session_pack_id
        INNER JOIN "Box_Staff" bs ON bs.box_id = sp.box_id
        WHERE usp.id = "Session_Usage_Audit".user_session_pack_id
        AND bs.user_id = auth.uid()
        AND bs.role IN ('admin', 'receptionist', 'super_admin')  -- Staff can create manual audit entries
        AND (bs.end_date IS NULL OR bs.end_date >= CURRENT_DATE)
    )
);

-- Policy 4: No UPDATE policy (immutable audit table)
-- Policy 5: No DELETE policy (immutable audit table)

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Session_Usage_Audit RLS policies created successfully!';
    RAISE NOTICE 'Policies: staff_regular, admin_suspicious, system_insert';
    RAISE NOTICE 'STAFF ACCESS: Admins/receptionists see regular entries (coaches excluded)';
    RAISE NOTICE 'SUSPICIOUS ACCESS: Only admins see suspicious entries';
    RAISE NOTICE 'PERFORMANCE: 12-month visibility window for query optimization';
    RAISE NOTICE 'USER RESTRICTION: Users cannot see their own audit entries';
    RAISE NOTICE 'BOX ISOLATION: Via User_Session_Pack → Session_Pack → box_id chain';
    RAISE NOTICE 'IMMUTABLE: INSERT-only audit table (no UPDATE/DELETE policies)';
END $$;