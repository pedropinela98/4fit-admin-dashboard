-- ===============================================
-- WORKOUT_RESULT TABLE RLS POLICIES
-- ===============================================
-- Security Model: BOX-ISOLATED WORKOUT RESULTS
-- - Workout results are strictly isolated per box (only visible within box where created)
-- - Users can always see their own workout results
-- - When public_results = true, results visible to other box members within same box only
-- - All box staff can see workout results regardless of public_results setting
-- - Users themselves, admins, and coaches can create/edit workout results
-- - No special considerations for coaches (same as other staff)
-- ===============================================

SET search_path TO public;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "workout_result_own_access" ON "Workout_Result";
DROP POLICY IF EXISTS "workout_result_public_box_members" ON "Workout_Result";
DROP POLICY IF EXISTS "workout_result_staff_access" ON "Workout_Result";
DROP POLICY IF EXISTS "workout_result_user_coach_admin_insert" ON "Workout_Result";
DROP POLICY IF EXISTS "workout_result_user_coach_admin_update" ON "Workout_Result";

-- Enable RLS on Workout_Result table
ALTER TABLE "Workout_Result" ENABLE ROW LEVEL SECURITY;

-- Policy 1: Users can always see their own workout results
CREATE POLICY "workout_result_own_access"
ON "Workout_Result"
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Policy 2: Box members can see public workout results within same box only
CREATE POLICY "workout_result_public_box_members"
ON "Workout_Result"
FOR SELECT
TO authenticated
USING (
    user_id != auth.uid()  -- Not own results (covered by policy 1)
    AND EXISTS (
        -- Check if the result owner has public_results = true
        SELECT 1
        FROM "User_detail" ud
        WHERE ud.id = "Workout_Result".user_id
        AND ud.public_results = true
    )
    AND EXISTS (
        -- Check if current user and result owner are members of same box
        SELECT 1
        FROM "Box_Member" bm_owner
        INNER JOIN "Box_Member" bm_viewer ON bm_owner.box_id = bm_viewer.box_id
        WHERE bm_owner.user_id = "Workout_Result".user_id
        AND bm_viewer.user_id = auth.uid()
        AND bm_owner.deleted_at IS NULL
        AND bm_viewer.deleted_at IS NULL
    )
);

-- Policy 3: All box staff can see workout results regardless of public_results setting
CREATE POLICY "workout_result_staff_access"
ON "Workout_Result"
FOR SELECT
TO authenticated
USING (
    -- Super admin can see all workout results
    is_super_admin()
    OR
    -- Box staff can see results from users in their boxes
    EXISTS (
        SELECT 1
        FROM "Box_Member" bm
        INNER JOIN "Box_Staff" bs ON bs.box_id = bm.box_id
        WHERE bm.user_id = "Workout_Result".user_id
        AND bs.user_id = auth.uid()
        AND bm.deleted_at IS NULL
        AND (bs.end_date IS NULL OR bs.end_date >= CURRENT_DATE)
    )
);

-- Policy 4: Users, coaches, and admins can create workout results
CREATE POLICY "workout_result_user_coach_admin_insert"
ON "Workout_Result"
FOR INSERT
TO authenticated
WITH CHECK (
    -- Super admin can create workout results for any user
    is_super_admin()
    OR
    -- Users can create their own workout results
    user_id = auth.uid()
    OR
    -- Box coaches and admins can create workout results for users in their boxes
    EXISTS (
        SELECT 1
        FROM "Box_Member" bm
        INNER JOIN "Box_Staff" bs ON bs.box_id = bm.box_id
        WHERE bm.user_id = "Workout_Result".user_id
        AND bs.user_id = auth.uid()
        AND bs.role IN ('admin', 'coach', 'super_admin')
        AND bm.deleted_at IS NULL
        AND (bs.end_date IS NULL OR bs.end_date >= CURRENT_DATE)
    )
);

-- Policy 5: Users, coaches, and admins can update workout results
CREATE POLICY "workout_result_user_coach_admin_update"
ON "Workout_Result"
FOR UPDATE
TO authenticated
USING (
    -- Super admin has full update access
    is_super_admin()
    OR
    -- Users can update their own workout results
    user_id = auth.uid()
    OR
    -- Box coaches and admins can update workout results for users in their boxes
    EXISTS (
        SELECT 1
        FROM "Box_Member" bm
        INNER JOIN "Box_Staff" bs ON bs.box_id = bm.box_id
        WHERE bm.user_id = "Workout_Result".user_id
        AND bs.user_id = auth.uid()
        AND bs.role IN ('admin', 'coach', 'super_admin')
        AND bm.deleted_at IS NULL
        AND (bs.end_date IS NULL OR bs.end_date >= CURRENT_DATE)
    )
)
WITH CHECK (
    -- Super admin can update anything
    is_super_admin()
    OR
    -- Users can update their own workout results
    user_id = auth.uid()
    OR
    -- Box coaches and admins can update workout results for users in their boxes
    EXISTS (
        SELECT 1
        FROM "Box_Member" bm
        INNER JOIN "Box_Staff" bs ON bs.box_id = bm.box_id
        WHERE bm.user_id = "Workout_Result".user_id
        AND bs.user_id = auth.uid()
        AND bs.role IN ('admin', 'coach', 'super_admin')
        AND bm.deleted_at IS NULL
        AND (bs.end_date IS NULL OR bs.end_date >= CURRENT_DATE)
    )
);

-- Policy 6: No DELETE policy (workout results should be preserved for history)
-- Consider using a soft delete pattern if needed

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Workout_Result RLS policies created successfully!';
    RAISE NOTICE 'Policies: own_access, public_box_members, staff_access, user_coach_admin_insert, user_coach_admin_update';
    RAISE NOTICE 'BOX ISOLATION: Results strictly isolated per box where created';
    RAISE NOTICE 'OWN ACCESS: Users always see their own results';
    RAISE NOTICE 'PUBLIC RESULTS: When public_results=true, visible to box members only';
    RAISE NOTICE 'STAFF ACCESS: All box staff see results regardless of public setting';
    RAISE NOTICE 'MANAGEMENT: Users, coaches, and admins can create/edit results';
END $$;