-- ===============================================
-- BOX TABLE - ADD PAYMENT GRACE PERIOD COLUMN
-- ===============================================
-- Add payment_grace_days column to Box table for membership auto-deactivation
-- Default: 8 days grace period after payment is due
-- Configurable per box by admins
-- ===============================================

-- Add payment_grace_days column to Box table
ALTER TABLE "Box" ADD COLUMN IF NOT EXISTS "payment_grace_days" INT NOT NULL DEFAULT 8;

-- Add check constraint to ensure positive grace days
ALTER TABLE "Box" ADD CONSTRAINT "box_payment_grace_days_positive" 
CHECK (payment_grace_days > 0 AND payment_grace_days <= 30);

-- Create index for performance
CREATE INDEX IF NOT EXISTS "idx_box_payment_grace_days" ON "Box" ("payment_grace_days");

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Box table updated with payment_grace_days column!';
    RAISE NOTICE 'Default: 8 days grace period, configurable per box';
    RAISE NOTICE 'Range: 1-30 days allowed';
END $$;