-- Migration: Add color, duration, and room fields to Class_Type table
-- Date: 2025-09-21

BEGIN;

ALTER TABLE "Class_Type"
  ADD COLUMN "color" VARCHAR(16),
  ADD COLUMN "duration" INTEGER,
  ADD COLUMN "room" VARCHAR(100);

COMMIT;
