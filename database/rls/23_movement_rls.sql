-- ===============================================
-- MOVEMENT TABLE RLS POLICIES
-- ===============================================
-- Security Model: GLOBAL RESOURCE MANAGEMENT
-- - Movements are global resources visible to all authenticated users
-- - Only super admins can create/edit/deactivate movements
-- - No active filtering - all movements visible to all users
-- - No box-based isolation (global across platform)
-- - Similar pattern to Achievement table
-- ===============================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "movement_global_read" ON "Movement";
DROP POLICY IF EXISTS "movement_super_admin_insert" ON "Movement";
DROP POLICY IF EXISTS "movement_super_admin_update" ON "Movement";
DROP POLICY IF EXISTS "movement_super_admin_delete" ON "Movement";

-- Enable RLS on Movement table
ALTER TABLE "Movement" ENABLE ROW LEVEL SECURITY;

-- Policy 1: All authenticated users can see all movements (global resource)
CREATE POLICY "movement_global_read"
ON "Movement"
FOR SELECT
TO authenticated
USING (true);

-- Policy 2: Only super admins can create movements
CREATE POLICY "movement_super_admin_insert"
ON "Movement"
FOR INSERT
TO authenticated
WITH CHECK (is_super_admin());

-- Policy 3: Only super admins can update movements
CREATE POLICY "movement_super_admin_update"
ON "Movement"
FOR UPDATE
TO authenticated
USING (is_super_admin())
WITH CHECK (is_super_admin());

-- Policy 4: Only super admins can delete movements
CREATE POLICY "movement_super_admin_delete"
ON "Movement"
FOR DELETE
TO authenticated
USING (is_super_admin());

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Movement RLS policies created successfully!';
    RAISE NOTICE 'Policies: global_read, super_admin_insert, super_admin_update, super_admin_delete';
    RAISE NOTICE 'GLOBAL ACCESS: All authenticated users can see all movements';
    RAISE NOTICE 'NO BOX ISOLATION: Movements are platform-wide global resources';
    RAISE NOTICE 'NO ACTIVE FILTER: All movements visible regardless of status';
    RAISE NOTICE 'SUPER ADMIN ONLY: Only super admins can create/edit/delete movements';
END $$;