-- ===============================================
-- REMOVE PUBLIC COLUMNS MIGRATION
-- ===============================================
-- Removes the "public" columns from PR and Workout_Result tables
-- These columns are no longer needed as we use User_detail.public_results instead
-- ===============================================

-- Drop the public column from PR table
ALTER TABLE "PR" DROP COLUMN IF EXISTS "public";

-- Drop the public column from Workout_Result table  
ALTER TABLE "Workout_Result" DROP COLUMN IF EXISTS "public";

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Public columns removed successfully from PR and Workout_Result tables!';
    RAISE NOTICE 'These columns are replaced by User_detail.public_results for centralized control';
    RAISE NOTICE 'RLS policies have been updated to use User_detail.public_results instead';
END $$;