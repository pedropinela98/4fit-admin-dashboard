-- ===============================================
-- WEIGHT_HISTORY TABLE RLS POLICIES
-- ===============================================
-- Security Model:
-- - HIGHLY SENSITIVE DATA - Only user can see their own weight history
-- - No staff access, no public visibility, completely private
-- - Users can INSERT their own weight records
-- - System manages history via triggers
-- - No UPDATE/DELETE allowed (historical data immutable)
-- ===============================================

SET search_path TO public;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "weight_history_own_access" ON "Weight_History";
DROP POLICY IF EXISTS "weight_history_own_insert" ON "Weight_History";

-- Enable RLS on Weight_History table
ALTER TABLE "Weight_History" ENABLE ROW LEVEL SECURITY;

-- Policy 1: Users can ONLY read their own weight history
CREATE POLICY "weight_history_own_access"
ON "Weight_History"
FOR SELECT
TO authenticated
USING (
    user_id = auth.uid()
);

-- Policy 2: Users can insert their own weight records
CREATE POLICY "weight_history_own_insert"
ON "Weight_History"
FOR INSERT
TO authenticated
WITH CHECK (
    user_id = auth.uid()
    -- Additional validation: user should be member of at least one box
    AND EXISTS (
        SELECT 1
        FROM "Box_Member" bm
        WHERE bm.user_id = auth.uid()
        AND bm.deleted_at IS NULL
    )
);

-- Policy 3: No UPDATE allowed (historical data is immutable)
-- Weight history records cannot be modified once created

-- Policy 4: No DELETE allowed (historical data is permanent)
-- Weight history should be preserved for user's tracking

-- Policy 5: No staff access, no public access
-- Weight data is completely private to the individual user

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Weight_History RLS policies created successfully!';
    RAISE NOTICE 'Policies: own_access, own_insert';
    RAISE NOTICE 'HIGHLY SENSITIVE: Only users can see their own weight history';
    RAISE NOTICE 'No staff access, no public visibility, completely private';
END $$;