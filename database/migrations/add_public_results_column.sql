-- Migration: Add public_results column to User_detail table
-- Description: Adds boolean column to control visibility of user results and PRs

BEGIN;

-- Add the public_results column with default value true (public by default)
ALTER TABLE "User_detail" 
ADD COLUMN "public_results" BOOLEAN NOT NULL DEFAULT true;

-- Add index for potential queries filtering by public_results
CREATE INDEX "User_detail_public_results_idx" ON "User_detail" ("public_results");

-- Add comment to explain the column purpose
COMMENT ON COLUMN "User_detail"."public_results" IS 'Controls whether user workout results and PRs are publicly visible (true = public, false = private)';

COMMIT;