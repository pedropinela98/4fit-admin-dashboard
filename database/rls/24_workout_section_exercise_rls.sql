-- ===============================================
-- WORKOUT_SECTION_EXERCISE TABLE RLS POLICIES
-- ===============================================
-- Security Model: INHERITS FROM PARENT WORKOUT ACCESS
-- - Follows same access pattern as Workout_Section (inheriting from parent Workout)
-- - Access controlled through parent chain (Workout_Section → Workout)
-- - Same management rules as parent (all staff except receptionists)
-- - Users can access Workout_Section_Exercise records directly
-- - Box isolation through parent Workout relationship
-- ===============================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "workout_section_exercise_box_members_only" ON "Workout_Section_Exercise";
DROP POLICY IF EXISTS "workout_section_exercise_staff_insert" ON "Workout_Section_Exercise";
DROP POLICY IF EXISTS "workout_section_exercise_staff_update" ON "Workout_Section_Exercise";
DROP POLICY IF EXISTS "workout_section_exercise_staff_delete" ON "Workout_Section_Exercise";

-- Enable RLS on Workout_Section_Exercise table
ALTER TABLE "Workout_Section_Exercise" ENABLE ROW LEVEL SECURITY;

-- Policy 1: Only active box members can see workout section exercises (through parent chain)
CREATE POLICY "workout_section_exercise_box_members_only"
ON "Workout_Section_Exercise"
FOR SELECT
TO authenticated
USING (
    -- Super admin can see all workout section exercises
    is_super_admin()
    OR
    -- Access controlled through parent chain (Workout_Section → Workout)
    EXISTS (
        SELECT 1
        FROM "Workout_Section" ws
        INNER JOIN "Workout" w ON w.id = ws.workout_id
        WHERE ws.id = "Workout_Section_Exercise".workout_section_id
        AND (
            -- Only active box members can see workout section exercises
            is_box_member(w.box_id)
            OR
            -- Box staff can see workout section exercises
            EXISTS (
                SELECT 1
                FROM "Box_Staff" bs
                WHERE bs.user_id = auth.uid()
                AND bs.box_id = w.box_id
                AND (bs.end_date IS NULL OR bs.end_date >= CURRENT_DATE)
            )
        )
    )
);

-- Policy 2: All staff except receptionists can create workout section exercises
CREATE POLICY "workout_section_exercise_staff_insert"
ON "Workout_Section_Exercise"
FOR INSERT
TO authenticated
WITH CHECK (
    -- Super admin can create workout section exercises for any workout section
    is_super_admin()
    OR
    -- Box staff except receptionists can create workout section exercises for sections in their boxes
    EXISTS (
        SELECT 1
        FROM "Workout_Section" ws
        INNER JOIN "Workout" w ON w.id = ws.workout_id
        INNER JOIN "Box_Staff" bs ON bs.box_id = w.box_id
        WHERE ws.id = "Workout_Section_Exercise".workout_section_id
        AND bs.user_id = auth.uid()
        AND bs.role IN ('admin', 'coach', 'super_admin')
        AND (bs.end_date IS NULL OR bs.end_date >= CURRENT_DATE)
    )
);

-- Policy 3: All staff except receptionists can update workout section exercises
CREATE POLICY "workout_section_exercise_staff_update"
ON "Workout_Section_Exercise"
FOR UPDATE
TO authenticated
USING (
    -- Super admin has full update access
    is_super_admin()
    OR
    -- Box staff except receptionists can update workout section exercises for sections in their boxes
    EXISTS (
        SELECT 1
        FROM "Workout_Section" ws
        INNER JOIN "Workout" w ON w.id = ws.workout_id
        INNER JOIN "Box_Staff" bs ON bs.box_id = w.box_id
        WHERE ws.id = "Workout_Section_Exercise".workout_section_id
        AND bs.user_id = auth.uid()
        AND bs.role IN ('admin', 'coach', 'super_admin')
        AND (bs.end_date IS NULL OR bs.end_date >= CURRENT_DATE)
    )
)
WITH CHECK (
    -- Super admin can update anything
    is_super_admin()
    OR
    -- Box staff except receptionists can update workout section exercises for sections in their boxes
    EXISTS (
        SELECT 1
        FROM "Workout_Section" ws
        INNER JOIN "Workout" w ON w.id = ws.workout_id
        INNER JOIN "Box_Staff" bs ON bs.box_id = w.box_id
        WHERE ws.id = "Workout_Section_Exercise".workout_section_id
        AND bs.user_id = auth.uid()
        AND bs.role IN ('admin', 'coach', 'super_admin')
        AND (bs.end_date IS NULL OR bs.end_date >= CURRENT_DATE)
    )
);

-- Policy 4: All staff except receptionists can delete workout section exercises
CREATE POLICY "workout_section_exercise_staff_delete"
ON "Workout_Section_Exercise"
FOR DELETE
TO authenticated
USING (
    -- Super admin can delete any workout section exercise
    is_super_admin()
    OR
    -- Box staff except receptionists can delete workout section exercises for sections in their boxes
    EXISTS (
        SELECT 1
        FROM "Workout_Section" ws
        INNER JOIN "Workout" w ON w.id = ws.workout_id
        INNER JOIN "Box_Staff" bs ON bs.box_id = w.box_id
        WHERE ws.id = "Workout_Section_Exercise".workout_section_id
        AND bs.user_id = auth.uid()
        AND bs.role IN ('admin', 'coach', 'super_admin')
        AND (bs.end_date IS NULL OR bs.end_date >= CURRENT_DATE)
    )
);

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Workout_Section_Exercise RLS policies created successfully!';
    RAISE NOTICE 'Policies: box_members_only, staff_insert, staff_update, staff_delete';
    RAISE NOTICE 'PARENT CHAIN: Access controlled through Workout_Section → Workout chain';
    RAISE NOTICE 'DIRECT ACCESS: Users can access Workout_Section_Exercise records directly';
    RAISE NOTICE 'BOX ISOLATION: Inherits box isolation from parent Workout through chain';
    RAISE NOTICE 'STAFF RESTRICTION: Receptionists cannot create/edit/delete exercises';
END $$;