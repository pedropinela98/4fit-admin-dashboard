-- ===============================================
-- PAYMENT TABLE RLS POLICIES
-- ===============================================
-- Security Model: BOX-ISOLATED PAYMENT RECORDS
-- - Payment records are strictly isolated per box (security requirement)
-- - Users can always see their own payment records
-- - Coaches cannot see payment details (financial restriction)
-- - Super admins, admins, and receptionists can see payment records
-- - Super admins, admins, and receptionists can create/edit payment records
-- - No additional financial restrictions for now
-- ===============================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "payment_own_access" ON "Payment";
DROP POLICY IF EXISTS "payment_management_access" ON "Payment";
DROP POLICY IF EXISTS "payment_management_insert" ON "Payment";
DROP POLICY IF EXISTS "payment_management_update" ON "Payment";

-- Enable RLS on Payment table
ALTER TABLE "Payment" ENABLE ROW LEVEL SECURITY;

-- Policy 1: Users can always see their own payment records
CREATE POLICY "payment_own_access"
ON "Payment"
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Policy 2: Management staff (except coaches) can see payment records in their boxes
CREATE POLICY "payment_management_access"
ON "Payment"
FOR SELECT
TO authenticated
USING (
    -- Super admin can see all payments
    is_super_admin()
    OR
    -- Box management staff (admin, receptionist) can see payments for users in their boxes
    EXISTS (
        SELECT 1
        FROM "Box_Member" bm
        INNER JOIN "Box_Staff" bs ON bs.box_id = bm.box_id
        WHERE bm.user_id = "Payment".user_id
        AND bs.user_id = auth.uid()
        AND bs.role IN ('admin', 'receptionist', 'super_admin')  -- Explicitly exclude coaches
        AND bm.deleted_at IS NULL
        AND (bs.end_date IS NULL OR bs.end_date >= CURRENT_DATE)
    )
);

-- Policy 3: Management staff can create payment records
CREATE POLICY "payment_management_insert"
ON "Payment"
FOR INSERT
TO authenticated
WITH CHECK (
    -- Super admin can create payments for any user
    is_super_admin()
    OR
    -- Box management staff (admin, receptionist) can create payments for users in their boxes
    EXISTS (
        SELECT 1
        FROM "Box_Member" bm
        INNER JOIN "Box_Staff" bs ON bs.box_id = bm.box_id
        WHERE bm.user_id = "Payment".user_id
        AND bs.user_id = auth.uid()
        AND bs.role IN ('admin', 'receptionist', 'super_admin')  -- Explicitly exclude coaches
        AND bm.deleted_at IS NULL
        AND (bs.end_date IS NULL OR bs.end_date >= CURRENT_DATE)
    )
);

-- Policy 4: Management staff can update payment records
CREATE POLICY "payment_management_update"
ON "Payment"
FOR UPDATE
TO authenticated
USING (
    -- Super admin has full update access
    is_super_admin()
    OR
    -- Box management staff (admin, receptionist) can update payments for users in their boxes
    EXISTS (
        SELECT 1
        FROM "Box_Member" bm
        INNER JOIN "Box_Staff" bs ON bs.box_id = bm.box_id
        WHERE bm.user_id = "Payment".user_id
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
    -- Box management staff (admin, receptionist) can update payments for users in their boxes
    EXISTS (
        SELECT 1
        FROM "Box_Member" bm
        INNER JOIN "Box_Staff" bs ON bs.box_id = bm.box_id
        WHERE bm.user_id = "Payment".user_id
        AND bs.user_id = auth.uid()
        AND bs.role IN ('admin', 'receptionist', 'super_admin')  -- Explicitly exclude coaches
        AND bm.deleted_at IS NULL
        AND (bs.end_date IS NULL OR bs.end_date >= CURRENT_DATE)
    )
);

-- Policy 5: No DELETE policy (payment records should be preserved for audit trail)
-- Consider using a soft delete pattern or status field if needed

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Payment RLS policies created successfully!';
    RAISE NOTICE 'Policies: own_access, management_access, management_insert, management_update';
    RAISE NOTICE 'BOX ISOLATION: Payment records strictly isolated per box (security)';
    RAISE NOTICE 'OWN ACCESS: Users always see their own payment records';
    RAISE NOTICE 'COACH RESTRICTION: Coaches explicitly excluded from payment access';
    RAISE NOTICE 'MANAGEMENT: Super admins, admins, and receptionists can manage payments';
    RAISE NOTICE 'AUDIT TRAIL: No delete policy - payments preserved for history';
END $$;