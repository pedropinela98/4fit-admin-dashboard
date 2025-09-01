-- ===============================================
-- SESSION_PACK TABLE RLS POLICIES
-- ===============================================
-- Security Model: IDENTICAL TO PLAN TABLE
-- - Box members/staff see active session packs in their boxes
-- - Non-members see public session packs from all active boxes (discovery)
-- - Users with inactive packs can still see their packs
-- - Management staff (admin/receptionist) can see all packs
-- - Only super admins and box admins can manage session packs
-- - Complex visibility rules based on is_active and pack_public flags
-- ===============================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "session_pack_box_members_active" ON "Session_Pack";
DROP POLICY IF EXISTS "session_pack_non_members_public" ON "Session_Pack";
DROP POLICY IF EXISTS "session_pack_users_with_inactive_packs" ON "Session_Pack";
DROP POLICY IF EXISTS "session_pack_management_all" ON "Session_Pack";
DROP POLICY IF EXISTS "session_pack_admin_insert" ON "Session_Pack";
DROP POLICY IF EXISTS "session_pack_admin_update" ON "Session_Pack";

-- Enable RLS on Session_Pack table
ALTER TABLE "Session_Pack" ENABLE ROW LEVEL SECURITY;

-- Policy 1: Box members and staff can see active session packs in their boxes
CREATE POLICY "session_pack_box_members_active"
ON "Session_Pack"
FOR SELECT
TO authenticated
USING (
    is_active = true
    AND (
        -- Box members can see active session packs
        is_box_member(box_id)
        OR
        -- Box staff can see active session packs
        EXISTS (
            SELECT 1
            FROM "Box_Staff" bs
            WHERE bs.user_id = auth.uid()
            AND bs.box_id = "Session_Pack".box_id
            AND (bs.end_date IS NULL OR bs.end_date >= CURRENT_DATE)
        )
    )
);

-- Policy 2: Non-members can see public active session packs from all boxes (discovery)
CREATE POLICY "session_pack_non_members_public"
ON "Session_Pack"
FOR SELECT
TO authenticated
USING (
    is_active = true
    AND pack_public = true
    AND NOT EXISTS (
        -- Exclude if user is already member or staff of this box
        SELECT 1
        FROM "Box_Member" bm
        WHERE bm.user_id = auth.uid()
        AND bm.box_id = "Session_Pack".box_id
        AND bm.deleted_at IS NULL
        UNION
        SELECT 1
        FROM "Box_Staff" bs
        WHERE bs.user_id = auth.uid()
        AND bs.box_id = "Session_Pack".box_id
        AND (bs.end_date IS NULL OR bs.end_date >= CURRENT_DATE)
    )
);

-- Policy 3: Users can see inactive session packs they currently own
CREATE POLICY "session_pack_users_with_inactive_packs"
ON "Session_Pack"
FOR SELECT
TO authenticated
USING (
    is_active = false  -- Only inactive session packs
    AND EXISTS (
        SELECT 1
        FROM "User_Session_Pack" usp
        WHERE usp.user_id = auth.uid()
        AND usp.session_pack_id = "Session_Pack".id
        AND usp.is_active = true  -- User has active session pack purchase
    )
);

-- Policy 4: Management staff can see all session packs in their boxes (active/inactive)
CREATE POLICY "session_pack_management_all"
ON "Session_Pack"
FOR SELECT
TO authenticated
USING (
    -- Super admin can see all session packs
    is_super_admin()
    OR
    -- Box admins and receptionists can see all session packs in their boxes
    EXISTS (
        SELECT 1
        FROM "Box_Staff" bs
        WHERE bs.user_id = auth.uid()
        AND bs.box_id = "Session_Pack".box_id
        AND bs.role IN ('admin', 'receptionist', 'super_admin')
        AND (bs.end_date IS NULL OR bs.end_date >= CURRENT_DATE)
    )
);

-- Policy 5: Only admins can create session packs
CREATE POLICY "session_pack_admin_insert"
ON "Session_Pack"
FOR INSERT
TO authenticated
WITH CHECK (
    -- Super admin can create session packs in any box
    is_super_admin()
    OR
    -- Box admins can create session packs in their boxes
    has_box_staff_access(box_id, 'admin')
);

-- Policy 6: Only admins can update session packs
CREATE POLICY "session_pack_admin_update"
ON "Session_Pack"
FOR UPDATE
TO authenticated
USING (
    -- Super admin has full update access
    is_super_admin()
    OR
    -- Box admins can update session packs in their boxes
    has_box_staff_access(box_id, 'admin')
)
WITH CHECK (
    -- Super admin can update anything
    is_super_admin()
    OR
    -- Box admins can update session packs in their boxes
    has_box_staff_access(box_id, 'admin')
);

-- Policy 7: No DELETE policy (session packs should be deactivated, not deleted)
-- Use is_active = false for session pack deactivation

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Session_Pack RLS policies created successfully!';
    RAISE NOTICE 'Policies: box_members_active, non_members_public, users_with_inactive_packs, management_all, admin_insert, admin_update';
    RAISE NOTICE 'COMPLEX VISIBILITY: Active packs visible to box members, public packs to non-members';
    RAISE NOTICE 'INACTIVE PACKS: Only visible to current owners and management staff';
    RAISE NOTICE 'MANAGEMENT: Only super admins and box admins can create/modify packs';
END $$;