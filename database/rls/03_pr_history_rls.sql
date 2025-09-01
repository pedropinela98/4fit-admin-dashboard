-- ===============================================
-- PR_HISTORY TABLE RLS POLICIES
-- ===============================================
-- Security Model:
-- - Users can read their own PR history
-- - Staff can ALWAYS see PR history of users in their boxes
-- - PR history inherits visibility from user's public_results setting
-- - Members can see public PR history across shared boxes
-- - Only system can INSERT (via triggers)
-- - No UPDATE/DELETE allowed (historical data immutable)
-- ===============================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "pr_history_own_access" ON "PR_History";
DROP POLICY IF EXISTS "pr_history_staff_always_access" ON "PR_History";
DROP POLICY IF EXISTS "pr_history_public_to_members" ON "PR_History";
DROP POLICY IF EXISTS "pr_history_system_insert" ON "PR_History";

-- Enable RLS on PR_History table
ALTER TABLE "PR_History" ENABLE ROW LEVEL SECURITY;

-- Policy 1: Users can read their own PR history
CREATE POLICY "pr_history_own_access"
ON "PR_History"
FOR SELECT
TO authenticated
USING (
    user_id = auth.uid()
);

-- Policy 2: Staff ALWAYS see PR history of users in their boxes
CREATE POLICY "pr_history_staff_always_access"
ON "PR_History"
FOR SELECT
TO authenticated
USING (
    user_id != auth.uid()  -- Not their own history (covered by policy 1)
    AND (
        -- Super admin has full access
        is_super_admin()
        OR
        -- All staff can see PR history of users in their boxes
        EXISTS (
            SELECT 1
            FROM "Box_Member" bm
            JOIN "Box_Staff" bs ON bs.box_id = bm.box_id
            WHERE bm.user_id = "PR_History".user_id
            AND bs.user_id = auth.uid()
            AND bm.deleted_at IS NULL
            AND (bs.end_date IS NULL OR bs.end_date >= CURRENT_DATE)
        )
    )
);

-- Policy 3: Public PR history visible to members (inherits from user's public_results)
CREATE POLICY "pr_history_public_to_members"
ON "PR_History"
FOR SELECT
TO authenticated
USING (
    user_id != auth.uid()  -- Not their own history (covered by policy 1)
    AND NOT EXISTS (
        -- Exclude if current user is staff in any box where user is member
        -- (staff access covered by policy 2)
        SELECT 1
        FROM "Box_Member" bm
        JOIN "Box_Staff" bs ON bs.box_id = bm.box_id
        WHERE bm.user_id = "PR_History".user_id
        AND bs.user_id = auth.uid()
        AND bm.deleted_at IS NULL
        AND (bs.end_date IS NULL OR bs.end_date >= CURRENT_DATE)
    )
    AND (
        -- Check if user has public_results = true
        EXISTS (
            SELECT 1
            FROM "User_detail" ud
            WHERE ud.id = "PR_History".user_id
            AND ud.public_results = true
        )
        AND
        -- Regular members can see public PR history if they share at least one box
        EXISTS (
            SELECT 1
            FROM "Box_Member" bm1  -- PR history owner's memberships
            JOIN "Box_Member" bm2 ON bm2.box_id = bm1.box_id  -- Current user's memberships in same box
            WHERE bm1.user_id = "PR_History".user_id
            AND bm2.user_id = auth.uid()
            AND bm1.deleted_at IS NULL
            AND bm2.deleted_at IS NULL
        )
    )
);

-- Policy 4: Only system can insert PR history (via triggers with elevated privileges)
CREATE POLICY "pr_history_system_insert"
ON "PR_History"
FOR INSERT
TO authenticated
WITH CHECK (false);  -- No direct INSERT allowed to authenticated users

-- Grant INSERT to service_role (used by triggers)
-- This is handled by the trigger functions with SECURITY DEFINER

-- Policy 5: No UPDATE allowed (historical data is immutable)
-- No UPDATE policy needed - historical data should not be modified

-- Policy 6: No DELETE allowed (historical data is permanent)
-- No DELETE policy needed - historical data should be preserved

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'PR_History RLS policies created successfully!';
    RAISE NOTICE 'Policies: own_access, staff_always_access, public_to_members, system_insert';
    RAISE NOTICE 'PR history inherits visibility from User_detail.public_results setting';
    RAISE NOTICE 'Only system triggers can insert, no updates/deletes allowed';
END $$;