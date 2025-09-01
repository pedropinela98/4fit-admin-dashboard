-- ===============================================
-- APPLIED_DISCOUNT TABLE RLS POLICIES
-- ===============================================
-- Security Model: FINANCIAL TRACKING WITH USER ACCESS
-- - Follows similar access patterns as Discount (staff except coaches)
-- - Users can see their own applied discounts
-- - Box isolation inherited through relationships
-- - Staff only except coaches can create/edit applied discount records
-- - Applied discount visibility follows payment/discount restrictions
-- - No special audit requirements for tracking discount usage
-- ===============================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "applied_discount_own_access" ON "Applied_Discount";
DROP POLICY IF EXISTS "applied_discount_staff_access" ON "Applied_Discount";
DROP POLICY IF EXISTS "applied_discount_staff_insert" ON "Applied_Discount";
DROP POLICY IF EXISTS "applied_discount_staff_update" ON "Applied_Discount";

-- Enable RLS on Applied_Discount table
ALTER TABLE "Applied_Discount" ENABLE ROW LEVEL SECURITY;

-- Policy 1: Users can see their own applied discounts
CREATE POLICY "applied_discount_own_access"
ON "Applied_Discount"
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Policy 2: Staff except coaches can see applied discounts for users in their boxes
CREATE POLICY "applied_discount_staff_access"
ON "Applied_Discount"
FOR SELECT
TO authenticated
USING (
    -- Super admin can see all applied discounts
    is_super_admin()
    OR
    -- Box staff except coaches can see applied discounts for users in their boxes
    EXISTS (
        SELECT 1
        FROM "Box_Member" bm
        INNER JOIN "Box_Staff" bs ON bs.box_id = bm.box_id
        WHERE bm.user_id = "Applied_Discount".user_id
        AND bs.user_id = auth.uid()
        AND bs.role IN ('admin', 'receptionist', 'super_admin')  -- Explicitly exclude coaches
        AND bm.deleted_at IS NULL
        AND (bs.end_date IS NULL OR bs.end_date >= CURRENT_DATE)
    )
);

-- Policy 3: Staff except coaches can create applied discount records
CREATE POLICY "applied_discount_staff_insert"
ON "Applied_Discount"
FOR INSERT
TO authenticated
WITH CHECK (
    -- Super admin can create applied discounts for any user
    is_super_admin()
    OR
    -- Box staff except coaches can create applied discounts for users in their boxes
    EXISTS (
        SELECT 1
        FROM "Box_Member" bm
        INNER JOIN "Box_Staff" bs ON bs.box_id = bm.box_id
        WHERE bm.user_id = "Applied_Discount".user_id
        AND bs.user_id = auth.uid()
        AND bs.role IN ('admin', 'receptionist', 'super_admin')  -- Explicitly exclude coaches
        AND bm.deleted_at IS NULL
        AND (bs.end_date IS NULL OR bs.end_date >= CURRENT_DATE)
    )
);

-- Policy 4: Staff except coaches can update applied discount records
CREATE POLICY "applied_discount_staff_update"
ON "Applied_Discount"
FOR UPDATE
TO authenticated
USING (
    -- Super admin has full update access
    is_super_admin()
    OR
    -- Box staff except coaches can update applied discounts for users in their boxes
    EXISTS (
        SELECT 1
        FROM "Box_Member" bm
        INNER JOIN "Box_Staff" bs ON bs.box_id = bm.box_id
        WHERE bm.user_id = "Applied_Discount".user_id
        AND bs.user_id = auth.uid()
        AND bs.role IN ('admin', 'receptionist', 'super_admin')  -- Explicitly exclude coaches
        AND bm.deleted_at IS NULL
        AND (bs.end_date IS NULL OR bs.end_date >= CURRENT_DATE)
    )
)
WITH CHECK (
    -- Super admin can update anything
    is_super_admin()
    OR
    -- Box staff except coaches can update applied discounts for users in their boxes
    EXISTS (
        SELECT 1
        FROM "Box_Member" bm
        INNER JOIN "Box_Staff" bs ON bs.box_id = bm.box_id
        WHERE bm.user_id = "Applied_Discount".user_id
        AND bs.user_id = auth.uid()
        AND bs.role IN ('admin', 'receptionist', 'super_admin')  -- Explicitly exclude coaches
        AND bm.deleted_at IS NULL
        AND (bs.end_date IS NULL OR bs.end_date >= CURRENT_DATE)
    )
);

-- Policy 5: No DELETE policy (applied discounts should be preserved for audit trail)
-- Consider using a soft delete pattern or status field if needed

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Applied_Discount RLS policies created successfully!';
    RAISE NOTICE 'Policies: own_access, staff_access, staff_insert, staff_update';
    RAISE NOTICE 'OWN ACCESS: Users can see their own applied discounts';
    RAISE NOTICE 'BOX ISOLATION: Inherits box isolation through user relationships';
    RAISE NOTICE 'COACH RESTRICTION: Coaches explicitly excluded from applied discount access';
    RAISE NOTICE 'STAFF MANAGEMENT: Only staff except coaches can create/edit records';
    RAISE NOTICE 'FINANCIAL SECURITY: Follows payment/discount restriction patterns';
END $$;