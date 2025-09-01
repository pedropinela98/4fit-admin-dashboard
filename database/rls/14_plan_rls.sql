-- ===============================================
-- PLAN TABLE RLS POLICIES
-- ===============================================
-- Security Model:
-- - Box members/staff see active plans in their boxes
-- - Non-members see public plans from all active boxes (for discovery)
-- - Users with inactive plans can still see their plans
-- - Management staff (admin/receptionist) can see all plans
-- - Only super admins and box admins can manage plans
-- - Complex visibility rules based on is_active and plans_public flags
-- ===============================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "plan_box_members_active" ON "Plan";
DROP POLICY IF EXISTS "plan_non_members_public" ON "Plan";
DROP POLICY IF EXISTS "plan_users_with_inactive_memberships" ON "Plan";
DROP POLICY IF EXISTS "plan_management_all" ON "Plan";
DROP POLICY IF EXISTS "plan_admin_insert" ON "Plan";
DROP POLICY IF EXISTS "plan_admin_update" ON "Plan";

-- Enable RLS on Plan table
ALTER TABLE "Plan" ENABLE ROW LEVEL SECURITY;

-- Policy 1: Box members and staff can see active plans in their boxes
CREATE POLICY "plan_box_members_active"
ON "Plan"
FOR SELECT
TO authenticated
USING (
    is_active = true
    AND (
        -- Box members can see active plans
        is_box_member(box_id)
        OR
        -- Box staff can see active plans
        EXISTS (
            SELECT 1
            FROM "Box_Staff" bs
            WHERE bs.user_id = auth.uid()
            AND bs.box_id = "Plan".box_id
            AND (bs.end_date IS NULL OR bs.end_date >= CURRENT_DATE)
        )
    )
);

-- Policy 2: Non-members can see public active plans from all boxes (discovery)
CREATE POLICY "plan_non_members_public"
ON "Plan"
FOR SELECT
TO authenticated
USING (
    is_active = true
    AND plans_public = true
    AND NOT EXISTS (
        -- Exclude if user is already member or staff of this box
        SELECT 1
        FROM "Box_Member" bm
        WHERE bm.user_id = auth.uid()
        AND bm.box_id = "Plan".box_id
        AND bm.deleted_at IS NULL
        UNION
        SELECT 1
        FROM "Box_Staff" bs
        WHERE bs.user_id = auth.uid()
        AND bs.box_id = "Plan".box_id
        AND (bs.end_date IS NULL OR bs.end_date >= CURRENT_DATE)
    )
);

-- Policy 3: Users can see inactive plans they currently have memberships for
CREATE POLICY "plan_users_with_inactive_memberships"
ON "Plan"
FOR SELECT
TO authenticated
USING (
    is_active = false  -- Only inactive plans
    AND EXISTS (
        SELECT 1
        FROM "Membership" m
        WHERE m.user_id = auth.uid()
        AND m.plan_id = "Plan".id
        AND m.deleted_at IS NULL
        -- User has current or recent membership to this inactive plan
    )
);

-- Policy 4: Management staff can see all plans in their boxes (active/inactive)
CREATE POLICY "plan_management_all"
ON "Plan"
FOR SELECT
TO authenticated
USING (
    -- Super admin can see all plans
    is_super_admin()
    OR
    -- Box admins and receptionists can see all plans in their boxes
    EXISTS (
        SELECT 1
        FROM "Box_Staff" bs
        WHERE bs.user_id = auth.uid()
        AND bs.box_id = "Plan".box_id
        AND bs.role IN ('admin', 'receptionist', 'super_admin')
        AND (bs.end_date IS NULL OR bs.end_date >= CURRENT_DATE)
    )
);

-- Policy 5: Only admins can create plans
CREATE POLICY "plan_admin_insert"
ON "Plan"
FOR INSERT
TO authenticated
WITH CHECK (
    -- Super admin can create plans in any box
    is_super_admin()
    OR
    -- Box admins can create plans in their boxes
    has_box_staff_access(box_id, 'admin')
);

-- Policy 6: Only admins can update plans
CREATE POLICY "plan_admin_update"
ON "Plan"
FOR UPDATE
TO authenticated
USING (
    -- Super admin has full update access
    is_super_admin()
    OR
    -- Box admins can update plans in their boxes
    has_box_staff_access(box_id, 'admin')
)
WITH CHECK (
    -- Super admin can update anything
    is_super_admin()
    OR
    -- Box admins can update plans in their boxes
    has_box_staff_access(box_id, 'admin')
);

-- Policy 7: No DELETE policy (plans should be deactivated, not deleted)
-- Use is_active = false for plan deactivation

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Plan RLS policies created successfully!';
    RAISE NOTICE 'Policies: box_members_active, non_members_public, users_with_inactive_memberships, management_all, admin_insert, admin_update';
    RAISE NOTICE 'COMPLEX VISIBILITY: Active plans visible to box members, public plans to non-members';
    RAISES NOTICE 'INACTIVE PLANS: Only visible to current users and management staff';
    RAISE NOTICE 'MANAGEMENT: Only super admins and box admins can create/modify plans';
END $$;