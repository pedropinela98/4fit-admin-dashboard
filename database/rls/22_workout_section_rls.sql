-- ===============================================
-- WORKOUT_SECTION TABLE RLS POLICIES
-- ===============================================
-- Security Model: INHERITS FROM PARENT WORKOUT ACCESS
-- - Follows same access pattern as Workout (only active box members can see)
-- - Access controlled through parent Workout's box membership
-- - Same management rules as Workout (all staff except receptionists)
-- - Users can access Workout_Section records directly
-- - Box isolation through parent Workout relationship
-- ===============================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "workout_section_box_members_only" ON "Workout_Section";
DROP POLICY IF EXISTS "workout_section_staff_insert" ON "Workout_Section";
DROP POLICY IF EXISTS "workout_section_staff_update" ON "Workout_Section";
DROP POLICY IF EXISTS "workout_section_staff_delete" ON "Workout_Section";

-- Enable RLS on Workout_Section table
ALTER TABLE "Workout_Section" ENABLE ROW LEVEL SECURITY;

-- Policy 1: Only active box members can see workout sections (through parent Workout)
CREATE POLICY "workout_section_box_members_only"
ON "Workout_Section"
FOR SELECT
TO authenticated
USING (
    -- Super admin can see all workout sections
    is_super_admin()
    OR
    -- Access controlled through parent Workout's box membership
    EXISTS (
        SELECT 1
        FROM "Workout" w
        WHERE w.id = "Workout_Section".workout_id
        AND (
            -- Only active box members can see workout sections
            is_box_member(w.box_id)
            OR
            -- Box staff can see workout sections
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

-- Policy 2: All staff except receptionists can create workout sections
CREATE POLICY "workout_section_staff_insert"
ON "Workout_Section"
FOR INSERT
TO authenticated
WITH CHECK (
    -- Super admin can create workout sections for any workout
    is_super_admin()
    OR
    -- Box staff except receptionists can create workout sections for workouts in their boxes
    EXISTS (
        SELECT 1
        FROM "Workout" w
        INNER JOIN "Box_Staff" bs ON bs.box_id = w.box_id
        WHERE w.id = "Workout_Section".workout_id
        AND bs.user_id = auth.uid()
        AND bs.role IN ('admin', 'coach', 'super_admin')
        AND (bs.end_date IS NULL OR bs.end_date >= CURRENT_DATE)
    )
);

-- Policy 3: All staff except receptionists can update workout sections
CREATE POLICY "workout_section_staff_update"
ON "Workout_Section"
FOR UPDATE
TO authenticated
USING (
    -- Super admin has full update access
    is_super_admin()
    OR
    -- Box staff except receptionists can update workout sections for workouts in their boxes
    EXISTS (
        SELECT 1
        FROM "Workout" w
        INNER JOIN "Box_Staff" bs ON bs.box_id = w.box_id
        WHERE w.id = "Workout_Section".workout_id
        AND bs.user_id = auth.uid()
        AND bs.role IN ('admin', 'coach', 'super_admin')
        AND (bs.end_date IS NULL OR bs.end_date >= CURRENT_DATE)
    )
)
WITH CHECK (
    -- Super admin can update anything
    is_super_admin()
    OR
    -- Box staff except receptionists can update workout sections for workouts in their boxes
    EXISTS (
        SELECT 1
        FROM "Workout" w
        INNER JOIN "Box_Staff" bs ON bs.box_id = w.box_id
        WHERE w.id = "Workout_Section".workout_id
        AND bs.user_id = auth.uid()
        AND bs.role IN ('admin', 'coach', 'super_admin')
        AND (bs.end_date IS NULL OR bs.end_date >= CURRENT_DATE)
    )
);

-- Policy 4: All staff except receptionists can delete workout sections
CREATE POLICY "workout_section_staff_delete"
ON "Workout_Section"
FOR DELETE
TO authenticated
USING (
    -- Super admin can delete any workout section
    is_super_admin()
    OR
    -- Box staff except receptionists can delete workout sections for workouts in their boxes
    EXISTS (
        SELECT 1
        FROM "Workout" w
        INNER JOIN "Box_Staff" bs ON bs.box_id = w.box_id
        WHERE w.id = "Workout_Section".workout_id
        AND bs.user_id = auth.uid()
        AND bs.role IN ('admin', 'coach', 'super_admin')
        AND (bs.end_date IS NULL OR bs.end_date >= CURRENT_DATE)
    )
);

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Workout_Section RLS policies created successfully!';
    RAISE NOTICE 'Policies: box_members_only, staff_insert, staff_update, staff_delete';
    RAISE NOTICE 'PARENT ACCESS: Access controlled through parent Workout box membership';
    RAISE NOTICE 'DIRECT ACCESS: Users can access Workout_Section records directly';
    RAISE NOTICE 'BOX ISOLATION: Inherits box isolation from parent Workout';
    RAISE NOTICE 'STAFF RESTRICTION: Receptionists cannot create/edit/delete sections';
END $$;