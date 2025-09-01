-- ===============================================
-- ACHIEVEMENT TABLE RLS POLICIES
-- ===============================================
-- Security Model:
-- - GLOBAL RESOURCE: Achievements are platform-wide, same for all boxes
-- - All authenticated users can read active achievements
-- - Only SUPER ADMINS can create/update/manage achievements
-- - Inactive achievements hidden from regular users
-- - Movements are also global resources
-- ===============================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "achievement_read_active" ON "Achievement";
DROP POLICY IF EXISTS "achievement_super_admin_read" ON "Achievement";
DROP POLICY IF EXISTS "achievement_super_admin_write" ON "Achievement";

-- Enable RLS on Achievement table
ALTER TABLE "Achievement" ENABLE ROW LEVEL SECURITY;

-- Policy 1: All authenticated users can read active achievements
CREATE POLICY "achievement_read_active"
ON "Achievement"
FOR SELECT
TO authenticated
USING (
    is_active = true
    AND deleted_at IS NULL
);

-- Policy 2: Super admins can read all achievements (including inactive)
CREATE POLICY "achievement_super_admin_read"
ON "Achievement"
FOR SELECT
TO authenticated
USING (
    is_super_admin()
    AND (is_active = false OR deleted_at IS NOT NULL)  -- Only for inactive/deleted ones
);

-- Policy 3: Super admins can insert new achievements
CREATE POLICY "achievement_super_admin_insert"
ON "Achievement"
FOR INSERT
TO authenticated
WITH CHECK (
    is_super_admin()
);

-- Policy 4: Super admins can update achievements
CREATE POLICY "achievement_super_admin_update"
ON "Achievement"
FOR UPDATE
TO authenticated
USING (is_super_admin())
WITH CHECK (is_super_admin());

-- Policy 5: No DELETE policy (use soft delete with deleted_at)
-- Super admins should use deleted_at field for soft deletion

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Achievement RLS policies created successfully!';
    RAISE NOTICE 'Policies: read_active, super_admin_read, super_admin_insert, super_admin_update';
    RAISE NOTICE 'GLOBAL RESOURCE: Achievements visible platform-wide when active';
    RAISE NOTICE 'Only super admins can manage achievements';
END $$;