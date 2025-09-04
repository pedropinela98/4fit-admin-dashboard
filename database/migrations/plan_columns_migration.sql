-- ===============================================
-- PLAN TABLE - ADD VISIBILITY AND ACTIVE COLUMNS
-- ===============================================
-- Add plans_public and is_active columns to Plan table
-- plans_public: Whether plans are visible to non-members (default: true)
-- is_active: Whether plan is available for new signups (default: true)
-- ===============================================

-- Add plans_public column to Plan table
ALTER TABLE "Plan" ADD COLUMN IF NOT EXISTS "plans_public" BOOLEAN NOT NULL DEFAULT true;

-- Add is_active column to Plan table  
ALTER TABLE "Plan" ADD COLUMN IF NOT EXISTS "is_active" BOOLEAN NOT NULL DEFAULT true;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS "idx_plan_is_active" ON "Plan" ("is_active");
CREATE INDEX IF NOT EXISTS "idx_plan_plans_public" ON "Plan" ("plans_public");
CREATE INDEX IF NOT EXISTS "idx_plan_box_id_active" ON "Plan" ("box_id", "is_active");

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Plan table updated with visibility and active columns!';
    RAISE NOTICE 'plans_public: Controls visibility to non-members (default: true)';
    RAISE NOTICE 'is_active: Controls availability for new signups (default: true)';
END $$;