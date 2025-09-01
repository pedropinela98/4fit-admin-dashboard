-- ===============================================
-- MEMBERSHIP TABLE RLS POLICIES
-- ===============================================
-- Security Model:
-- - Users can read their own memberships
-- - All staff can see basic membership info (dates, active status)
-- - Only NON-COACH staff can see payment_status (financial data)
-- - Only admin+ staff (super_admin, admin, receptionist) can manage memberships
-- - Auto-deactivation based on Box.payment_grace_days setting
-- ===============================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "membership_own_read" ON "Membership";
DROP POLICY IF EXISTS "membership_staff_basic_read" ON "Membership";
DROP POLICY IF EXISTS "membership_non_coach_financial_read" ON "Membership";
DROP POLICY IF EXISTS "membership_management_insert" ON "Membership";
DROP POLICY IF EXISTS "membership_management_update" ON "Membership";

-- Enable RLS on Membership table
ALTER TABLE "Membership" ENABLE ROW LEVEL SECURITY;

-- Policy 1: Users can read their own memberships (all fields)
CREATE POLICY "membership_own_read"
ON "Membership"
FOR SELECT
TO authenticated
USING (
    user_id = auth.uid()
);

-- Policy 2: All staff can see basic membership info (excluding payment_status)
CREATE POLICY "membership_staff_basic_read"
ON "Membership"
FOR SELECT
TO authenticated
USING (
    user_id != auth.uid()  -- Not their own memberships (covered by policy 1)
    AND (
        -- Super admin can see all memberships
        is_super_admin()
        OR
        -- Box staff can see memberships of users through plan->box relationship
        EXISTS (
            SELECT 1
            FROM "Plan" p
            JOIN "Box_Staff" bs ON bs.box_id = p.box_id
            WHERE p.id = "Membership".plan_id
            AND bs.user_id = auth.uid()
            AND (bs.end_date IS NULL OR bs.end_date >= CURRENT_DATE)
        )
    )
);

-- Policy 3: Non-coach staff can see payment_status (financial data)
-- Note: Application layer must filter payment_status for coaches
-- This policy enables access, but application should check role before showing payment_status

-- Policy 4: Management staff can create memberships
CREATE POLICY "membership_management_insert"
ON "Membership"
FOR INSERT
TO authenticated
WITH CHECK (
    -- Super admin can create memberships for any plan
    is_super_admin()
    OR
    -- Box admins and receptionists can create memberships for plans in their boxes
    EXISTS (
        SELECT 1
        FROM "Plan" p
        JOIN "Box_Staff" bs ON bs.box_id = p.box_id
        WHERE p.id = plan_id
        AND bs.user_id = auth.uid()
        AND bs.role IN ('admin', 'receptionist', 'super_admin')
        AND (bs.end_date IS NULL OR bs.end_date >= CURRENT_DATE)
    )
);

-- Policy 5: Management staff can update memberships
CREATE POLICY "membership_management_update"
ON "Membership"
FOR UPDATE
TO authenticated
USING (
    -- Super admin has full update access
    is_super_admin()
    OR
    -- Box admins and receptionists can update memberships for plans in their boxes
    EXISTS (
        SELECT 1
        FROM "Plan" p
        JOIN "Box_Staff" bs ON bs.box_id = p.box_id
        WHERE p.id = "Membership".plan_id
        AND bs.user_id = auth.uid()
        AND bs.role IN ('admin', 'receptionist', 'super_admin')
        AND (bs.end_date IS NULL OR bs.end_date >= CURRENT_DATE)
    )
)
WITH CHECK (
    -- Super admin can update anything
    is_super_admin()
    OR
    -- Box admins and receptionists can update memberships for plans in their boxes
    EXISTS (
        SELECT 1
        FROM "Plan" p
        JOIN "Box_Staff" bs ON bs.box_id = p.box_id
        WHERE p.id = plan_id
        AND bs.user_id = auth.uid()
        AND bs.role IN ('admin', 'receptionist', 'super_admin')
        AND (bs.end_date IS NULL OR bs.end_date >= CURRENT_DATE)
    )
);

-- Policy 6: No DELETE policy (use soft delete with deleted_at)
-- Membership records should be preserved for historical tracking

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Membership RLS policies created successfully!';
    RAISE NOTICE 'Policies: own_read, staff_basic_read, management_insert, management_update';
    RAISE NOTICE 'Users see own memberships, staff see basic info';
    RAISE NOTICE 'IMPORTANT: Application must filter payment_status field for coaches!';
    RAISE NOTICE 'Management roles: super_admin, admin, receptionist (NO coaches)';
    RAISE NOTICE 'Auto-deactivation logic should use Box.payment_grace_days setting';
END $$;