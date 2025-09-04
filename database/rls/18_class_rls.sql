-- ===============================================
-- CLASS TABLE RLS POLICIES
-- ===============================================
-- Security Model: BOX-BASED CLASS MANAGEMENT
-- - All box members and staff can see all classes in their boxes (past and future)
-- - Everyone can see class capacity and booking status within their box
-- - Coaches can see all classes in their boxes
-- - All staff except receptionists can create/edit/delete classes
-- - Strict box isolation - users only see classes from boxes they belong to
-- ===============================================

SET search_path TO public;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "class_box_users_all" ON "Class";
DROP POLICY IF EXISTS "class_staff_insert" ON "Class";
DROP POLICY IF EXISTS "class_staff_update" ON "Class";
DROP POLICY IF EXISTS "class_staff_delete" ON "Class";

-- Enable RLS on Class table
ALTER TABLE "Class" ENABLE ROW LEVEL SECURITY;

-- Policy 1: Box members and staff can see all classes in their boxes
CREATE POLICY "class_box_users_all"
ON "Class"
FOR SELECT
TO authenticated
USING (
    -- Box members can see all classes
    is_box_member(box_id)
    OR
    -- Box staff can see all classes
    EXISTS (
        SELECT 1
        FROM "Box_Staff" bs
        WHERE bs.user_id = auth.uid()
        AND bs.box_id = "Class".box_id
        AND (bs.end_date IS NULL OR bs.end_date >= CURRENT_DATE)
    )
    OR
    -- Super admin can see all classes
    is_super_admin()
);

-- Policy 2: All staff except receptionists can create classes
CREATE POLICY "class_staff_insert"
ON "Class"
FOR INSERT
TO authenticated
WITH CHECK (
    -- Super admin can create classes in any box
    is_super_admin()
    OR
    -- Box staff except receptionists can create classes in their boxes
    EXISTS (
        SELECT 1
        FROM "Box_Staff" bs
        WHERE bs.user_id = auth.uid()
        AND bs.box_id = "Class".box_id
        AND bs.role IN ('admin', 'coach', 'super_admin')
        AND (bs.end_date IS NULL OR bs.end_date >= CURRENT_DATE)
    )
);

-- Policy 3: All staff except receptionists can update classes
CREATE POLICY "class_staff_update"
ON "Class"
FOR UPDATE
TO authenticated
USING (
    -- Super admin has full update access
    is_super_admin()
    OR
    -- Box staff except receptionists can update classes in their boxes
    EXISTS (
        SELECT 1
        FROM "Box_Staff" bs
        WHERE bs.user_id = auth.uid()
        AND bs.box_id = "Class".box_id
        AND bs.role IN ('admin', 'coach', 'super_admin')
        AND (bs.end_date IS NULL OR bs.end_date >= CURRENT_DATE)
    )
)
WITH CHECK (
    -- Super admin can update anything
    is_super_admin()
    OR
    -- Box staff except receptionists can update classes in their boxes
    EXISTS (
        SELECT 1
        FROM "Box_Staff" bs
        WHERE bs.user_id = auth.uid()
        AND bs.box_id = "Class".box_id
        AND bs.role IN ('admin', 'coach', 'super_admin')
        AND (bs.end_date IS NULL OR bs.end_date >= CURRENT_DATE)
    )
);

-- Policy 4: All staff except receptionists can delete classes
CREATE POLICY "class_staff_delete"
ON "Class"
FOR DELETE
TO authenticated
USING (
    -- Super admin can delete any class
    is_super_admin()
    OR
    -- Box staff except receptionists can delete classes in their boxes
    EXISTS (
        SELECT 1
        FROM "Box_Staff" bs
        WHERE bs.user_id = auth.uid()
        AND bs.box_id = "Class".box_id
        AND bs.role IN ('admin', 'coach', 'super_admin')
        AND (bs.end_date IS NULL OR bs.end_date >= CURRENT_DATE)
    )
);

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Class RLS policies created successfully!';
    RAISE NOTICE 'Policies: box_users_all, staff_insert, staff_update, staff_delete';
    RAISE NOTICE 'BOX ISOLATION: Users only see classes from their boxes';
    RAISE NOTICE 'FULL VISIBILITY: All users see past and future classes, capacity, booking status';
    RAISE NOTICE 'MANAGEMENT: All staff except receptionists can create/edit/delete classes';
    RAISE NOTICE 'COACH ACCESS: Coaches can see and manage all classes in their boxes';
END $$;