-- ===============================================
-- CLASS_WAITLIST TABLE RLS POLICIES
-- ===============================================
-- Security Model: BOX-BASED WAITLIST VISIBILITY
-- - All box members can see who is on waitlists for classes in their box
-- - Users can always see their own waitlist entries
-- - Coaches can see waitlists for all classes in their boxes
-- - All staff roles can see all waitlist data in their boxes
-- - Waitlist positions visible to other members (transparent community)
-- - Only system and super admin can manage waitlist (add/remove entries)
-- ===============================================

SET search_path TO public;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "class_waitlist_box_visibility" ON "Class_Waitlist";
DROP POLICY IF EXISTS "class_waitlist_own_access" ON "Class_Waitlist";
DROP POLICY IF EXISTS "class_waitlist_system_insert" ON "Class_Waitlist";
DROP POLICY IF EXISTS "class_waitlist_system_update" ON "Class_Waitlist";
DROP POLICY IF EXISTS "class_waitlist_system_delete" ON "Class_Waitlist";

-- Enable RLS on Class_Waitlist table
ALTER TABLE "Class_Waitlist" ENABLE ROW LEVEL SECURITY;

-- Policy 1: Box members can see all waitlist records for classes in their boxes
CREATE POLICY "class_waitlist_box_visibility"
ON "Class_Waitlist"
FOR SELECT
TO authenticated
USING (
    -- Super admin can see all waitlists
    is_super_admin()
    OR
    -- Users can see waitlist if they're members or staff of the box where the class takes place
    EXISTS (
        SELECT 1
        FROM "Class" c
        WHERE c.id = "Class_Waitlist".class_id
        AND (
            -- Box members can see waitlist
            is_box_member(c.box_id)
            OR
            -- Box staff can see waitlist
            EXISTS (
                SELECT 1
                FROM "Box_Staff" bs
                WHERE bs.user_id = auth.uid()
                AND bs.box_id = c.box_id
                AND (bs.end_date IS NULL OR bs.end_date >= CURRENT_DATE)
            )
        )
    )
);

-- Policy 2: Users can always see their own waitlist entries
CREATE POLICY "class_waitlist_own_access"
ON "Class_Waitlist"
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Policy 3: Only system and super admin can create waitlist entries
CREATE POLICY "class_waitlist_system_insert"
ON "Class_Waitlist"
FOR INSERT
TO authenticated
WITH CHECK (
    -- Only super admin can manually create waitlist entries
    -- System operations should bypass RLS or use service role
    is_super_admin()
);

-- Policy 4: Only system and super admin can update waitlist entries
CREATE POLICY "class_waitlist_system_update"
ON "Class_Waitlist"
FOR UPDATE
TO authenticated
USING (
    -- Only super admin can manually update waitlist entries
    -- System operations should bypass RLS or use service role
    is_super_admin()
)
WITH CHECK (
    -- Only super admin can manually update waitlist entries
    is_super_admin()
);

-- Policy 5: Only system and super admin can delete waitlist entries
CREATE POLICY "class_waitlist_system_delete"
ON "Class_Waitlist"
FOR DELETE
TO authenticated
USING (
    -- Only super admin can manually delete waitlist entries
    -- System operations should bypass RLS or use service role
    is_super_admin()
);

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Class_Waitlist RLS policies created successfully!';
    RAISE NOTICE 'Policies: box_visibility, own_access, system_insert, system_update, system_delete';
    RAISE NOTICE 'BOX VISIBILITY: All box members see waitlists for classes in their box';
    RAISE NOTICE 'OWN ACCESS: Users always see their own waitlist entries';
    RAISE NOTICE 'NO PRIVACY: Waitlist positions visible to all box members';
    RAISE NOTICE 'SYSTEM MANAGED: Only system and super admin can modify waitlist entries';
    RAISE NOTICE 'NOTE: System operations should use service role to bypass RLS';
END $$;