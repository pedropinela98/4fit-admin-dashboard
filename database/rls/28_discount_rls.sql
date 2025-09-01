-- ===============================================
-- DISCOUNT TABLE RLS POLICIES
-- ===============================================
-- Security Model: BOX-ISOLATED DISCOUNT MANAGEMENT
-- - Discounts are isolated per box
-- - Only box staff except coaches can see discount information
-- - Any box staff except coaches can create/edit discounts
-- - Active vs inactive visibility differences (active visible, management sees all)
-- - Financial sensitivity - restricted similar to payment data
-- - No special usage tracking considerations for now
-- ===============================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "discount_management_staff_active" ON "Discount";
DROP POLICY IF EXISTS "discount_management_staff_all" ON "Discount";
DROP POLICY IF EXISTS "discount_management_staff_insert" ON "Discount";
DROP POLICY IF EXISTS "discount_management_staff_update" ON "Discount";

-- Enable RLS on Discount table
ALTER TABLE "Discount" ENABLE ROW LEVEL SECURITY;

-- Policy 1: Box management staff can see active discounts in their boxes
CREATE POLICY "discount_management_staff_active"
ON "Discount"
FOR SELECT
TO authenticated
USING (
    is_active = true
    AND (
        -- Super admin can see all active discounts
        is_super_admin()
        OR
        -- Box staff except coaches can see active discounts in their boxes
        EXISTS (
            SELECT 1
            FROM "Box_Staff" bs
            WHERE bs.user_id = auth.uid()
            AND bs.box_id = "Discount".box_id
            AND bs.role IN ('admin', 'receptionist', 'super_admin')  -- Explicitly exclude coaches
            AND (bs.end_date IS NULL OR bs.end_date >= CURRENT_DATE)
        )
    )
);

-- Policy 2: Management staff can see all discounts (active/inactive) in their boxes
CREATE POLICY "discount_management_staff_all"
ON "Discount"
FOR SELECT
TO authenticated
USING (
    -- Super admin can see all discounts
    is_super_admin()
    OR
    -- Box management staff (admin, receptionist) can see all discounts in their boxes
    EXISTS (
        SELECT 1
        FROM "Box_Staff" bs
        WHERE bs.user_id = auth.uid()
        AND bs.box_id = "Discount".box_id
        AND bs.role IN ('admin', 'receptionist', 'super_admin')  -- Explicitly exclude coaches
        AND (bs.end_date IS NULL OR bs.end_date >= CURRENT_DATE)
    )
);

-- Policy 3: Box staff except coaches can create discounts
CREATE POLICY "discount_management_staff_insert"
ON "Discount"
FOR INSERT
TO authenticated
WITH CHECK (
    -- Super admin can create discounts in any box
    is_super_admin()
    OR
    -- Box staff except coaches can create discounts in their boxes
    EXISTS (
        SELECT 1
        FROM "Box_Staff" bs
        WHERE bs.user_id = auth.uid()
        AND bs.box_id = "Discount".box_id
        AND bs.role IN ('admin', 'receptionist', 'super_admin')  -- Explicitly exclude coaches
        AND (bs.end_date IS NULL OR bs.end_date >= CURRENT_DATE)
    )
);

-- Policy 4: Box staff except coaches can update discounts
CREATE POLICY "discount_management_staff_update"
ON "Discount"
FOR UPDATE
TO authenticated
USING (
    -- Super admin has full update access
    is_super_admin()
    OR
    -- Box staff except coaches can update discounts in their boxes
    EXISTS (
        SELECT 1
        FROM "Box_Staff" bs
        WHERE bs.user_id = auth.uid()
        AND bs.box_id = "Discount".box_id
        AND bs.role IN ('admin', 'receptionist', 'super_admin')  -- Explicitly exclude coaches
        AND (bs.end_date IS NULL OR bs.end_date >= CURRENT_DATE)
    )
)
WITH CHECK (
    -- Super admin can update anything
    is_super_admin()
    OR
    -- Box staff except coaches can update discounts in their boxes
    EXISTS (
        SELECT 1
        FROM "Box_Staff" bs
        WHERE bs.user_id = auth.uid()
        AND bs.box_id = "Discount".box_id
        AND bs.role IN ('admin', 'receptionist', 'super_admin')  -- Explicitly exclude coaches
        AND (bs.end_date IS NULL OR bs.end_date >= CURRENT_DATE)
    )
);

-- Policy 5: No DELETE policy (discounts should be deactivated, not deleted)
-- Use is_active = false for discount deactivation

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Discount RLS policies created successfully!';
    RAISE NOTICE 'Policies: management_staff_active, management_staff_all, management_staff_insert, management_staff_update';
    RAISE NOTICE 'BOX ISOLATION: Discounts isolated per box';
    RAISE NOTICE 'STAFF ONLY: Only box staff except coaches can see discounts';
    RAISE NOTICE 'COACH RESTRICTION: Coaches explicitly excluded from discount access';
    RAISE NOTICE 'ACTIVE FILTER: Regular staff see active, management sees all';
    RAISE NOTICE 'FINANCIAL SECURITY: Restricted access similar to payment data';
END $$;