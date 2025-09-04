-- ===============================================
-- USER_DETAIL TABLE RLS POLICIES
-- ===============================================
-- Security Model:
-- - Users can read/update their own profile
-- - Staff can read profiles of users in their boxes
-- - Super admins have full access
-- - No public access to user details
-- ===============================================

SET search_path TO public;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "user_detail_own_profile" ON "User_detail";
DROP POLICY IF EXISTS "user_detail_staff_access" ON "User_detail";
DROP POLICY IF EXISTS "user_detail_super_admin_access" ON "User_detail";
DROP POLICY IF EXISTS "user_detail_own_update" ON "User_detail";
DROP POLICY IF EXISTS "user_detail_staff_update" ON "User_detail";

-- Enable RLS on User_detail table
ALTER TABLE "User_detail" ENABLE ROW LEVEL SECURITY;

-- Policy 1: Users can read their own profile
CREATE POLICY "user_detail_own_profile"
ON "User_detail"
FOR SELECT
TO authenticated
USING (
    id = auth.uid()
);

-- Policy 2: Staff can read profiles of users in their boxes
CREATE POLICY "user_detail_staff_access"
ON "User_detail"
FOR SELECT
TO authenticated
USING (
    -- Super admin has access to all profiles
    is_super_admin()
    OR
    -- Staff can see profiles of users who are members in their boxes
    EXISTS (
        SELECT 1
        FROM "Box_Member" bm
        JOIN "Box_Staff" bs ON bs.box_id = bm.box_id
        WHERE bm.user_id = "User_detail".id
        AND bs.user_id = auth.uid()
        AND bm.deleted_at IS NULL
        AND (bs.end_date IS NULL OR bs.end_date >= CURRENT_DATE)
    )
);

-- Policy 3: Users can update their own profile
CREATE POLICY "user_detail_own_update"
ON "User_detail"
FOR UPDATE
TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- Policy 4: Staff can update profiles of users in their boxes (admin+ only)
CREATE POLICY "user_detail_staff_update"
ON "User_detail"
FOR UPDATE
TO authenticated
USING (
    -- Super admin has full update access
    is_super_admin()
    OR
    -- Admin staff can update profiles of users in their boxes
    EXISTS (
        SELECT 1
        FROM "Box_Member" bm
        JOIN "Box_Staff" bs ON bs.box_id = bm.box_id
        WHERE bm.user_id = "User_detail".id
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
    -- Admin staff can update profiles of users in their boxes
    EXISTS (
        SELECT 1
        FROM "Box_Member" bm
        JOIN "Box_Staff" bs ON bs.box_id = bm.box_id
        WHERE bm.user_id = "User_detail".id
        AND bs.user_id = auth.uid()
        AND bs.role IN ('admin', 'super_admin')
        AND bm.deleted_at IS NULL
        AND (bs.end_date IS NULL OR bs.end_date >= CURRENT_DATE)
    )
);

-- Policy 5: No INSERT access (users created via auth trigger)
-- Users are created automatically via handle_new_user() trigger

-- Policy 6: No DELETE access (use soft delete with deleted_at)
-- Physical deletion not allowed, use deleted_at field

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'User_detail RLS policies created successfully!';
    RAISE NOTICE 'Policies: own_profile, staff_access, own_update, staff_update';
END $$;