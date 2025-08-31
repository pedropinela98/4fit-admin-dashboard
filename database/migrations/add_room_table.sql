-- Migration: Add Room table
-- Description: Creates Room table with foreign key relationship to Box table
-- A box can have 1 or more rooms, but one room can only have one box

CREATE TABLE "Room" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "box_id" UUID NOT NULL,
  "name" VARCHAR(100) NOT NULL,
  "description" TEXT,
  "capacity" INT,
  "active" BOOLEAN NOT NULL DEFAULT true,
  "created_at" TIMESTAMP NOT NULL DEFAULT (now()),
  "updated_at" TIMESTAMP NOT NULL DEFAULT (now()),
  CHECK (capacity IS NULL OR capacity > 0)
);

-- Add indexes for better query performance
CREATE INDEX ON "Room" ("box_id");
CREATE INDEX ON "Room" ("box_id", "active");

-- Add foreign key relationship
ALTER TABLE "Room" ADD FOREIGN KEY ("box_id") REFERENCES "Box" ("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- Add trigger for automatic updated_at timestamp updates
CREATE TRIGGER trigger_room_updated_at
    BEFORE UPDATE ON "Room"
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();