-- ===============================================
-- WORKOUT_RESULT_LIKE TABLE RLS POLICIES
-- ===============================================
-- Security Model: BOX-WIDE LIKE VISIBILITY
-- - Likes are always public inside a box (users see all likes in their box)
-- - Users can see all likes on their own results and other members' results in same box
-- - Users can always see their own likes
-- - Likes don't follow Workout_Result access pattern - they're public within box
-- - Only users themselves can create/delete likes (no staff management)
-- - Likes inherit same box isolation as workout results they're attached to
-- ===============================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "workout_result_like_own_access" ON "Workout_Result_Like";
DROP POLICY IF EXISTS "workout_result_like_box_public" ON "Workout_Result_Like";
DROP POLICY IF EXISTS "workout_result_like_user_insert" ON "Workout_Result_Like";
DROP POLICY IF EXISTS "workout_result_like_user_delete" ON "Workout_Result_Like";

-- Enable RLS on Workout_Result_Like table
ALTER TABLE "Workout_Result_Like" ENABLE ROW LEVEL SECURITY;

-- Policy 1: Users can always see their own likes
CREATE POLICY "workout_result_like_own_access"
ON "Workout_Result_Like"
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Policy 2: Users can see all likes within their boxes (likes are public inside box)
CREATE POLICY "workout_result_like_box_public"
ON "Workout_Result_Like"
FOR SELECT
TO authenticated
USING (
    -- Super admin can see all likes
    is_super_admin()
    OR
    user_id != auth.uid()  -- Not own likes (covered by policy 1)
    AND (
        -- User can see likes if they're in the same box as the workout result owner
        EXISTS (
            SELECT 1
            FROM "Workout_Result" wr
            INNER JOIN "Box_Member" bm_result_owner ON bm_result_owner.user_id = wr.user_id
            INNER JOIN "Box_Member" bm_viewer ON bm_viewer.box_id = bm_result_owner.box_id
            WHERE wr.id = "Workout_Result_Like".workout_result_id
            AND bm_viewer.user_id = auth.uid()
            AND bm_result_owner.deleted_at IS NULL
            AND bm_viewer.deleted_at IS NULL
        )
        OR
        -- Box staff can see all likes for results from users in their boxes
        EXISTS (
            SELECT 1
            FROM "Workout_Result" wr
            INNER JOIN "Box_Member" bm ON bm.user_id = wr.user_id
            INNER JOIN "Box_Staff" bs ON bs.box_id = bm.box_id
            WHERE wr.id = "Workout_Result_Like".workout_result_id
            AND bs.user_id = auth.uid()
            AND bm.deleted_at IS NULL
            AND (bs.end_date IS NULL OR bs.end_date >= CURRENT_DATE)
        )
    )
);

-- Policy 3: Only users themselves can create likes
CREATE POLICY "workout_result_like_user_insert"
ON "Workout_Result_Like"
FOR INSERT
TO authenticated
WITH CHECK (
    -- Super admin can create likes for any user
    is_super_admin()
    OR
    -- Users can only create their own likes
    user_id = auth.uid()
);

-- Policy 4: Only users themselves can delete their own likes
CREATE POLICY "workout_result_like_user_delete"
ON "Workout_Result_Like"
FOR DELETE
TO authenticated
USING (
    -- Super admin can delete any like
    is_super_admin()
    OR
    -- Users can only delete their own likes
    user_id = auth.uid()
);

-- Policy 5: No UPDATE policy (likes are typically create/delete only)
-- If updates are needed later, add similar policy to delete

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Workout_Result_Like RLS policies created successfully!';
    RAISE NOTICE 'Policies: own_access, box_public, user_insert, user_delete';
    RAISE NOTICE 'BOX PUBLIC: Likes are always public within the same box';
    RAISE NOTICE 'BOX ISOLATION: Inherits box isolation from workout results';
    RAISE NOTICE 'OWN ACCESS: Users always see their own likes';
    RAISE NOTICE 'USER MANAGEMENT: Only users themselves can create/delete likes';
    RAISE NOTICE 'NO STAFF CONTROL: Staff cannot manage likes for users';
END $$;