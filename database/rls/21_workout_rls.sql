-- ===============================================
-- WORKOUT TABLE RLS POLICIES
-- ===============================================
-- Security Model: BOX-BASED WORKOUT TEMPLATE MANAGEMENT
-- - Only active box members can see workout details
-- - Workouts are isolated per box (not global resources)
-- - Coaches can see and create workout templates in their boxes
-- - All staff except receptionists can create/edit workout templates
-- - No visibility differences between active/inactive workouts
-- - No privacy considerations for workout history
-- ===============================================

SET search_path TO public;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "workout_box_members_only" ON "Workout";
DROP POLICY IF EXISTS "workout_staff_insert" ON "Workout";
DROP POLICY IF EXISTS "workout_staff_update" ON "Workout";
DROP POLICY IF EXISTS "workout_staff_delete" ON "Workout";

-- Enable RLS on Workout table
ALTER TABLE "Workout" ENABLE ROW LEVEL SECURITY;

-- Policy 1: Only active box members can see workout details
CREATE POLICY "workout_box_members_only"
ON "Workout"
FOR SELECT
TO authenticated
USING (
    -- Super admin can see all workouts
    is_super_admin()
    OR
    -- Only active box members can see workout details (through class)
    EXISTS (
        SELECT 1
        FROM "Class" c
        WHERE c.id = "Workout".class_id
        AND is_box_member(c.box_id)
    )
    OR
    -- Box staff can see workout details (through class)
    EXISTS (
        SELECT 1
        FROM "Class" c
        INNER JOIN "Box_Staff" bs ON bs.box_id = c.box_id
        WHERE c.id = "Workout".class_id
        AND bs.user_id = auth.uid()
        AND (bs.end_date IS NULL OR bs.end_date >= CURRENT_DATE)
    )
);

-- Policy 2: All staff except receptionists can create workouts
CREATE POLICY "workout_staff_insert"
ON "Workout"
FOR INSERT
TO authenticated
WITH CHECK (
    -- Super admin can create workouts in any box
    is_super_admin()
    OR
    -- Box staff except receptionists can create workouts in their boxes (through class)
    EXISTS (
        SELECT 1
        FROM "Class" c
        INNER JOIN "Box_Staff" bs ON bs.box_id = c.box_id
        WHERE c.id = "Workout".class_id
        AND bs.user_id = auth.uid()
        AND bs.role IN ('admin', 'coach', 'super_admin')
        AND (bs.end_date IS NULL OR bs.end_date >= CURRENT_DATE)
    )
);

-- Policy 3: All staff except receptionists can update workouts
CREATE POLICY "workout_staff_update"
ON "Workout"
FOR UPDATE
TO authenticated
USING (
    -- Super admin has full update access
    is_super_admin()
    OR
    -- Box staff except receptionists can update workouts in their boxes (through class)
    EXISTS (
        SELECT 1
        FROM "Class" c
        INNER JOIN "Box_Staff" bs ON bs.box_id = c.box_id
        WHERE c.id = "Workout".class_id
        AND bs.user_id = auth.uid()
        AND bs.role IN ('admin', 'coach', 'super_admin')
        AND (bs.end_date IS NULL OR bs.end_date >= CURRENT_DATE)
    )
)
WITH CHECK (
    -- Super admin can update anything
    is_super_admin()
    OR
    -- Box staff except receptionists can update workouts in their boxes (through class)
    EXISTS (
        SELECT 1
        FROM "Class" c
        INNER JOIN "Box_Staff" bs ON bs.box_id = c.box_id
        WHERE c.id = "Workout".class_id
        AND bs.user_id = auth.uid()
        AND bs.role IN ('admin', 'coach', 'super_admin')
        AND (bs.end_date IS NULL OR bs.end_date >= CURRENT_DATE)
    )
);

-- Policy 4: All staff except receptionists can delete workouts
CREATE POLICY "workout_staff_delete"
ON "Workout"
FOR DELETE
TO authenticated
USING (
    -- Super admin can delete any workout
    is_super_admin()
    OR
    -- Box staff except receptionists can delete workouts in their boxes (through class)
    EXISTS (
        SELECT 1
        FROM "Class" c
        INNER JOIN "Box_Staff" bs ON bs.box_id = c.box_id
        WHERE c.id = "Workout".class_id
        AND bs.user_id = auth.uid()
        AND bs.role IN ('admin', 'coach', 'super_admin')
        AND (bs.end_date IS NULL OR bs.end_date >= CURRENT_DATE)
    )
);

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Workout RLS policies created successfully!';
    RAISE NOTICE 'Policies: box_members_only, staff_insert, staff_update, staff_delete';
    RAISE NOTICE 'BOX ISOLATION: Workouts isolated per box, only active members see details';
    RAISE NOTICE 'MEMBER ACCESS: Only active box members can view workout templates';
    RAISE NOTICE 'COACH MANAGEMENT: Coaches can create and edit workout templates';
    RAISE NOTICE 'STAFF RESTRICTION: Receptionists cannot create/edit/delete workouts';
END $$;