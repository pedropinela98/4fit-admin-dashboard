-- Migration: Add height and athlete_type columns to User_detail
-- Description: Adds athlete physical attributes and classification fields

BEGIN;

-- ============================================================================
-- 1. CREATE ATHLETE_TYPE ENUM
-- ============================================================================

-- Create the athlete_type enum for Rx vs Scaled classification
CREATE TYPE "athlete_type" AS ENUM ('Rx', 'Scaled');

-- ============================================================================
-- 2. ADD COLUMNS TO USER_DETAIL TABLE
-- ============================================================================

-- Add height column (in centimeters, 0-250 range)
ALTER TABLE "User_detail" 
ADD COLUMN "height" INT;

-- Add athlete_type column (Rx or Scaled)
ALTER TABLE "User_detail" 
ADD COLUMN "athlete_type" athlete_type;

-- ============================================================================
-- 3. ADD CONSTRAINTS
-- ============================================================================

-- Add check constraint for height range (0-250 cm)
ALTER TABLE "User_detail" 
ADD CONSTRAINT "User_detail_height_check" 
CHECK (height IS NULL OR (height >= 0 AND height <= 250));

-- ============================================================================
-- 4. ADD INDEXES (OPTIONAL - FOR ANALYTICS)
-- ============================================================================

-- Index for athlete type queries (useful for statistics)
CREATE INDEX "User_detail_athlete_type_idx" ON "User_detail" ("athlete_type") 
WHERE "athlete_type" IS NOT NULL AND "deleted_at" IS NULL;

-- Index for height range queries (useful for analytics)
CREATE INDEX "User_detail_height_idx" ON "User_detail" ("height") 
WHERE "height" IS NOT NULL AND "deleted_at" IS NULL;

-- ============================================================================
-- 5. ADD COMMENTS FOR DOCUMENTATION
-- ============================================================================

COMMENT ON COLUMN "User_detail"."height" IS 'User height in centimeters (0-250). NULL if not provided.';
COMMENT ON COLUMN "User_detail"."athlete_type" IS 'Athlete classification: Rx (prescribed) or Scaled (modified). NULL if not set.';
COMMENT ON TYPE "athlete_type" IS 'Enum for athlete classification in CrossFit: Rx (doing workouts as prescribed) or Scaled (doing modified versions)';

COMMIT;