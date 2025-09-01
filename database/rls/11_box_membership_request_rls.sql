-- ===============================================
-- BOX_MEMBERSHIP_REQUEST TABLE RLS POLICIES
-- ===============================================
-- Security Model:
-- - Users can read their own membership requests
-- - All staff EXCEPT coaches can see requests for their boxes
-- - All staff EXCEPT coaches can process (approve/reject) requests
-- - Users can cancel their own pending requests
-- - One request per user per box at a time
-- - Processed requests hidden from regular users, visible to admin+ for audit
-- ===============================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "membership_request_own_read" ON "Box_Membership_Request";
DROP POLICY IF EXISTS "membership_request_non_coach_staff_read" ON "Box_Membership_Request";
DROP POLICY IF EXISTS "membership_request_admin_audit_read" ON "Box_Membership_Request";
DROP POLICY IF EXISTS "membership_request_own_insert" ON "Box_Membership_Request";
DROP POLICY IF EXISTS "membership_request_own_cancel" ON "Box_Membership_Request";
DROP POLICY IF EXISTS "membership_request_non_coach_staff_update" ON "Box_Membership_Request";

-- Enable RLS on Box_Membership_Request table
ALTER TABLE "Box_Membership_Request" ENABLE ROW LEVEL SECURITY;

-- Policy 1: Users can read their own membership requests
CREATE POLICY "membership_request_own_read"
ON "Box_Membership_Request"
FOR SELECT
TO authenticated
USING (
    user_id = auth.uid()
    AND (
        -- Users can see their pending requests
        status = 'pending'
        OR
        -- Users can see their cancelled requests
        status = 'cancelled'
    )
);

-- Policy 2: Non-coach staff can see requests for their boxes
CREATE POLICY "membership_request_non_coach_staff_read"
ON "Box_Membership_Request"
FOR SELECT
TO authenticated
USING (
    user_id != auth.uid()  -- Not their own requests (covered by policy 1)
    AND (
        -- Super admin can see all requests
        is_super_admin()
        OR
        -- Box staff (except coaches) can see requests for their boxes
        EXISTS (
            SELECT 1
            FROM "Box_Staff" bs
            WHERE bs.user_id = auth.uid()
            AND bs.box_id = "Box_Membership_Request".box_id
            AND bs.role IN ('admin', 'receptionist', 'super_admin')  -- Exclude coaches
            AND (bs.end_date IS NULL OR bs.end_date >= CURRENT_DATE)
        )
    )
);

-- Policy 3: Admin+ staff can see processed requests for audit purposes
CREATE POLICY "membership_request_admin_audit_read"
ON "Box_Membership_Request"
FOR SELECT
TO authenticated
USING (
    user_id != auth.uid()  -- Not their own requests
    AND status IN ('approved', 'rejected')  -- Only processed requests
    AND (
        -- Super admin can see all processed requests
        is_super_admin()
        OR
        -- Box admins can see processed requests for audit
        has_box_staff_access(box_id, 'admin')
    )
);

-- Policy 4: Users can create membership requests (one per box)
CREATE POLICY "membership_request_own_insert"
ON "Box_Membership_Request"
FOR INSERT
TO authenticated
WITH CHECK (
    user_id = auth.uid()
    -- Validation: cannot have multiple pending requests for same box
    AND NOT EXISTS (
        SELECT 1
        FROM "Box_Membership_Request" bmr
        WHERE bmr.user_id = auth.uid()
        AND bmr.box_id = box_id
        AND bmr.status = 'pending'
    )
    -- Note: Users CAN request membership to new boxes even if already members elsewhere
);

-- Policy 5: Users can cancel their own pending requests
CREATE POLICY "membership_request_own_cancel"
ON "Box_Membership_Request"
FOR UPDATE
TO authenticated
USING (
    user_id = auth.uid()
    AND status = 'pending'  -- Can only cancel pending requests
)
WITH CHECK (
    user_id = auth.uid()
    AND status = 'cancelled'  -- Can only change to cancelled status
);

-- Policy 6: Non-coach staff can process (approve/reject) requests
CREATE POLICY "membership_request_non_coach_staff_update"
ON "Box_Membership_Request"
FOR UPDATE
TO authenticated
USING (
    user_id != auth.uid()  -- Not their own requests (covered by policy 5)
    AND status = 'pending'  -- Can only process pending requests
    AND (
        -- Super admin has full processing access
        is_super_admin()
        OR
        -- Non-coach staff can process requests for their boxes
        EXISTS (
            SELECT 1
            FROM "Box_Staff" bs
            WHERE bs.user_id = auth.uid()
            AND bs.box_id = "Box_Membership_Request".box_id
            AND bs.role IN ('admin', 'receptionist', 'super_admin')  -- Exclude coaches
            AND (bs.end_date IS NULL OR bs.end_date >= CURRENT_DATE)
        )
    )
)
WITH CHECK (
    -- Super admin can approve/reject anything
    is_super_admin()
    OR
    -- Non-coach staff can process requests for their boxes
    EXISTS (
        SELECT 1
        FROM "Box_Staff" bs
        WHERE bs.user_id = auth.uid()
        AND bs.box_id = "Box_Membership_Request".box_id
        AND bs.role IN ('admin', 'receptionist', 'super_admin')  -- Exclude coaches
        AND (bs.end_date IS NULL OR bs.end_date >= CURRENT_DATE)
    )
);

-- Policy 7: No DELETE policy (keep all requests for audit trail)
-- Membership requests should be preserved for historical tracking

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Box_Membership_Request RLS policies created successfully!';
    RAISE NOTICE 'Policies: own_read, non_coach_staff_read, admin_audit_read, own_insert, own_cancel, non_coach_staff_update';
    RAISE NOTICE 'COACHES EXCLUDED from viewing/processing membership requests';
    RAISE NOTICE 'Users: see own requests, can cancel pending, one request per box';
    RAISE NOTICE 'Staff (non-coach): can process requests, admins see processed for audit';
END $$;