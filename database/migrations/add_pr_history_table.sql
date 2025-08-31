-- Migration: Add PR_History table for tracking historical PRs
-- Description: Creates PR_History table with automatic triggers to save old PRs when new ones are achieved

BEGIN;

-- ============================================================================
-- 1. CREATE PR_HISTORY TABLE
-- ============================================================================

-- Create the PR_History table with composite primary key
CREATE TABLE "PR_History" (
  "user_id" UUID NOT NULL,
  "movement_id" UUID NOT NULL,
  "value" INT NOT NULL,
  "unit" movement_unit NOT NULL,
  "achieved_at" TIMESTAMP NOT NULL,
  "created_at" TIMESTAMP NOT NULL DEFAULT (now()),
  PRIMARY KEY ("user_id", "movement_id", "value"),
  CHECK (value > 0)
);

-- ============================================================================
-- 2. ADD INDEXES FOR PERFORMANCE
-- ============================================================================

-- Index for user's PR progression over time
CREATE INDEX "PR_History_user_movement_timeline_idx" 
ON "PR_History" ("user_id", "movement_id", "created_at");

-- Index for user's overall PR history timeline
CREATE INDEX "PR_History_user_timeline_idx" 
ON "PR_History" ("user_id", "created_at");

-- Index for historical leaderboards
CREATE INDEX "PR_History_movement_leaderboard_idx" 
ON "PR_History" ("movement_id", "value", "unit");

-- ============================================================================
-- 3. ADD FOREIGN KEY CONSTRAINTS
-- ============================================================================

-- Foreign key to User_detail (cascade delete when user is deleted)
ALTER TABLE "PR_History" 
ADD CONSTRAINT "PR_History_user_id_fkey" 
FOREIGN KEY ("user_id") REFERENCES "User_detail" ("id") 
ON DELETE CASCADE ON UPDATE NO ACTION;

-- Foreign key to Movement (restrict delete if PR history exists)
ALTER TABLE "PR_History" 
ADD CONSTRAINT "PR_History_movement_id_fkey" 
FOREIGN KEY ("movement_id") REFERENCES "Movement" ("id") 
ON DELETE RESTRICT ON UPDATE NO ACTION;

-- ============================================================================
-- 4. UPDATE EXISTING PR TRIGGER TO SAVE HISTORY
-- ============================================================================

-- Replace the existing update_pr_from_workout_result function to include history saving
CREATE OR REPLACE FUNCTION update_pr_from_workout_result()
RETURNS TRIGGER AS $$
DECLARE
    movement_rec RECORD;
    current_pr RECORD;
    new_pr_value INT;
    pr_unit movement_unit;
BEGIN
    -- Loop through all movements in the workout to check for PRs
    FOR movement_rec IN 
        SELECT DISTINCT wse.movement_id, m.category
        FROM "Workout_Section" ws
        JOIN "Workout_Section_Exercise" wse ON ws.id = wse.section_id
        JOIN "Movement" m ON wse.movement_id = m.id
        WHERE ws.workout_id = NEW.workout_id
    LOOP
        -- Determine PR value and unit based on result type and movement category
        CASE NEW.result_type
            WHEN 'weight' THEN
                new_pr_value := CAST(NEW.value AS INT);
                pr_unit := 'kg';
            WHEN 'reps' THEN
                new_pr_value := CAST(NEW.value AS INT);
                pr_unit := 'reps';
            WHEN 'time' THEN
                -- For time-based results, convert to seconds (assuming value is in format like "12:34" or "45")
                new_pr_value := CASE 
                    WHEN NEW.value ~ '^\d+:\d+$' THEN 
                        CAST(split_part(NEW.value, ':', 1) AS INT) * 60 + CAST(split_part(NEW.value, ':', 2) AS INT)
                    ELSE 
                        CAST(NEW.value AS INT)
                END;
                pr_unit := 'minutes';
            WHEN 'distance' THEN
                new_pr_value := CAST(NEW.value AS INT);
                pr_unit := 'meters';
            ELSE
                CONTINUE; -- Skip unsupported result types
        END CASE;

        -- Check if user has existing PR for this movement
        SELECT * INTO current_pr
        FROM "PR" 
        WHERE user_id = NEW.user_id 
        AND movement_id = movement_rec.movement_id 
        AND unit = pr_unit
        AND deleted_at IS NULL
        ORDER BY value DESC, achieved_at DESC 
        LIMIT 1;

        -- Update or insert PR based on movement category and result type
        IF current_pr IS NULL THEN
            -- No existing PR, insert new one
            INSERT INTO "PR" (id, user_id, movement_id, value, unit, achieved_at, created_at, updated_at)
            VALUES (
                gen_random_uuid(),
                NEW.user_id,
                movement_rec.movement_id,
                new_pr_value,
                pr_unit,
                NEW.date::timestamp,
                NOW(),
                NOW()
            );
        ELSE
            -- Check if new result is better than existing PR
            CASE 
                -- For strength movements (higher weight = better)
                WHEN movement_rec.category = 'weightlifting' AND NEW.result_type = 'weight' AND new_pr_value > current_pr.value THEN
                    -- Save old PR to history
                    INSERT INTO "PR_History" (user_id, movement_id, value, unit, achieved_at, created_at)
                    VALUES (NEW.user_id, movement_rec.movement_id, current_pr.value, current_pr.unit, current_pr.achieved_at, NOW())
                    ON CONFLICT (user_id, movement_id, value) DO NOTHING;
                    
                    -- Update current PR
                    UPDATE "PR" SET 
                        value = new_pr_value,
                        achieved_at = NEW.date::timestamp,
                        updated_at = NOW()
                    WHERE id = current_pr.id;
                
                -- For rep-based movements (higher reps = better)
                WHEN NEW.result_type = 'reps' AND new_pr_value > current_pr.value THEN
                    -- Save old PR to history
                    INSERT INTO "PR_History" (user_id, movement_id, value, unit, achieved_at, created_at)
                    VALUES (NEW.user_id, movement_rec.movement_id, current_pr.value, current_pr.unit, current_pr.achieved_at, NOW())
                    ON CONFLICT (user_id, movement_id, value) DO NOTHING;
                    
                    -- Update current PR
                    UPDATE "PR" SET 
                        value = new_pr_value,
                        achieved_at = NEW.date::timestamp,
                        updated_at = NOW()
                    WHERE id = current_pr.id;
                
                -- For time-based movements (lower time = better)
                WHEN NEW.result_type = 'time' AND new_pr_value < current_pr.value THEN
                    -- Save old PR to history
                    INSERT INTO "PR_History" (user_id, movement_id, value, unit, achieved_at, created_at)
                    VALUES (NEW.user_id, movement_rec.movement_id, current_pr.value, current_pr.unit, current_pr.achieved_at, NOW())
                    ON CONFLICT (user_id, movement_id, value) DO NOTHING;
                    
                    -- Update current PR
                    UPDATE "PR" SET 
                        value = new_pr_value,
                        achieved_at = NEW.date::timestamp,
                        updated_at = NOW()
                    WHERE id = current_pr.id;
                
                -- For distance-based movements (higher distance = better)
                WHEN NEW.result_type = 'distance' AND new_pr_value > current_pr.value THEN
                    -- Save old PR to history
                    INSERT INTO "PR_History" (user_id, movement_id, value, unit, achieved_at, created_at)
                    VALUES (NEW.user_id, movement_rec.movement_id, current_pr.value, current_pr.unit, current_pr.achieved_at, NOW())
                    ON CONFLICT (user_id, movement_id, value) DO NOTHING;
                    
                    -- Update current PR
                    UPDATE "PR" SET 
                        value = new_pr_value,
                        achieved_at = NEW.date::timestamp,
                        updated_at = NOW()
                    WHERE id = current_pr.id;
                
                ELSE
                    -- No improvement, do nothing
                    NULL;
            END CASE;
        END IF;
    END LOOP;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 5. ADD COMMENTS FOR DOCUMENTATION
-- ============================================================================

COMMENT ON TABLE "PR_History" IS 'Stores historical PR values when new PRs are achieved. Composite PK: (user_id, movement_id, value)';
COMMENT ON COLUMN "PR_History"."user_id" IS 'Reference to the user who achieved the historical PR';
COMMENT ON COLUMN "PR_History"."movement_id" IS 'Reference to the movement for the historical PR';
COMMENT ON COLUMN "PR_History"."value" IS 'The historical PR value that was superseded';
COMMENT ON COLUMN "PR_History"."unit" IS 'The unit of measurement for the historical PR value';
COMMENT ON COLUMN "PR_History"."achieved_at" IS 'When the historical PR was originally achieved';
COMMENT ON COLUMN "PR_History"."created_at" IS 'When the historical PR was moved to the history table';

COMMIT;

-- ============================================================================
-- USAGE EXAMPLES (commented out - uncomment to test)
-- ============================================================================

-- View a user's PR progression for a specific movement
-- SELECT 
--     ph.value,
--     ph.unit,
--     ph.achieved_at,
--     ph.created_at as superseded_at
-- FROM "PR_History" ph
-- JOIN "Movement" m ON ph.movement_id = m.id
-- WHERE ph.user_id = 'user-uuid-here'
--   AND m.name = 'Back Squat'
-- ORDER BY ph.created_at DESC;

-- View current PR vs historical PRs for a user
-- WITH current_pr AS (
--     SELECT pr.*, m.name as movement_name
--     FROM "PR" pr
--     JOIN "Movement" m ON pr.movement_id = m.id
--     WHERE pr.user_id = 'user-uuid-here'
-- ),
-- historical_prs AS (
--     SELECT ph.*, m.name as movement_name
--     FROM "PR_History" ph
--     JOIN "Movement" m ON ph.movement_id = m.id
--     WHERE ph.user_id = 'user-uuid-here'
-- )
-- SELECT 'Current' as type, movement_name, value, unit, achieved_at
-- FROM current_pr
-- UNION ALL
-- SELECT 'Historical' as type, movement_name, value, unit, achieved_at
-- FROM historical_prs
-- ORDER BY movement_name, achieved_at DESC;