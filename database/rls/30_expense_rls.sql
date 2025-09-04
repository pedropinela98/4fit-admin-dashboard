-- ===============================================
-- EXPENSE TABLE RLS POLICIES
-- ===============================================
-- Security Model: HIGHLY RESTRICTED BUSINESS FINANCIAL DATA
-- - Expenses are isolated per box like other financial data
-- - Staff only except coaches can see expense records
-- - Coaches have no access (same as payments/discounts)
-- - Super admins, admins, and receptionists can create/edit expense records
-- - Stricter than payment/discount data - only box staff (not coaches) can check expenses
-- - Internal business data that should be highly restricted
-- ===============================================

SET search_path TO public;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "expense_management_staff_only" ON "Expense";
DROP POLICY IF EXISTS "expense_management_staff_insert" ON "Expense";
DROP POLICY IF EXISTS "expense_management_staff_update" ON "Expense";

-- Enable RLS on Expense table
ALTER TABLE "Expense" ENABLE ROW LEVEL SECURITY;

-- Policy 1: Only box staff except coaches can see expense records (stricter than payments)
CREATE POLICY "expense_management_staff_only"
ON "Expense"
FOR SELECT
TO authenticated
USING (
    -- Super admin can see all expenses
    is_super_admin()
    OR
    -- Only box staff except coaches can see expenses in their boxes
    EXISTS (
        SELECT 1
        FROM "Box_Staff" bs
        WHERE bs.user_id = auth.uid()
        AND bs.box_id = "Expense".box_id
        AND bs.role IN ('admin', 'receptionist', 'super_admin')  -- Explicitly exclude coaches
        AND (bs.end_date IS NULL OR bs.end_date >= CURRENT_DATE)
    )
);

-- Policy 2: Management staff can create expense records
CREATE POLICY "expense_management_staff_insert"
ON "Expense"
FOR INSERT
TO authenticated
WITH CHECK (
    -- Super admin can create expenses in any box
    is_super_admin()
    OR
    -- Box staff except coaches can create expenses in their boxes
    EXISTS (
        SELECT 1
        FROM "Box_Staff" bs
        WHERE bs.user_id = auth.uid()
        AND bs.box_id = "Expense".box_id
        AND bs.role IN ('admin', 'receptionist', 'super_admin')  -- Explicitly exclude coaches
        AND (bs.end_date IS NULL OR bs.end_date >= CURRENT_DATE)
    )
);

-- Policy 3: Management staff can update expense records
CREATE POLICY "expense_management_staff_update"
ON "Expense"
FOR UPDATE
TO authenticated
USING (
    -- Super admin has full update access
    is_super_admin()
    OR
    -- Box staff except coaches can update expenses in their boxes
    EXISTS (
        SELECT 1
        FROM "Box_Staff" bs
        WHERE bs.user_id = auth.uid()
        AND bs.box_id = "Expense".box_id
        AND bs.role IN ('admin', 'receptionist', 'super_admin')  -- Explicitly exclude coaches
        AND (bs.end_date IS NULL OR bs.end_date >= CURRENT_DATE)
    )
)
WITH CHECK (
    -- Super admin can update anything
    is_super_admin()
    OR
    -- Box staff except coaches can update expenses in their boxes
    EXISTS (
        SELECT 1
        FROM "Box_Staff" bs
        WHERE bs.user_id = auth.uid()
        AND bs.box_id = "Expense".box_id
        AND bs.role IN ('admin', 'receptionist', 'super_admin')  -- Explicitly exclude coaches
        AND (bs.end_date IS NULL OR bs.end_date >= CURRENT_DATE)
    )
);

-- Policy 4: No DELETE policy (expenses should be preserved for audit trail and tax purposes)
-- Consider using a soft delete pattern or status field if needed

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Expense RLS policies created successfully!';
    RAISE NOTICE 'Policies: management_staff_only, management_staff_insert, management_staff_update';
    RAISE NOTICE 'BOX ISOLATION: Expenses isolated per box (financial security)';
    RAISE NOTICE 'HIGHLY RESTRICTED: Stricter than payment/discount data';
    RAISE NOTICE 'STAFF ONLY: Only box staff except coaches can access expenses';
    RAISE NOTICE 'COACH RESTRICTION: Coaches completely excluded from expense access';
    RAISE NOTICE 'BUSINESS DATA: Internal financial data with highest security level';
    RAISE NOTICE 'AUDIT TRAIL: No delete policy - expenses preserved for tax/audit purposes';
END $$;