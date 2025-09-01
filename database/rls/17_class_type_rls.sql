-- ===============================================
-- CLASS_TYPE TABLE RLS POLICIES
-- ===============================================
-- Security Model: BOX-BASED CLASS TYPE MANAGEMENT
-- - All box members and staff can see active class types in their boxes
-- - Inactive class types only visible to management staff (super admin, admin, receptionist)
-- - Only super admins and box admins can create/update class types
-- - Strict box isolation - users only see class types from boxes they belong to
-- - Coaches can see all class types in their boxes
-- ===============================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "class_type_box_users_active" ON "Class_Type";
DROP POLICY IF EXISTS "class_type_management_all" ON "Class_Type";
DROP POLICY IF EXISTS "class_type_admin_insert" ON "Class_Type";
DROP POLICY IF EXISTS "class_type_admin_update" ON "Class_Type";

-- Enable RLS on Class_Type table
ALTER TABLE "Class_Type" ENABLE ROW LEVEL SECURITY;

-- Policy 1: Box members and staff can see active class types in their boxes
CREATE POLICY "class_type_box_users_active"
ON "Class_Type"
FOR SELECT
TO authenticated
USING (
    active = true
    AND (
        -- Box members can see active class types
        is_box_member(box_id)
        OR
        -- Box staff can see active class types
        EXISTS (
            SELECT 1
            FROM "Box_Staff" bs
            WHERE bs.user_id = auth.uid()
            AND bs.box_id = "Class_Type".box_id
            AND (bs.end_date IS NULL OR bs.end_date >= CURRENT_DATE)
        )
    )
);

-- Policy 2: Management staff can see all class types (active/inactive) in their boxes
CREATE POLICY "class_type_management_all"
ON "Class_Type"
FOR SELECT
TO authenticated
USING (
    -- Super admin can see all class types
    is_super_admin()
    OR
    -- Box management staff can see all class types in their boxes
    EXISTS (
        SELECT 1
        FROM "Box_Staff" bs
        WHERE bs.user_id = auth.uid()
        AND bs.box_id = "Class_Type".box_id
        AND bs.role IN ('admin', 'receptionist', 'super_admin')
        AND (bs.end_date IS NULL OR bs.end_date >= CURRENT_DATE)
    )
);

-- Policy 3: Only admins can create class types
CREATE POLICY "class_type_admin_insert"
ON "Class_Type"
FOR INSERT
TO authenticated
WITH CHECK (
    -- Super admin can create class types in any box
    is_super_admin()
    OR
    -- Box admins can create class types in their boxes
    has_box_staff_access(box_id, 'admin')
);

-- Policy 4: Only admins can update class types
CREATE POLICY "class_type_admin_update"
ON "Class_Type"
FOR UPDATE
TO authenticated
USING (
    -- Super admin has full update access
    is_super_admin()
    OR
    -- Box admins can update class types in their boxes
    has_box_staff_access(box_id, 'admin')
)
WITH CHECK (
    -- Super admin can update anything
    is_super_admin()
    OR
    -- Box admins can update class types in their boxes
    has_box_staff_access(box_id, 'admin')
);

-- Policy 5: No DELETE policy (class types should be deactivated, not deleted)
-- Use active = false for class type deactivation

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Class_Type RLS policies created successfully!';
    RAISE NOTICE 'Policies: box_users_active, management_all, admin_insert, admin_update';
    RAISE NOTICE 'BOX ISOLATION: Users only see class types from their boxes';
    RAISE NOTICE 'ACTIVE FILTER: Regular users see only active types, management sees all';
    RAISE NOTICE 'MANAGEMENT: Only super admins and box admins can create/modify types';
END $$;