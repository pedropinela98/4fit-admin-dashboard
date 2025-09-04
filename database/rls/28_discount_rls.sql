-- ===============================================
-- DISCOUNT TABLE RLS POLICIES
-- ===============================================
-- Security Model: GLOBAL READ-ONLY DISCOUNT MANAGEMENT
-- - Discounts are global and accessible to all boxes
-- - All authenticated users can see active discounts
-- - Only super admins can create/update/delete discounts
-- - Box isolation happens at Applied_Discount level, not here
-- - Discounts are centrally managed but globally available
-- ===============================================

SET search_path TO public;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "discount_global_active_read" ON "Discount";
DROP POLICY IF EXISTS "discount_super_admin_insert" ON "Discount";
DROP POLICY IF EXISTS "discount_super_admin_update" ON "Discount";

-- Enable RLS on Discount table
ALTER TABLE "Discount" ENABLE ROW LEVEL SECURITY;

-- Policy 1: All authenticated users can see active discounts (global access)
CREATE POLICY "discount_global_active_read"
ON "Discount"
FOR SELECT
TO authenticated
USING (active = true);

-- Policy 2: Only super admins can create discounts
CREATE POLICY "discount_super_admin_insert"
ON "Discount"
FOR INSERT
TO authenticated
WITH CHECK (is_super_admin());

-- Policy 3: Only super admins can update discounts
CREATE POLICY "discount_super_admin_update"
ON "Discount"
FOR UPDATE
TO authenticated
USING (is_super_admin())
WITH CHECK (is_super_admin());

-- Policy 5: No DELETE policy (discounts should be deactivated, not deleted)
-- Use active = false for discount deactivation

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Discount RLS policies created successfully!';
    RAISE NOTICE 'Policies: global_active_read, super_admin_insert, super_admin_update';
    RAISE NOTICE 'GLOBAL ACCESS: All authenticated users can see active discounts';
    RAISE NOTICE 'READ-ONLY: Boxes can see but cannot create/update/delete discounts';
    RAISE NOTICE 'CENTRALIZED MANAGEMENT: Only super admins can create/update discounts';
    RAISE NOTICE 'BOX ISOLATION: Applied at Applied_Discount level, not here';
    RAISE NOTICE 'DEACTIVATION: Use active = false instead of DELETE';
END $$;