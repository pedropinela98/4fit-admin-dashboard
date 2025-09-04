-- ===============================================
-- BOX_MEMBER TABLE RLS POLICIES
-- ===============================================
-- Security Model:
-- - Everyone in the same box can see basic member info (user_id, joined_at)
-- - Only box STAFF can see sensitive details (seguro_validade, notes)
-- - Super admins, admins, receptionists can add/remove members
-- - Soft-deleted members only visible to super admins
-- - Box admins cannot see soft-deleted members
-- ===============================================

SET search_path TO public;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "box_member_basic_info_read" ON "Box_Member";
DROP POLICY IF EXISTS "box_member_staff_sensitive_read" ON "Box_Member";
DROP POLICY IF EXISTS "box_member_super_admin_deleted_read" ON "Box_Member";
DROP POLICY IF EXISTS "box_member_management_insert" ON "Box_Member";
DROP POLICY IF EXISTS "box_member_management_update" ON "Box_Member";

-- Enable RLS on Box_Member table
ALTER TABLE "Box_Member" ENABLE ROW LEVEL SECURITY;

-- Policy 1: Everyone in the box can see basic member info (non-deleted only)
CREATE POLICY "box_member_basic_info_read"
ON "Box_Member"
FOR SELECT
TO authenticated
USING (
    deleted_at IS NULL  -- Only active members
    AND (
        -- Box members can see other members in same box
        is_box_member(box_id)
        OR
        -- Box staff can see members in their boxes
        EXISTS (
            SELECT 1
            FROM "Box_Staff" bs
            WHERE bs.user_id = auth.uid()
            AND bs.box_id = "Box_Member".box_id
            AND (bs.end_date IS NULL OR bs.end_date >= CURRENT_DATE)
        )
    )
);

-- Policy 2: Only super admins can see soft-deleted members
CREATE POLICY "box_member_super_admin_deleted_read"
ON "Box_Member"
FOR SELECT
TO authenticated
USING (
    deleted_at IS NOT NULL  -- Only deleted members
    AND is_super_admin()
);

-- Policy 3: Management staff can insert new members
CREATE POLICY "box_member_management_insert"
ON "Box_Member"
FOR INSERT
TO authenticated
WITH CHECK (
    -- Super admin can add members to any box
    is_super_admin()
    OR
    -- Box admins and receptionists can add members to their boxes
    has_box_staff_access(box_id, 'receptionist')
);

-- Policy 4: Management staff can update member records (including soft delete)
CREATE POLICY "box_member_management_update"
ON "Box_Member"
FOR UPDATE
TO authenticated
USING (
    -- Super admin has full update access
    is_super_admin()
    OR
    -- Box admins and receptionists can update members in their boxes
    (has_box_staff_access(box_id, 'receptionist') AND deleted_at IS NULL)
)
WITH CHECK (
    -- Super admin can update anything
    is_super_admin()
    OR
    -- Box admins and receptionists can update members in their boxes
    has_box_staff_access(box_id, 'receptionist')
);

-- Policy 5: No DELETE policy (use soft delete with deleted_at)
-- Physical deletion not allowed, use deleted_at field

-- Note: For sensitive fields (seguro_validade, notes), application layer should:
-- 1. Check if current user is staff using has_box_staff_access() function
-- 2. Only return sensitive fields to staff members
-- 3. Return NULL or exclude these fields for regular members

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Box_Member RLS policies created successfully!';
    RAISE NOTICE 'Policies: basic_info_read, super_admin_deleted_read, management_insert, management_update';
    RAISE NOTICE 'Everyone in box sees basic member info, only staff see sensitive details';
    RAISE NOTICE 'Management roles: super_admin, admin, receptionist';
    RAISE NOTICE 'IMPORTANT: Application must filter sensitive fields (seguro_validade, notes) for non-staff';
END $$;