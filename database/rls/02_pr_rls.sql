-- ===============================================
-- PR TABLE RLS POLICIES
-- ===============================================
-- Security Model:
-- - Users can read/insert/update their own PRs
-- - If public=true, PRs visible to members across all boxes where user is member
-- - Staff ALWAYS see PRs of users in their boxes (regardless of public flag)
-- - Members can only see private PRs if they own them
-- - Super admins have full access
-- ===============================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "pr_own_access" ON "PR";
DROP POLICY IF EXISTS "pr_public_to_members" ON "PR";
DROP POLICY IF EXISTS "pr_staff_always_access" ON "PR";
DROP POLICY IF EXISTS "pr_own_insert" ON "PR";
DROP POLICY IF EXISTS "pr_own_update" ON "PR";
DROP POLICY IF EXISTS "pr_staff_update" ON "PR";

-- Enable RLS on PR table
ALTER TABLE "PR" ENABLE ROW LEVEL SECURITY;

-- Policy 1: Users can read their own PRs
CREATE POLICY "pr_own_access"
ON "PR"
FOR SELECT
TO authenticated
USING (
    user_id = auth.uid()
);

-- Policy 2: Staff ALWAYS see PRs of users in their boxes
CREATE POLICY "pr_staff_always_access"
ON "PR"
FOR SELECT
TO authenticated
USING (
    user_id != auth.uid()  -- Not their own PRs (covered by policy 1)
    AND (
        -- Super admin has full access
        is_super_admin()
        OR
        -- All staff can see PRs of users in their boxes (regardless of public flag)
        EXISTS (
            SELECT 1
            FROM "Box_Member" bm
            JOIN "Box_Staff" bs ON bs.box_id = bm.box_id
            WHERE bm.user_id = "PR".user_id
            AND bs.user_id = auth.uid()
            AND bm.deleted_at IS NULL
            AND (bs.end_date IS NULL OR bs.end_date >= CURRENT_DATE)
        )
    )
);

-- Policy 3: Public PRs visible to members across boxes where user is also member
CREATE POLICY "pr_public_to_members"
ON "PR"
FOR SELECT
TO authenticated
USING (
    user_id != auth.uid()  -- Not their own PRs (covered by policy 1)
    AND NOT EXISTS (
        -- Exclude if current user is staff in any box where PR owner is member
        -- (staff access covered by policy 2)
        SELECT 1
        FROM "Box_Member" bm
        JOIN "Box_Staff" bs ON bs.box_id = bm.box_id
        WHERE bm.user_id = "PR".user_id
        AND bs.user_id = auth.uid()
        AND bm.deleted_at IS NULL
        AND (bs.end_date IS NULL OR bs.end_date >= CURRENT_DATE)
    )
    AND (
        -- Check if user has public_results = true
        EXISTS (
            SELECT 1
            FROM "User_detail" ud
            WHERE ud.id = "PR".user_id
            AND ud.public_results = true
        )
    AND (
        -- Regular members can see public PRs if they share at least one box
        EXISTS (
            SELECT 1
            FROM "Box_Member" bm1  -- PR owner's memberships
            JOIN "Box_Member" bm2 ON bm2.box_id = bm1.box_id  -- Current user's memberships in same box
            WHERE bm1.user_id = "PR".user_id
            AND bm2.user_id = auth.uid()
            AND bm1.deleted_at IS NULL
            AND bm2.deleted_at IS NULL
        )
    )
);

-- Policy 4: Users can insert their own PRs
CREATE POLICY "pr_own_insert"
ON "PR"
FOR INSERT
TO authenticated
WITH CHECK (
    user_id = auth.uid()
    -- Additional validation: user should be member of at least one box
    AND EXISTS (
        SELECT 1
        FROM "Box_Member" bm
        WHERE bm.user_id = auth.uid()
        AND bm.deleted_at IS NULL
    )
);

-- Policy 5: Users can update their own PRs
CREATE POLICY "pr_own_update"
ON "PR"
FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Policy 6: Admin+ staff can update PRs of users in their boxes
CREATE POLICY "pr_staff_update"
ON "PR"
FOR UPDATE
TO authenticated
USING (
    -- Super admin has full update access
    is_super_admin()
    OR
    -- Admin staff can update PRs of users in their boxes
    EXISTS (
        SELECT 1
        FROM "Box_Member" bm
        JOIN "Box_Staff" bs ON bs.box_id = bm.box_id
        WHERE bm.user_id = "PR".user_id
        AND bs.user_id = auth.uid()
        AND bs.role IN ('admin', 'super_admin')
        AND bm.deleted_at IS NULL
        AND (bs.end_date IS NULL OR bs.end_date >= CURRENT_DATE)
    )
)
WITH CHECK (
    -- Super admin can update anything
    is_super_admin()
    OR
    -- Admin staff can update PRs of users in their boxes
    EXISTS (
        SELECT 1
        FROM "Box_Member" bm
        JOIN "Box_Staff" bs ON bs.box_id = bm.box_id
        WHERE bm.user_id = "PR".user_id
        AND bs.user_id = auth.uid()
        AND bs.role IN ('admin', 'super_admin')
        AND bm.deleted_at IS NULL
        AND (bs.end_date IS NULL OR bs.end_date >= CURRENT_DATE)
    )
);

-- Policy 7: No DELETE access (use soft delete with deleted_at)
-- Physical deletion not allowed, use deleted_at field for soft delete

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'PR RLS policies created successfully!';
    RAISE NOTICE 'Policies: own_access, staff_always_access, public_to_members, own_insert, own_update, staff_update';
    RAISE NOTICE 'Staff can ALWAYS see PRs in their boxes, members only see public PRs';
END $$;