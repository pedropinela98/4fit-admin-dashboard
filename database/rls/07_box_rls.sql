-- ===============================================
-- BOX TABLE RLS POLICIES
-- ===============================================
-- Security Model:
-- - All authenticated users can browse active boxes (discovery)
-- - Box details (location, coordinates) are public within platform
-- - Only SUPER ADMINS can create new boxes
-- - Only SUPER ADMINS can update box details and active status
-- - Box admins cannot modify box information (only manage staff/members)
-- ===============================================

SET search_path TO public;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "box_read_active_authenticated" ON "Box";
DROP POLICY IF EXISTS "box_super_admin_read_all" ON "Box";
DROP POLICY IF EXISTS "box_super_admin_insert" ON "Box";
DROP POLICY IF EXISTS "box_super_admin_update" ON "Box";

-- Enable RLS on Box table
ALTER TABLE "Box" ENABLE ROW LEVEL SECURITY;

-- Policy 1: All authenticated users can read active boxes (discovery)
CREATE POLICY "box_read_active_authenticated"
ON "Box"
FOR SELECT
TO authenticated
USING (
    active = true
);

-- Policy 2: Super admins can read all boxes (including inactive)
CREATE POLICY "box_super_admin_read_all"
ON "Box"
FOR SELECT
TO authenticated
USING (
    is_super_admin()
    AND active = false  -- Only for inactive ones (active covered by policy 1)
);

-- Policy 3: Super admins can create new boxes
CREATE POLICY "box_super_admin_insert"
ON "Box"
FOR INSERT
TO authenticated
WITH CHECK (
    is_super_admin()
);

-- Policy 4: Super admins can update box details and active status
CREATE POLICY "box_super_admin_update"
ON "Box"
FOR UPDATE
TO authenticated
USING (is_super_admin())
WITH CHECK (is_super_admin());

-- Policy 5: No DELETE policy (use active field for soft disable)
-- Boxes should not be physically deleted to preserve historical data

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Box RLS policies created successfully!';
    RAISE NOTICE 'Policies: read_active_authenticated, super_admin_read_all, super_admin_insert, super_admin_update';
    RAISE NOTICE 'All authenticated users can discover active boxes';
    RAISE NOTICE 'Only super admins can manage boxes (create/update/activate/deactivate)';
END $$;