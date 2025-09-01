-- ===============================================
-- ANNOUNCEMENT TABLE RLS POLICIES
-- ===============================================
-- Security Model:
-- - Box members see announcements AFTER send_date (non-deleted only)
-- - Box staff see all announcements (including pre-send_date, non-deleted)
-- - Management staff (admin, receptionist) can create/edit announcements
-- - Super admins have full access including soft-deleted announcements
-- - Time-based visibility: members only see after send_date
-- ===============================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "announcement_members_after_send_date" ON "Announcement";
DROP POLICY IF EXISTS "announcement_staff_all_active" ON "Announcement";
DROP POLICY IF EXISTS "announcement_management_deleted_read" ON "Announcement";
DROP POLICY IF EXISTS "announcement_management_insert" ON "Announcement";
DROP POLICY IF EXISTS "announcement_management_update" ON "Announcement";

-- Enable RLS on Announcement table
ALTER TABLE "Announcement" ENABLE ROW LEVEL SECURITY;

-- Policy 1: Box members see announcements AFTER send_date (non-deleted only)
CREATE POLICY "announcement_members_after_send_date"
ON "Announcement"
FOR SELECT
TO authenticated
USING (
    deleted_at IS NULL  -- Only non-deleted announcements
    AND send_date <= NOW()  -- Only after send_date
    AND (
        -- Box members can see announcements in their boxes
        is_box_member(box_id)
        -- Note: Staff access is covered by separate policy to avoid overlap
        AND NOT EXISTS (
            SELECT 1
            FROM "Box_Staff" bs
            WHERE bs.user_id = auth.uid()
            AND bs.box_id = "Announcement".box_id
            AND (bs.end_date IS NULL OR bs.end_date >= CURRENT_DATE)
        )
    )
);

-- Policy 2: Box staff see all active announcements (including pre-send_date)
CREATE POLICY "announcement_staff_all_active"
ON "Announcement"
FOR SELECT
TO authenticated
USING (
    deleted_at IS NULL  -- Only non-deleted announcements
    AND (
        -- Super admin can see all active announcements
        is_super_admin()
        OR
        -- Box staff can see all announcements in their boxes (no time restriction)
        EXISTS (
            SELECT 1
            FROM "Box_Staff" bs
            WHERE bs.user_id = auth.uid()
            AND bs.box_id = "Announcement".box_id
            AND (bs.end_date IS NULL OR bs.end_date >= CURRENT_DATE)
        )
    )
);

-- Policy 3: Management staff can see soft-deleted announcements
CREATE POLICY "announcement_management_deleted_read"
ON "Announcement"
FOR SELECT
TO authenticated
USING (
    deleted_at IS NOT NULL  -- Only deleted announcements
    AND (
        -- Super admin can see all deleted announcements
        is_super_admin()
        OR
        -- Box admins and receptionists can see deleted announcements in their boxes
        EXISTS (
            SELECT 1
            FROM "Box_Staff" bs
            WHERE bs.user_id = auth.uid()
            AND bs.box_id = "Announcement".box_id
            AND bs.role IN ('admin', 'receptionist', 'super_admin')
            AND (bs.end_date IS NULL OR bs.end_date >= CURRENT_DATE)
        )
    )
);

-- Policy 4: Management staff can create announcements
CREATE POLICY "announcement_management_insert"
ON "Announcement"
FOR INSERT
TO authenticated
WITH CHECK (
    admin_id = auth.uid()  -- Must be the creator
    AND (
        -- Super admin can create announcements in any box
        is_super_admin()
        OR
        -- Box admins and receptionists can create announcements in their boxes
        EXISTS (
            SELECT 1
            FROM "Box_Staff" bs
            WHERE bs.user_id = auth.uid()
            AND bs.box_id = box_id
            AND bs.role IN ('admin', 'receptionist', 'super_admin')
            AND (bs.end_date IS NULL OR bs.end_date >= CURRENT_DATE)
        )
    )
);

-- Policy 5: Management staff can update announcements (even after send_date)
CREATE POLICY "announcement_management_update"
ON "Announcement"
FOR UPDATE
TO authenticated
USING (
    -- Super admin has full update access
    is_super_admin()
    OR
    -- Box admins and receptionists can update announcements in their boxes
    EXISTS (
        SELECT 1
        FROM "Box_Staff" bs
        WHERE bs.user_id = auth.uid()
        AND bs.box_id = "Announcement".box_id
        AND bs.role IN ('admin', 'receptionist', 'super_admin')
        AND (bs.end_date IS NULL OR bs.end_date >= CURRENT_DATE)
    )
)
WITH CHECK (
    -- Super admin can update anything
    is_super_admin()
    OR
    -- Box admins and receptionists can update announcements in their boxes
    EXISTS (
        SELECT 1
        FROM "Box_Staff" bs
        WHERE bs.user_id = auth.uid()
        AND bs.box_id = "Announcement".box_id
        AND bs.role IN ('admin', 'receptionist', 'super_admin')
        AND (bs.end_date IS NULL OR bs.end_date >= CURRENT_DATE)
    )
);

-- Policy 6: No DELETE policy (use soft delete with deleted_at)
-- Announcements should be preserved for audit purposes

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Announcement RLS policies created successfully!';
    RAISE NOTICE 'Policies: members_after_send_date, staff_all_active, management_deleted_read, management_insert, management_update';
    RAISE NOTICE 'TIME-BASED: Members see announcements only after send_date';
    RAISE NOTICE 'STAFF: See all active announcements (no time restriction)';
    RAISE NOTICE 'MANAGEMENT: admin/receptionist can create/edit, see deleted';
END $$;