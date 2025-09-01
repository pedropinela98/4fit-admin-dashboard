-- ===============================================
-- SESSION_PACK TABLE - ADD VISIBILITY AND ACTIVE COLUMNS
-- ===============================================
-- Add pack_public and is_active columns to Session_Pack table
-- pack_public: Whether packs are visible to non-members (default: true)
-- is_active: Whether pack is available for new purchases (default: true)
-- ===============================================

-- Add pack_public column to Session_Pack table
ALTER TABLE "Session_Pack" ADD COLUMN IF NOT EXISTS "pack_public" BOOLEAN NOT NULL DEFAULT true;

-- Add is_active column to Session_Pack table  
ALTER TABLE "Session_Pack" ADD COLUMN IF NOT EXISTS "is_active" BOOLEAN NOT NULL DEFAULT true;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS "idx_session_pack_is_active" ON "Session_Pack" ("is_active");
CREATE INDEX IF NOT EXISTS "idx_session_pack_pack_public" ON "Session_Pack" ("pack_public");
CREATE INDEX IF NOT EXISTS "idx_session_pack_box_id_active" ON "Session_Pack" ("box_id", "is_active");

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Session_Pack table updated with visibility and active columns!';
    RAISE NOTICE 'pack_public: Controls visibility to non-members (default: true)';
    RAISE NOTICE 'is_active: Controls availability for new purchases (default: true)';
END $$;