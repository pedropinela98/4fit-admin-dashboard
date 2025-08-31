-- Migration: Add room_id to Class table
-- Description: Adds room_id foreign key to Class table so every class is assigned to a specific room
-- This migration assumes that Room table already exists and has at least one room per box

-- Step 1: Add the room_id column as nullable first
ALTER TABLE "Class" ADD COLUMN "room_id" UUID;

-- Step 2: Create a temporary function to assign a default room to existing classes
-- This function will create a default room for each box if none exists, then assign it to classes
DO $$
DECLARE
    box_record RECORD;
    default_room_id UUID;
BEGIN
    -- Loop through each box that has classes but might not have rooms
    FOR box_record IN 
        SELECT DISTINCT c.box_id 
        FROM "Class" c 
        WHERE NOT EXISTS (
            SELECT 1 FROM "Room" r WHERE r.box_id = c.box_id
        )
    LOOP
        -- Create a default room for this box
        INSERT INTO "Room" (id, box_id, name, description, active, created_at, updated_at)
        VALUES (
            gen_random_uuid(),
            box_record.box_id,
            'Main Training Area',
            'Default room created during migration',
            true,
            NOW(),
            NOW()
        )
        RETURNING id INTO default_room_id;
        
        -- Log the creation (optional, can be removed)
        RAISE NOTICE 'Created default room % for box %', default_room_id, box_record.box_id;
    END LOOP;
    
    -- Now assign rooms to all existing classes
    -- For each class, assign the first available room in its box
    UPDATE "Class" 
    SET room_id = (
        SELECT r.id 
        FROM "Room" r 
        WHERE r.box_id = "Class".box_id 
        AND r.active = true
        ORDER BY r.created_at 
        LIMIT 1
    )
    WHERE room_id IS NULL;
    
END $$;

-- Step 3: Make room_id NOT NULL now that all classes have a room assigned
ALTER TABLE "Class" ALTER COLUMN "room_id" SET NOT NULL;

-- Step 4: Add the foreign key constraint
ALTER TABLE "Class" ADD CONSTRAINT "Class_room_id_fkey" 
    FOREIGN KEY ("room_id") REFERENCES "Room" ("id") 
    ON DELETE CASCADE ON UPDATE NO ACTION;

-- Step 5: Add index for better query performance
CREATE INDEX "Class_room_id_idx" ON "Class" ("room_id");