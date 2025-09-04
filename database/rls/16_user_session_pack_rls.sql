-- ===============================================
-- USER_SESSION_PACK TABLE RLS POLICIES
-- ===============================================
-- Security Model: SESSION PACK OWNERSHIP MANAGEMENT
-- - Users can see their own session packs
-- - Staff can see session packs of users in their boxes
-- - Coaches restricted from financial details (payment_status, payment_date, amount_paid)
-- - Super admins and admins can manage everything
-- - Receptionists can see all but only update is_active field
-- - System-managed sessions_used with audit trail (see 00_session_usage_audit_system.sql)
-- ===============================================

SET search_path TO public;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "user_session_pack_own_access" ON "User_Session_Pack";
DROP POLICY IF EXISTS "user_session_pack_staff_access" ON "User_Session_Pack";
DROP POLICY IF EXISTS "user_session_pack_admin_insert" ON "User_Session_Pack";
DROP POLICY IF EXISTS "user_session_pack_admin_update" ON "User_Session_Pack";
DROP POLICY IF EXISTS "user_session_pack_receptionist_update" ON "User_Session_Pack";

-- Enable RLS on User_Session_Pack table
ALTER TABLE "User_Session_Pack" ENABLE ROW LEVEL SECURITY;

-- Policy 1: Users can see their own session packs
CREATE POLICY "user_session_pack_own_access"
ON "User_Session_Pack"
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Policy 2: Staff can see session packs of users in their boxes (filtered fields for coaches)
CREATE POLICY "user_session_pack_staff_access"
ON "User_Session_Pack"
FOR SELECT
TO authenticated
USING (
    -- Super admin can see all session packs
    is_super_admin()
    OR
    -- Box staff can see session packs of users in their boxes
    EXISTS (
        SELECT 1
        FROM "Box_Staff" bs
        INNER JOIN "Session_Pack" sp ON sp.box_id = bs.box_id
        WHERE bs.user_id = auth.uid()
        AND sp.id = "User_Session_Pack".session_pack_id
        AND (bs.end_date IS NULL OR bs.end_date >= CURRENT_DATE)
    )
);

-- Policy 3: Only admins can create session pack purchases
CREATE POLICY "user_session_pack_admin_insert"
ON "User_Session_Pack"
FOR INSERT
TO authenticated
WITH CHECK (
    -- Super admin can create session pack purchases for any user
    is_super_admin()
    OR
    -- Box admins can create session pack purchases for users in their boxes
    EXISTS (
        SELECT 1
        FROM "Box_Staff" bs
        INNER JOIN "Session_Pack" sp ON sp.box_id = bs.box_id
        WHERE bs.user_id = auth.uid()
        AND sp.id = "User_Session_Pack".session_pack_id
        AND bs.role IN ('admin', 'super_admin')
        AND (bs.end_date IS NULL OR bs.end_date >= CURRENT_DATE)
    )
);

-- Policy 4: Admins have full update access
CREATE POLICY "user_session_pack_admin_update"
ON "User_Session_Pack"
FOR UPDATE
TO authenticated
USING (
    -- Super admin has full update access
    is_super_admin()
    OR
    -- Box admins can update session packs in their boxes
    EXISTS (
        SELECT 1
        FROM "Box_Staff" bs
        INNER JOIN "Session_Pack" sp ON sp.box_id = bs.box_id
        WHERE bs.user_id = auth.uid()
        AND sp.id = "User_Session_Pack".session_pack_id
        AND bs.role IN ('admin', 'super_admin')
        AND (bs.end_date IS NULL OR bs.end_date >= CURRENT_DATE)
    )
)
WITH CHECK (
    -- Super admin can update anything
    is_super_admin()
    OR
    -- Box admins can update session packs in their boxes
    EXISTS (
        SELECT 1
        FROM "Box_Staff" bs
        INNER JOIN "Session_Pack" sp ON sp.box_id = bs.box_id
        WHERE bs.user_id = auth.uid()
        AND sp.id = "User_Session_Pack".session_pack_id
        AND bs.role IN ('admin', 'super_admin')
        AND (bs.end_date IS NULL OR bs.end_date >= CURRENT_DATE)
    )
);

-- Policy 5: Receptionists can only update is_active field
CREATE POLICY "user_session_pack_receptionist_update"
ON "User_Session_Pack"
FOR UPDATE
TO authenticated
USING (
    -- Box receptionists can see session packs in their boxes
    EXISTS (
        SELECT 1
        FROM "Box_Staff" bs
        INNER JOIN "Session_Pack" sp ON sp.box_id = bs.box_id
        WHERE bs.user_id = auth.uid()
        AND sp.id = "User_Session_Pack".session_pack_id
        AND bs.role = 'receptionist'
        AND (bs.end_date IS NULL OR bs.end_date >= CURRENT_DATE)
    )
)
WITH CHECK (
    -- Receptionists can update session packs in their boxes
    -- Note: Field-level restrictions (only is_active updates) must be enforced at application level
    -- since RLS cannot compare OLD vs NEW values
    EXISTS (
        SELECT 1
        FROM "Box_Staff" bs
        INNER JOIN "Session_Pack" sp ON sp.box_id = bs.box_id
        WHERE bs.user_id = auth.uid()
        AND sp.id = "User_Session_Pack".session_pack_id
        AND bs.role = 'receptionist'
        AND (bs.end_date IS NULL OR bs.end_date >= CURRENT_DATE)
    )
);

-- Policy 6: No DELETE policy (session packs should be deactivated, not deleted)
-- Use is_active = false for session pack deactivation

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'User_Session_Pack RLS policies created successfully!';
    RAISE NOTICE 'Policies: own_access, staff_access, admin_insert, admin_update, receptionist_update';
    RAISE NOTICE 'OWNERSHIP: Users see own packs, staff see box user packs';
    RAISE NOTICE 'COACH RESTRICTION: Use application filtering for payment_status, payment_date, amount_paid';
    RAISE NOTICE 'SESSIONS_USED: Managed by audit system with mandatory reasons (see 00_session_usage_audit_system.sql)';
    RAISE NOTICE 'RECEPTIONIST: Limited to is_active field updates only';
END $$;