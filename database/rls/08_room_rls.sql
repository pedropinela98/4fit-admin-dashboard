-- ===============================================
-- ROOM TABLE RLS POLICIES
-- ===============================================
-- Security Model:
-- - Box members and staff can see active rooms in their boxes
-- - Super admins can see all rooms (active/inactive)
-- - Super admins, box admins, and receptionists can manage rooms
-- - Inactive rooms hidden from regular users (members/coaches)
-- - Room management restricted to box context
-- ===============================================

SET search_path TO public;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "room_box_members_staff_read" ON "Room";
DROP POLICY IF EXISTS "room_super_admin_read_all" ON "Room";
DROP POLICY IF EXISTS "room_management_insert" ON "Room";
DROP POLICY IF EXISTS "room_management_update" ON "Room";

-- Enable RLS on Room table
ALTER TABLE "Room" ENABLE ROW LEVEL SECURITY;

-- Policy 1: Box members and staff can read active rooms in their boxes
CREATE POLICY "room_box_members_staff_read"
ON "Room"
FOR SELECT
TO authenticated
USING (
    active = true
    AND (
        -- Box members can see active rooms
        is_box_member(box_id)
        OR
        -- Box staff can see active rooms
        EXISTS (
            SELECT 1
            FROM "Box_Staff" bs
            WHERE bs.user_id = auth.uid()
            AND bs.box_id = "Room".box_id
            AND (bs.end_date IS NULL OR bs.end_date >= CURRENT_DATE)
        )
    )
);

-- Policy 2: Super admins and management staff can read all rooms (including inactive)
CREATE POLICY "room_super_admin_read_all"
ON "Room"
FOR SELECT
TO authenticated
USING (
    (active = false)  -- Only for inactive rooms (active covered by policy 1)
    AND (
        -- Super admin has full access
        is_super_admin()
        OR
        -- Box admins and receptionists can see inactive rooms in their boxes
        has_box_staff_access(box_id, 'receptionist')
    )
);

-- Policy 3: Management staff can insert new rooms
CREATE POLICY "room_management_insert"
ON "Room"
FOR INSERT
TO authenticated
WITH CHECK (
    -- Super admin can create rooms in any box
    is_super_admin()
    OR
    -- Box admins and receptionists can create rooms in their boxes
    has_box_staff_access(box_id, 'receptionist')
);

-- Policy 4: Management staff can update rooms
CREATE POLICY "room_management_update"
ON "Room"
FOR UPDATE
TO authenticated
USING (
    -- Super admin has full update access
    is_super_admin()
    OR
    -- Box admins and receptionists can update rooms in their boxes
    has_box_staff_access(box_id, 'receptionist')
)
WITH CHECK (
    -- Super admin can update anything
    is_super_admin()
    OR
    -- Box admins and receptionists can update rooms in their boxes
    has_box_staff_access(box_id, 'receptionist')
);

-- Policy 5: No DELETE policy (use active field for soft disable)
-- Rooms should not be physically deleted to preserve historical class data

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Room RLS policies created successfully!';
    RAISE NOTICE 'Policies: box_members_staff_read, super_admin_read_all, management_insert, management_update';
    RAISE NOTICE 'Box members/staff see active rooms, management staff can manage rooms';
    RAISE NOTICE 'Management roles: super_admin, admin, receptionist';
END $$;