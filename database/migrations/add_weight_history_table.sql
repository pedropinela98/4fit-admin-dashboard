-- Migration: Add Weight_History table for tracking user weight over time
-- Description: Creates Weight_History table to track users' weight progression

BEGIN;

-- ============================================================================
-- 1. CREATE WEIGHT_HISTORY TABLE
-- ============================================================================

-- Create the Weight_History table with composite primary key
CREATE TABLE "Weight_History" (
  "user_id" UUID NOT NULL,
  "weight" DECIMAL(5,2) NOT NULL,
  "notes" TEXT,
  "created_at" TIMESTAMP NOT NULL DEFAULT (now()),
  PRIMARY KEY ("user_id", "weight", "created_at"),
  CHECK (weight >= 30.0 AND weight <= 300.0)
);

-- ============================================================================
-- 2. ADD INDEXES FOR PERFORMANCE
-- ============================================================================

-- Index for user's weight timeline
CREATE INDEX "Weight_History_user_timeline_idx" 
ON "Weight_History" ("user_id", "created_at");

-- ============================================================================
-- 3. ADD FOREIGN KEY CONSTRAINTS
-- ============================================================================

-- Foreign key to User_detail (cascade delete when user is deleted)
ALTER TABLE "Weight_History" 
ADD CONSTRAINT "Weight_History_user_id_fkey" 
FOREIGN KEY ("user_id") REFERENCES "User_detail" ("id") 
ON DELETE CASCADE ON UPDATE NO ACTION;

-- ============================================================================
-- 4. ADD COMMENTS FOR DOCUMENTATION
-- ============================================================================

COMMENT ON TABLE "Weight_History" IS 'Tracks user weight history over time. Composite PK: (user_id, weight, created_at)';
COMMENT ON COLUMN "Weight_History"."user_id" IS 'Reference to the user';
COMMENT ON COLUMN "Weight_History"."weight" IS 'Weight in kilograms (30.0-300.0)';
COMMENT ON COLUMN "Weight_History"."notes" IS 'Optional notes about the weight measurement';
COMMENT ON COLUMN "Weight_History"."created_at" IS 'When the weight was recorded';

COMMIT;

-- ============================================================================
-- USAGE EXAMPLES (commented out - uncomment to test)
-- ============================================================================

-- View a user's weight progression over time
-- SELECT 
--     wh.weight,
--     wh.notes,
--     wh.created_at
-- FROM "Weight_History" wh
-- JOIN "User_detail" u ON wh.user_id = u.id
-- WHERE u.name = 'Pedro Member'
-- ORDER BY wh.created_at DESC;

-- Calculate weight change over time periods
-- WITH weight_changes AS (
--     SELECT 
--         u.name,
--         wh.weight,
--         wh.created_at,
--         LAG(wh.weight) OVER (PARTITION BY wh.user_id ORDER BY wh.created_at) as previous_weight,
--         LAG(wh.created_at) OVER (PARTITION BY wh.user_id ORDER BY wh.created_at) as previous_date
--     FROM "Weight_History" wh
--     JOIN "User_detail" u ON wh.user_id = u.id
-- )
-- SELECT 
--     name,
--     weight,
--     previous_weight,
--     (weight - previous_weight) as weight_change,
--     created_at,
--     previous_date
-- FROM weight_changes
-- WHERE previous_weight IS NOT NULL
-- ORDER BY name, created_at DESC;