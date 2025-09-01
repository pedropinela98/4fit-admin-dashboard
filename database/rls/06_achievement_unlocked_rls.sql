-- ===============================================
-- ACHIEVEMENT_UNLOCKED TABLE RLS POLICIES
-- ===============================================
-- Security Model:
-- - Users can read their own achievement unlocks
-- - Staff can ALWAYS see achievement unlocks of users in their boxes
-- - Follows user's public_results setting for member visibility
-- - If public_results=true, visible across all boxes where user is member
-- - Only system can INSERT (via triggers when achievements met)
-- - No UPDATE/DELETE allowed (achievement records immutable)
-- ===============================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "achievement_unlocked_own_access" ON "Achievement_Unlocked";
DROP POLICY IF EXISTS "achievement_unlocked_staff_always_access" ON "Achievement_Unlocked";
DROP POLICY IF EXISTS "achievement_unlocked_public_to_members" ON "Achievement_Unlocked";
DROP POLICY IF EXISTS "achievement_unlocked_system_insert" ON "Achievement_Unlocked";

-- Enable RLS on Achievement_Unlocked table
ALTER TABLE "Achievement_Unlocked" ENABLE ROW LEVEL SECURITY;

-- Policy 1: Users can read their own achievement unlocks
CREATE POLICY "achievement_unlocked_own_access"
ON "Achievement_Unlocked"
FOR SELECT
TO authenticated
USING (
    user_id = auth.uid()
);

-- Policy 2: Staff ALWAYS see achievement unlocks of users in their boxes
CREATE POLICY "achievement_unlocked_staff_always_access"
ON "Achievement_Unlocked"
FOR SELECT
TO authenticated
USING (
    user_id != auth.uid()  -- Not their own unlocks (covered by policy 1)
    AND (
        -- Super admin has full access
        is_super_admin()
        OR
        -- All staff can see achievement unlocks of users in their boxes
        EXISTS (
            SELECT 1
            FROM "Box_Member" bm
            JOIN "Box_Staff" bs ON bs.box_id = bm.box_id
            WHERE bm.user_id = "Achievement_Unlocked".user_id
            AND bs.user_id = auth.uid()
            AND bm.deleted_at IS NULL
            AND (bs.end_date IS NULL OR bs.end_date >= CURRENT_DATE)
        )
    )
);

-- Policy 3: Public achievement unlocks visible to members (follows public_results)
CREATE POLICY "achievement_unlocked_public_to_members"
ON "Achievement_Unlocked"
FOR SELECT
TO authenticated
USING (
    user_id != auth.uid()  -- Not their own unlocks (covered by policy 1)
    AND NOT EXISTS (
        -- Exclude if current user is staff in any box where user is member
        -- (staff access covered by policy 2)
        SELECT 1
        FROM "Box_Member" bm
        JOIN "Box_Staff" bs ON bs.box_id = bm.box_id
        WHERE bm.user_id = "Achievement_Unlocked".user_id
        AND bs.user_id = auth.uid()
        AND bm.deleted_at IS NULL
        AND (bs.end_date IS NULL OR bs.end_date >= CURRENT_DATE)
    )
    AND (
        -- Check if user has public_results = true
        EXISTS (
            SELECT 1
            FROM "User_detail" ud
            WHERE ud.id = "Achievement_Unlocked".user_id
            AND ud.public_results = true
        )
        AND
        -- Regular members can see public achievement unlocks if they share at least one box
        EXISTS (
            SELECT 1
            FROM "Box_Member" bm1  -- Achievement owner's memberships
            JOIN "Box_Member" bm2 ON bm2.box_id = bm1.box_id  -- Current user's memberships in same box
            WHERE bm1.user_id = "Achievement_Unlocked".user_id
            AND bm2.user_id = auth.uid()
            AND bm1.deleted_at IS NULL
            AND bm2.deleted_at IS NULL
        )
    )
);

-- Policy 4: Only system can insert achievement unlocks (via triggers with elevated privileges)
CREATE POLICY "achievement_unlocked_system_insert"
ON "Achievement_Unlocked"
FOR INSERT
TO authenticated
WITH CHECK (false);  -- No direct INSERT allowed to authenticated users

-- Grant INSERT to service_role (used by triggers)
-- This is handled by the trigger functions with SECURITY DEFINER

-- Policy 5: No UPDATE allowed (achievement records are immutable)
-- Achievement unlocks should not be modified once recorded

-- Policy 6: No DELETE allowed (achievement records are permanent)
-- Achievement history should be preserved

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Achievement_Unlocked RLS policies created successfully!';
    RAISE NOTICE 'Policies: own_access, staff_always_access, public_to_members, system_insert';
    RAISE NOTICE 'Follows public_results setting, visible across shared boxes';
    RAISE NOTICE 'Only system triggers can insert, no updates/deletes allowed';
END $$;