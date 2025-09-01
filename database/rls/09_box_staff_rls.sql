-- ===============================================
-- BOX_STAFF TABLE RLS POLICIES
-- ===============================================
-- Security Model:
-- - Super admins see all staff records (active/ended)
-- - Box admins see all staff in their boxes (active/ended)
-- - Regular staff see active staff in their boxes
-- - Members see active staff in their boxes
-- - Only super admins can create box admins
-- - Box admins can create coaches/receptionists in their boxes
-- - Only box admins+ can modify staff records
-- - Strict role hierarchy enforcement
-- ===============================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "box_staff_super_admin_read" ON "Box_Staff";
DROP POLICY IF EXISTS "box_staff_box_admin_read" ON "Box_Staff";
DROP POLICY IF EXISTS "box_staff_members_staff_read_active" ON "Box_Staff";
DROP POLICY IF EXISTS "box_staff_super_admin_insert" ON "Box_Staff";
DROP POLICY IF EXISTS "box_staff_box_admin_insert" ON "Box_Staff";
DROP POLICY IF EXISTS "box_staff_admin_update" ON "Box_Staff";

-- Enable RLS on Box_Staff table
ALTER TABLE "Box_Staff" ENABLE ROW LEVEL SECURITY;

-- Policy 1: Super admins can read all staff records
CREATE POLICY "box_staff_super_admin_read"
ON "Box_Staff"
FOR SELECT
TO authenticated
USING (
    is_super_admin()
);

-- Policy 2: Box admins can read all staff records in their boxes
CREATE POLICY "box_staff_box_admin_read"
ON "Box_Staff"
FOR SELECT
TO authenticated
USING (
    NOT is_super_admin()  -- Not super admin (covered by policy 1)
    AND has_box_staff_access(box_id, 'admin')
);

-- Policy 3: Regular staff and members see active staff in their boxes
CREATE POLICY "box_staff_members_staff_read_active"
ON "Box_Staff"
FOR SELECT
TO authenticated
USING (
    (end_date IS NULL OR end_date >= CURRENT_DATE)  -- Only active staff
    AND NOT is_super_admin()  -- Not super admin (covered by policy 1)
    AND NOT has_box_staff_access(box_id, 'admin')  -- Not box admin (covered by policy 2)
    AND (
        -- Box members can see active staff
        is_box_member(box_id)
        OR
        -- Regular staff can see other active staff in their boxes
        EXISTS (
            SELECT 1
            FROM "Box_Staff" bs
            WHERE bs.user_id = auth.uid()
            AND bs.box_id = "Box_Staff".box_id
            AND (bs.end_date IS NULL OR bs.end_date >= CURRENT_DATE)
        )
    )
);

-- Policy 4: Super admins can insert any staff role
CREATE POLICY "box_staff_super_admin_insert"
ON "Box_Staff"
FOR INSERT
TO authenticated
WITH CHECK (
    is_super_admin()
);

-- Policy 5: Box admins can insert coaches/receptionists (NOT other admins/super_admins)
CREATE POLICY "box_staff_box_admin_insert"
ON "Box_Staff"
FOR INSERT
TO authenticated
WITH CHECK (
    NOT is_super_admin()  -- Not super admin (covered by policy 4)
    AND has_box_staff_access(box_id, 'admin')
    AND role IN ('coach', 'receptionist')  -- Can only create lower roles
);

-- Policy 6: Only box admins+ can update staff records with role hierarchy validation
CREATE POLICY "box_staff_admin_update"
ON "Box_Staff"
FOR UPDATE
TO authenticated
USING (
    -- Super admin has full update access
    is_super_admin()
    OR
    -- Box admin can update staff in their boxes
    has_box_staff_access(box_id, 'admin')
)
WITH CHECK (
    -- Super admin can update anything
    is_super_admin()
    OR
    (
        -- Box admin can update staff in their boxes with restrictions
        has_box_staff_access(box_id, 'admin')
        AND (
            -- Cannot promote to admin or super_admin roles
            role IN ('coach', 'receptionist')
            OR
            -- Can update existing admin records but not change role to super_admin
            (role = 'admin' AND role = OLD.role)
        )
    )
);

-- Policy 7: No DELETE policy (use end_date for staff termination)
-- Staff records should be preserved for historical tracking

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Box_Staff RLS policies created successfully!';
    RAISE NOTICE 'Policies: super_admin_read, box_admin_read, members_staff_read_active, super_admin_insert, box_admin_insert, admin_update';
    RAISE NOTICE 'ROLE HIERARCHY: Only super admins can create box admins';
    RAISE NOTICE 'Box admins can only create coaches/receptionists';
    RAISE NOTICE 'Historical records only visible to admins+';
END $$;