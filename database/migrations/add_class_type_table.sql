-- Migration: Add Class_Type table and update Class table structure
-- Description: Replaces VARCHAR type column with Class_Type table for customizable class types per box

BEGIN;

-- ============================================================================
-- 1. CREATE CLASS_TYPE TABLE
-- ============================================================================

-- Create the Class_Type table for customizable class types per box
CREATE TABLE "Class_Type" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "box_id" UUID NOT NULL,
  "name" VARCHAR(100) NOT NULL,
  "description" TEXT,
  "active" BOOLEAN NOT NULL DEFAULT true,
  "created_at" TIMESTAMP NOT NULL DEFAULT (now()),
  "updated_at" TIMESTAMP NOT NULL DEFAULT (now()),
  UNIQUE(box_id, name)
);

-- ============================================================================
-- 2. ADD INDEXES FOR PERFORMANCE
-- ============================================================================

-- Index for box's class types
CREATE INDEX "Class_Type_box_idx" ON "Class_Type" ("box_id");

-- Index for active class types per box
CREATE INDEX "Class_Type_box_active_idx" ON "Class_Type" ("box_id", "active");

-- ============================================================================
-- 3. ADD FOREIGN KEY CONSTRAINTS
-- ============================================================================

-- Foreign key to Box (cascade delete when box is deleted)
ALTER TABLE "Class_Type" 
ADD CONSTRAINT "Class_Type_box_id_fkey" 
FOREIGN KEY ("box_id") REFERENCES "Box" ("id") 
ON DELETE CASCADE ON UPDATE NO ACTION;

-- ============================================================================
-- 4. UPDATE CLASS TABLE STRUCTURE
-- ============================================================================

-- Add new class_type_id column (nullable for now during migration)
ALTER TABLE "Class" ADD COLUMN "class_type_id" UUID;

-- Add foreign key constraint (restrict delete if classes exist)
ALTER TABLE "Class" 
ADD CONSTRAINT "Class_class_type_id_fkey" 
FOREIGN KEY ("class_type_id") REFERENCES "Class_Type" ("id") 
ON DELETE RESTRICT ON UPDATE NO ACTION;

-- ============================================================================
-- 5. MIGRATE EXISTING CLASS TYPES
-- ============================================================================

-- Create default class types for existing boxes based on current Class.type values
INSERT INTO "Class_Type" (box_id, name, description)
SELECT DISTINCT 
    c.box_id, 
    c.type as name,
    'Migrated from existing class type' as description
FROM "Class" c
WHERE c.type IS NOT NULL
ON CONFLICT (box_id, name) DO NOTHING;

-- Update existing classes to reference the new Class_Type records
UPDATE "Class" 
SET class_type_id = ct.id
FROM "Class_Type" ct
WHERE "Class".box_id = ct.box_id 
AND "Class".type = ct.name;

-- ============================================================================
-- 6. FINALIZE CLASS TABLE STRUCTURE
-- ============================================================================

-- Make class_type_id NOT NULL now that all records are migrated
ALTER TABLE "Class" ALTER COLUMN "class_type_id" SET NOT NULL;

-- Drop the old type column
ALTER TABLE "Class" DROP COLUMN "type";

-- ============================================================================
-- 7. ADD COMMENTS FOR DOCUMENTATION
-- ============================================================================

COMMENT ON TABLE "Class_Type" IS 'Customizable class types per box for flexible categorization';
COMMENT ON COLUMN "Class_Type"."box_id" IS 'Reference to the box that owns this class type';
COMMENT ON COLUMN "Class_Type"."name" IS 'Name of the class type (unique per box)';
COMMENT ON COLUMN "Class_Type"."description" IS 'Optional description of the class type';
COMMENT ON COLUMN "Class_Type"."active" IS 'Whether this class type is available for new classes';

COMMIT;

-- ============================================================================
-- USAGE EXAMPLES (commented out - uncomment to test)
-- ============================================================================

-- View all class types for a specific box
-- SELECT 
--     ct.name,
--     ct.description,
--     ct.active,
--     COUNT(c.id) as class_count
-- FROM "Class_Type" ct
-- LEFT JOIN "Class" c ON ct.id = c.class_type_id AND c.deleted_at IS NULL
-- JOIN "Box" b ON ct.box_id = b.id
-- WHERE b.name = 'CrossFit Test Box'
-- GROUP BY ct.id, ct.name, ct.description, ct.active
-- ORDER BY ct.name;

-- View classes with their types
-- SELECT 
--     c.datetime,
--     ct.name as class_type,
--     c.max_capacity,
--     b.name as box_name
-- FROM "Class" c
-- JOIN "Class_Type" ct ON c.class_type_id = ct.id
-- JOIN "Box" b ON c.box_id = b.id
-- WHERE c.deleted_at IS NULL
-- ORDER BY c.datetime;