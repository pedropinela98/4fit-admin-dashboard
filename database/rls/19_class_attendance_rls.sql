-- ===============================================
-- CLASS_ATTENDANCE TABLE RLS POLICIES
-- ===============================================
-- Security Model: BOX-BASED ATTENDANCE VISIBILITY
-- - All box members can see who attended classes in their box
-- - Users can always see their own attendance history
-- - Coaches can see attendance for all classes in their boxes
-- - All staff roles can see all attendance data in their boxes
-- - No privacy restrictions - attendance is visible to all box members
-- - Any box staff can mark/update attendance (present/no_show/cancelled)
-- ===============================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "class_attendance_box_visibility" ON "Class_Attendance";
DROP POLICY IF EXISTS "class_attendance_own_access" ON "Class_Attendance";
DROP POLICY IF EXISTS "class_attendance_staff_insert" ON "Class_Attendance";
DROP POLICY IF EXISTS "class_attendance_staff_update" ON "Class_Attendance";

-- Enable RLS on Class_Attendance table
ALTER TABLE "Class_Attendance" ENABLE ROW LEVEL SECURITY;

-- Policy 1: Box members can see all attendance records for classes in their boxes
CREATE POLICY "class_attendance_box_visibility"
ON "Class_Attendance"
FOR SELECT
TO authenticated
USING (
    -- Super admin can see all attendance
    is_super_admin()
    OR
    -- Users can see attendance if they're members or staff of the box where the class takes place
    EXISTS (
        SELECT 1
        FROM "Class" c
        WHERE c.id = "Class_Attendance".class_id
        AND (
            -- Box members can see attendance
            is_box_member(c.box_id)
            OR
            -- Box staff can see attendance
            EXISTS (
                SELECT 1
                FROM "Box_Staff" bs
                WHERE bs.user_id = auth.uid()
                AND bs.box_id = c.box_id
                AND (bs.end_date IS NULL OR bs.end_date >= CURRENT_DATE)
            )
        )
    )
);

-- Policy 2: Users can always see their own attendance records
CREATE POLICY "class_attendance_own_access"
ON "Class_Attendance"
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Policy 3: Any box staff can create attendance records
CREATE POLICY "class_attendance_staff_insert"
ON "Class_Attendance"
FOR INSERT
TO authenticated
WITH CHECK (
    -- Super admin can create attendance records for any class
    is_super_admin()
    OR
    -- Box staff can create attendance records for classes in their boxes
    EXISTS (
        SELECT 1
        FROM "Class" c
        INNER JOIN "Box_Staff" bs ON bs.box_id = c.box_id
        WHERE c.id = "Class_Attendance".class_id
        AND bs.user_id = auth.uid()
        AND (bs.end_date IS NULL OR bs.end_date >= CURRENT_DATE)
    )
);

-- Policy 4: Any box staff can update attendance records
CREATE POLICY "class_attendance_staff_update"
ON "Class_Attendance"
FOR UPDATE
TO authenticated
USING (
    -- Super admin has full update access
    is_super_admin()
    OR
    -- Box staff can update attendance records for classes in their boxes
    EXISTS (
        SELECT 1
        FROM "Class" c
        INNER JOIN "Box_Staff" bs ON bs.box_id = c.box_id
        WHERE c.id = "Class_Attendance".class_id
        AND bs.user_id = auth.uid()
        AND (bs.end_date IS NULL OR bs.end_date >= CURRENT_DATE)
    )
)
WITH CHECK (
    -- Super admin can update anything
    is_super_admin()
    OR
    -- Box staff can update attendance records for classes in their boxes
    EXISTS (
        SELECT 1
        FROM "Class" c
        INNER JOIN "Box_Staff" bs ON bs.box_id = c.box_id
        WHERE c.id = "Class_Attendance".class_id
        AND bs.user_id = auth.uid()
        AND (bs.end_date IS NULL OR bs.end_date >= CURRENT_DATE)
    )
);

-- Policy 5: No DELETE policy (attendance records should be preserved for audit trail)
-- Use attendance_status changes instead of deletion

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Class_Attendance RLS policies created successfully!';
    RAISE NOTICE 'Policies: box_visibility, own_access, staff_insert, staff_update';
    RAISE NOTICE 'BOX VISIBILITY: All box members see attendance for classes in their box';
    RAISE NOTICE 'OWN ACCESS: Users always see their own attendance history';
    RAISE NOTICE 'NO PRIVACY: Attendance visible to all box members (transparent community)';
    RAISE NOTICE 'STAFF MANAGEMENT: Any box staff can mark/update attendance status';
END $$;