SET search_path TO public;

-- Enable btree_gist for exclusion constraints (prevents double-booking)
CREATE EXTENSION IF NOT EXISTS "btree_gist";

CREATE TYPE "staff_role" AS ENUM (
  'super_admin', -- global admin, can do everything across all boxes
  'admin', -- box admin, can do everything regarding a specific box
  'coach', -- can manage only classes, and workout related tables
  'receptionist' -- can manage box members and class attendance
);

CREATE TYPE "payment_status" AS ENUM (
  'not_paid',
  'paid',
  'pending',
  'failed'
);

CREATE TYPE "payment_method" AS ENUM (
  'card',
  'mbway',
  'cash',
  'bank_transfer'
);

CREATE TYPE "attendance_status" AS ENUM (
  'present',
  'no_show',
  'cancelled'
);

CREATE TYPE "workout_type" AS ENUM (
  'amrap',
  'for_time',
  'emom',
  'tabata',
  'not_timed'
);

CREATE TYPE "movement_unit" AS ENUM (
  'reps',
  'kg',
  'meters',
  'minutes'
);

CREATE TYPE "movement_category" AS ENUM (
  'weightlifting',
  'gymnastics',
  'cardio',
  'accessory'
);

CREATE TYPE "result_type" AS ENUM (
  'time',
  'reps',
  'weight',
  'distance',
  'rounds_plus_reps',
  'calories',
  'time(max. time)'
);

CREATE TYPE "discount_type" AS ENUM (
  'percent',
  'fixed'
);

CREATE TYPE "discount_applies_to" AS ENUM (
  'plan',
  'session_pack',
  'all'
);

CREATE TYPE "expense_type" AS ENUM (
  'cleaning',
  'maintenance',
  'material',
  'equipment',
  'marketing',
  'others'
);

CREATE TYPE "membership_request_status" AS ENUM (
  'pending',
  'approved',
  'rejected',
  'cancelled'
);

-------------------------------- START OF TABLES ---------------------------------

CREATE TABLE "User_detail" (
  "id" UUID PRIMARY KEY,
  "name" VARCHAR(100) NOT NULL,
  "email" VARCHAR(255) NOT NULL,
  "phone" VARCHAR(20),
  "notification_token" VARCHAR(255),
  "email_confirmed_at" TIMESTAMP,
  "last_sign_in_at" TIMESTAMP,
  "deleted_at" TIMESTAMP,
  "created_at" TIMESTAMP NOT NULL DEFAULT (now()),
  "updated_at" TIMESTAMP NOT NULL DEFAULT (now())
);

CREATE TABLE "PR" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" UUID NOT NULL,
  "movement_id" UUID NOT NULL,
  "value" INT NOT NULL,
  "unit" movement_unit NOT NULL,
  "achieved_at" TIMESTAMP NOT NULL,
  "public" BOOLEAN NOT NULL DEFAULT false,
  "deleted_at" TIMESTAMP,
  "created_at" TIMESTAMP NOT NULL DEFAULT (now()),
  "updated_at" TIMESTAMP NOT NULL DEFAULT (now()),
  CHECK (value > 0)
);

CREATE TABLE "Achievement" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "title" VARCHAR(200) NOT NULL,
  "target_value" INT NOT NULL,
  "target_unit" movement_unit NOT NULL,
  "movement_id" UUID,
  "badge_url" VARCHAR(500),
  "achieved_at" TIMESTAMP,
  "is_active" BOOLEAN NOT NULL DEFAULT true,
  "deleted_at" TIMESTAMP,
  "created_at" TIMESTAMP NOT NULL DEFAULT (now()),
  "updated_at" TIMESTAMP NOT NULL DEFAULT (now()),
  CHECK (target_value > 0)
);

CREATE TABLE "Achievement_Unlocked" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "achievement_id" UUID NOT NULL,
  "user_id" UUID NOT NULL,
  "workout_result_id" UUID NOT NULL,
  "achieved_at" TIMESTAMP NOT NULL,
  "created_at" TIMESTAMP NOT NULL DEFAULT (now())
);

CREATE TABLE "Box" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "name" VARCHAR NOT NULL,
  "location" VARCHAR NOT NULL,
  "latitude" FLOAT8,
  "longitude" FLOAT8,
  "timezone" VARCHAR NOT NULL DEFAULT 'Europe/Lisbon',
  "currency" VARCHAR(3) NOT NULL DEFAULT 'EUR',
  "active" BOOLEAN NOT NULL DEFAULT true,
  "created_at" TIMESTAMP NOT NULL DEFAULT (now()),
  "updated_at" TIMESTAMP NOT NULL DEFAULT (now())
);

CREATE TABLE "Box_Staff" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "box_id" UUID NOT NULL,
  "user_id" UUID NOT NULL,
  "role" staff_role NOT NULL,
  "start_date" DATE NOT NULL,
  "end_date" DATE,
  "created_at" TIMESTAMP NOT NULL DEFAULT (now()),
  "updated_at" TIMESTAMP NOT NULL DEFAULT (now()),
  CHECK (end_date IS NULL OR end_date > start_date)
);

CREATE TABLE "Box_Member" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "box_id" UUID NOT NULL,
  "user_id" UUID NOT NULL,
  "seguro_validade" DATE,
  "joined_at" DATE NOT NULL,
  "notes" TEXT,
  "deleted_at" TIMESTAMP,
  "created_at" TIMESTAMP NOT NULL DEFAULT (now()),
  "updated_at" TIMESTAMP NOT NULL DEFAULT (now())
);

CREATE TABLE "Box_Membership_Request" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" UUID NOT NULL,
  "box_id" UUID NOT NULL,
  "status" membership_request_status NOT NULL DEFAULT 'pending',
  "processed_by" UUID,
  "processed_at" TIMESTAMP,
  "created_at" TIMESTAMP NOT NULL DEFAULT (now()),
  "updated_at" TIMESTAMP NOT NULL DEFAULT (now()),
  CHECK (status != 'approved' OR processed_by IS NOT NULL)
);

CREATE TABLE "Announcement" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "box_id" UUID NOT NULL,
  "admin_id" UUID NOT NULL,
  "title" VARCHAR(200) NOT NULL,
  "message" TEXT NOT NULL,
  "send_date" TIMESTAMP NOT NULL,
  "deleted_at" TIMESTAMP,
  "created_at" TIMESTAMP NOT NULL DEFAULT (now()),
  "updated_at" TIMESTAMP NOT NULL DEFAULT (now())
);

CREATE TABLE "Membership" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" UUID NOT NULL,
  "plan_id" UUID NOT NULL,
  "start_date" DATE NOT NULL,
  "end_date" DATE NOT NULL,
  "is_active" BOOLEAN NOT NULL DEFAULT true,
  "payment_status" payment_status NOT NULL,
  "deleted_at" TIMESTAMP,
  "created_at" TIMESTAMP NOT NULL DEFAULT (now()),
  "updated_at" TIMESTAMP NOT NULL DEFAULT (now()),
  CHECK (end_date > start_date)
);

CREATE TABLE "Plan" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "box_id" UUID NOT NULL,
  "name" VARCHAR NOT NULL,
  "description" TEXT,
  "price" DECIMAL(10,2) NOT NULL,
  "max_sessions" INT NOT NULL,
  "created_at" TIMESTAMP NOT NULL DEFAULT (now()),
  "updated_at" TIMESTAMP NOT NULL DEFAULT (now()),
  CHECK (price >= 0 AND max_sessions > 0)
);

CREATE TABLE "Session_Pack" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "name" VARCHAR NOT NULL,
  "description" TEXT,
  "price" DECIMAL(10,2) NOT NULL,
  "session_count" INT NOT NULL,
  "validity_days" INT NOT NULL,
  "box_id" UUID NOT NULL,
  "created_at" TIMESTAMP NOT NULL DEFAULT (now()),
  "updated_at" TIMESTAMP NOT NULL DEFAULT (now()),
  CHECK (price >= 0 AND session_count > 0 AND validity_days > 0)
);

CREATE TABLE "User_Session_Pack" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" UUID NOT NULL,
  "session_pack_id" UUID NOT NULL,
  "start_date" DATE NOT NULL,
  "expiration_date" DATE NOT NULL,
  "sessions_used" INT NOT NULL DEFAULT 0,
  "is_active" BOOLEAN NOT NULL DEFAULT true,
  "created_at" TIMESTAMP NOT NULL DEFAULT (now()),
  "updated_at" TIMESTAMP NOT NULL DEFAULT (now()),
  CHECK (expiration_date > start_date AND sessions_used >= 0)
);

CREATE TABLE "Class" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "box_id" UUID NOT NULL,
  "coach_id" UUID,
  "datetime" TIMESTAMP NOT NULL,
  "duration" INT NOT NULL,
  "max_capacity" INT NOT NULL,
  "type" VARCHAR NOT NULL,
  "waitlist_max" INT,
  "deleted_at" TIMESTAMP,
  "created_at" TIMESTAMP NOT NULL DEFAULT (now()),
  "updated_at" TIMESTAMP NOT NULL DEFAULT (now()),
  CHECK (duration > 0 AND max_capacity > 0 AND (waitlist_max IS NULL OR waitlist_max > 0))
);

CREATE TABLE "Class_Attendance" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "class_id" UUID NOT NULL,
  "user_id" UUID NOT NULL,
  "box_id" UUID NOT NULL,
  "membership_id" UUID,
  "session_pack_id" UUID,
  "status" attendance_status NOT NULL,
  "is_dropin" BOOLEAN NOT NULL DEFAULT false,
  "deleted_at" TIMESTAMP,
  "created_at" TIMESTAMP NOT NULL DEFAULT (now()),
  "updated_at" TIMESTAMP NOT NULL DEFAULT (now())
);

CREATE TABLE "Class_Waitlist" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "class_id" UUID NOT NULL,
  "user_id" UUID NOT NULL,
  "box_id" UUID NOT NULL,
  "position" INT NOT NULL,
  "joined_at" TIMESTAMP NOT NULL DEFAULT (now()),
  "notified_at" TIMESTAMP,
  "notification_expires_at" TIMESTAMP,
  "created_at" TIMESTAMP NOT NULL DEFAULT (now()),
  "updated_at" TIMESTAMP NOT NULL DEFAULT (now()),
  CHECK (position > 0)
);

CREATE TABLE "Workout" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "class_id" UUID,
  "name" VARCHAR NOT NULL,
  "description" TEXT,
  "type" workout_type NOT NULL,
  "deleted_at" TIMESTAMP,
  "created_at" TIMESTAMP NOT NULL DEFAULT (now()),
  "updated_at" TIMESTAMP NOT NULL DEFAULT (now())
);

CREATE TABLE "Workout_Section" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "workout_id" UUID NOT NULL,
  "title" VARCHAR NOT NULL,
  "type" workout_type NOT NULL,
  "duration_minutes" INT,
  "notes" TEXT,
  "created_at" TIMESTAMP NOT NULL DEFAULT (now()),
  "updated_at" TIMESTAMP NOT NULL DEFAULT (now())
);

CREATE TABLE "Movement" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "name" VARCHAR(100) UNIQUE NOT NULL,
  "category" movement_category NOT NULL,
  "url" VARCHAR(500),
  "created_at" TIMESTAMP NOT NULL DEFAULT (now()),
  "updated_at" TIMESTAMP NOT NULL DEFAULT (now())
);

CREATE TABLE "Workout_Section_Exercise" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "section_id" UUID NOT NULL,
  "movement_id" UUID NOT NULL,
  "objective" VARCHAR,
  "reps" INT,
  "sets" INT,
  "load" VARCHAR,
  "order_number" INT NOT NULL,
  "notes" TEXT,
  "created_at" TIMESTAMP NOT NULL DEFAULT (now()),
  "updated_at" TIMESTAMP NOT NULL DEFAULT (now())
);

CREATE TABLE "Workout_Result" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" UUID NOT NULL,
  "workout_id" UUID NOT NULL,
  "result_type" result_type NOT NULL,
  "value" VARCHAR NOT NULL,
  "date" DATE NOT NULL,
  "public" BOOLEAN NOT NULL DEFAULT false,
  "deleted_at" TIMESTAMP,
  "created_at" TIMESTAMP NOT NULL DEFAULT (now()),
  "updated_at" TIMESTAMP NOT NULL DEFAULT (now())
);

CREATE TABLE "Workout_Result_Like" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "result_id" UUID NOT NULL,
  "user_id" UUID NOT NULL,
  "icon" VARCHAR NOT NULL,
  "created_at" TIMESTAMP NOT NULL DEFAULT (now())
);

CREATE TABLE "Payment" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" UUID NOT NULL,
  "membership_id" UUID,
  "session_pack_id" UUID,
  "amount" DECIMAL(10,2) NOT NULL,
  "method" payment_method NOT NULL,
  "status" payment_status NOT NULL,
  "paid_at" TIMESTAMP,
  "deleted_at" TIMESTAMP,
  "created_at" TIMESTAMP NOT NULL DEFAULT (now()),
  "updated_at" TIMESTAMP NOT NULL DEFAULT (now())
);

CREATE TABLE "Discount" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "code" VARCHAR(50) NOT NULL,
  "type" discount_type NOT NULL,
  "amount" DECIMAL(10,2) NOT NULL,
  "applies_to" discount_applies_to NOT NULL,
  "start_date" DATE NOT NULL,
  "end_date" DATE NOT NULL,
  "max_uses" INT,
  "usage_count" INT NOT NULL DEFAULT 0,
  "active" BOOLEAN NOT NULL DEFAULT true,
  "deleted_at" TIMESTAMP,
  "created_at" TIMESTAMP NOT NULL DEFAULT (now()),
  "updated_at" TIMESTAMP NOT NULL DEFAULT (now()),
  CHECK (end_date > start_date AND amount > 0 AND usage_count >= 0 AND (max_uses IS NULL OR max_uses > 0))
);

CREATE TABLE "Applied_Discount" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" UUID NOT NULL,
  "discount_id" UUID NOT NULL,
  "membership_id" UUID,
  "session_pack_id" UUID,
  "amount_applied" DECIMAL(10,2) NOT NULL,
  "applied_at" TIMESTAMP NOT NULL DEFAULT (now()),
  CHECK ((membership_id IS NOT NULL) OR (session_pack_id IS NOT NULL))
);

CREATE TABLE "Expense" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "box_id" UUID NOT NULL,
  "user_id" UUID NOT NULL,
  "description" TEXT NOT NULL,
  "amount" DECIMAL(10,2) NOT NULL,
  "type" expense_type NOT NULL,
  "expense_date" DATE NOT NULL,
  "created_at" TIMESTAMP NOT NULL DEFAULT (now()),
  "updated_at" TIMESTAMP NOT NULL DEFAULT (now()),
  CHECK (amount > 0)
);

---------------------------------- START OF INDEXES ----------------------------------

CREATE UNIQUE INDEX ON "User_detail" ("email");

CREATE INDEX ON "User_detail" ("created_at");

CREATE INDEX ON "User_detail" ("email_confirmed_at");

CREATE INDEX ON "User_detail" ("last_sign_in_at");

CREATE INDEX ON "PR" ("user_id");

CREATE INDEX ON "PR" ("movement_id");

CREATE INDEX ON "PR" ("user_id", "movement_id", "achieved_at");

CREATE INDEX ON "PR" ("user_id", "achieved_at");

CREATE INDEX ON "PR" ("movement_id", "value", "unit");

CREATE INDEX ON "PR" ("public");

CREATE INDEX ON "PR" ("user_id", "public");

CREATE INDEX ON "Achievement" ("movement_id");

CREATE INDEX ON "Achievement" ("achieved_at");

CREATE INDEX ON "Achievement" ("target_unit", "target_value");

CREATE INDEX ON "Box" ("latitude", "longitude");

CREATE INDEX ON "Box" ("active");

CREATE UNIQUE INDEX ON "Box_Staff" ("box_id", "user_id") WHERE end_date IS NULL;

CREATE INDEX ON "Box_Staff" ("box_id", "role");

CREATE INDEX ON "Box_Staff" ("user_id");

CREATE INDEX ON "Box_Staff" (user_id) WHERE end_date IS NULL;

CREATE INDEX ON "Box_Staff" ("role") WHERE end_date IS NULL;

CREATE INDEX ON "Box_Staff" ("user_id", "role") WHERE end_date IS NULL;

CREATE UNIQUE INDEX ON "Box_Member" ("box_id", "user_id");

CREATE INDEX ON "Box_Member" ("box_id");

CREATE INDEX ON "Box_Member" ("user_id");

CREATE INDEX ON "Box_Member" (user_id) WHERE deleted_at IS NULL;

CREATE INDEX ON "Box_Member" (box_id) WHERE deleted_at IS NULL;

CREATE INDEX ON "Announcement" ("box_id");

CREATE INDEX ON "Announcement" ("admin_id");

CREATE INDEX ON "Announcement" ("box_id", "send_date");

CREATE INDEX ON "Announcement" ("send_date");

CREATE INDEX ON "Membership" ("user_id");

CREATE INDEX ON "Membership" ("is_active");

CREATE INDEX ON "Membership" ("payment_status");

CREATE INDEX ON "Membership" ("user_id", "start_date", "end_date");

CREATE INDEX ON "Membership" ("user_id", "is_active");

CREATE INDEX ON "Membership" ("is_active", "end_date");

CREATE INDEX ON "Membership" ("end_date");

CREATE INDEX ON "Session_Pack" ("box_id");

CREATE INDEX ON "User_Session_Pack" ("user_id");

CREATE INDEX ON "User_Session_Pack" ("session_pack_id");

CREATE INDEX ON "User_Session_Pack" ("user_id", "is_active");

CREATE INDEX ON "User_Session_Pack" ("expiration_date");

CREATE INDEX ON "Class" ("box_id", "datetime");

CREATE INDEX ON "Class" ("coach_id");

CREATE INDEX ON "Class" ("datetime");

CREATE INDEX ON "Class" ("box_id", "deleted_at");

CREATE INDEX ON "Class_Attendance" ("class_id");

CREATE INDEX ON "Class_Attendance" ("user_id");

CREATE INDEX ON "Class_Attendance" ("status");

CREATE UNIQUE INDEX ON "Class_Attendance" ("class_id", "user_id");

CREATE INDEX ON "Class_Attendance" ("class_id", "status");

CREATE INDEX ON "Class_Attendance" ("user_id", "status");

CREATE INDEX ON "Class_Attendance" ("box_id");

CREATE INDEX ON "Class_Waitlist" ("class_id", "position");

CREATE UNIQUE INDEX ON "Class_Waitlist" ("class_id", "user_id");

CREATE INDEX ON "Class_Waitlist" ("user_id", "joined_at");

CREATE INDEX ON "Class_Waitlist" ("notification_expires_at");

CREATE INDEX ON "Class_Waitlist" ("box_id");

CREATE INDEX ON "Workout_Section" ("workout_id");

CREATE INDEX ON "Movement" ("name");

CREATE INDEX ON "Movement" ("category");

CREATE INDEX ON "Movement" ("category", "name");

CREATE INDEX ON "Movement" ("url");

CREATE INDEX ON "Workout_Section_Exercise" ("section_id", "order_number");

CREATE INDEX ON "Workout_Section_Exercise" ("movement_id");

CREATE INDEX ON "Workout_Result" ("user_id", "workout_id");

CREATE INDEX ON "Workout_Result" ("workout_id", "date");

CREATE INDEX ON "Workout_Result" ("user_id");

CREATE INDEX ON "Workout_Result" ("user_id", "date");

CREATE INDEX ON "Workout_Result" ("workout_id", "date", "result_type");

CREATE INDEX ON "Workout_Result" ("date");

CREATE INDEX ON "Workout_Result" ("public");

CREATE INDEX ON "Workout_Result" ("workout_id", "public");

CREATE INDEX ON "Workout_Result" ("user_id", "public");

CREATE UNIQUE INDEX ON "Workout_Result_Like" ("result_id", "user_id");

CREATE INDEX ON "Workout_Result_Like" ("result_id");

CREATE INDEX ON "Payment" ("user_id");

CREATE INDEX ON "Payment" ("status");

CREATE INDEX ON "Payment" ("paid_at");

CREATE INDEX ON "Payment" ("user_id", "paid_at");

CREATE INDEX ON "Payment" ("membership_id");

CREATE INDEX ON "Payment" ("session_pack_id");

CREATE INDEX ON "Payment" ("status", "paid_at");

CREATE UNIQUE INDEX ON "Discount" ("code");

CREATE INDEX ON "Discount" ("start_date", "end_date");

CREATE INDEX ON "Discount" ("end_date");

CREATE INDEX ON "Discount" ("applies_to", "start_date", "end_date");

CREATE INDEX ON "Applied_Discount" ("user_id");

CREATE INDEX ON "Applied_Discount" ("discount_id");

CREATE INDEX ON "Applied_Discount" ("membership_id");

CREATE INDEX ON "Applied_Discount" ("session_pack_id");

CREATE INDEX ON "Applied_Discount" ("user_id", "applied_at");

CREATE INDEX ON "Expense" ("box_id", "expense_date");

CREATE INDEX ON "Expense" ("user_id", "created_at");

CREATE UNIQUE INDEX ON "Achievement_Unlocked" ("user_id", "achievement_id");

CREATE INDEX ON "Achievement_Unlocked" ("achievement_id");

CREATE INDEX ON "Achievement_Unlocked" ("user_id");

CREATE INDEX ON "Achievement_Unlocked" ("workout_result_id");

CREATE INDEX ON "Achievement_Unlocked" ("achieved_at");

CREATE INDEX ON "Achievement_Unlocked" ("user_id", "achieved_at");

CREATE UNIQUE INDEX ON "Box_Membership_Request" ("user_id", "box_id") WHERE status = 'pending';

CREATE INDEX ON "Box_Membership_Request" ("user_id");

CREATE INDEX ON "Box_Membership_Request" ("box_id");

CREATE INDEX ON "Box_Membership_Request" ("status");

CREATE INDEX ON "Box_Membership_Request" ("box_id", "status");

CREATE INDEX ON "Box_Membership_Request" ("processed_by");

CREATE INDEX ON "Box_Membership_Request" ("created_at");

---------------------------- START OF RELATIONSHIPS -----------------------------------

-- User_detail to Supabase Auth relationship
ALTER TABLE "User_detail" ADD FOREIGN KEY ("id") REFERENCES auth.users ("id") ON DELETE CASCADE ON UPDATE NO ACTION;

ALTER TABLE "PR" ADD FOREIGN KEY ("user_id") REFERENCES "User_detail" ("id") ON DELETE CASCADE ON UPDATE NO ACTION;

ALTER TABLE "PR" ADD FOREIGN KEY ("movement_id") REFERENCES "Movement" ("id") ON DELETE RESTRICT ON UPDATE NO ACTION;

ALTER TABLE "Achievement" ADD FOREIGN KEY ("movement_id") REFERENCES "Movement" ("id") ON DELETE SET NULL ON UPDATE NO ACTION;

ALTER TABLE "Box_Staff" ADD FOREIGN KEY ("box_id") REFERENCES "Box" ("id") ON DELETE CASCADE ON UPDATE NO ACTION;

ALTER TABLE "Box_Staff" ADD FOREIGN KEY ("user_id") REFERENCES "User_detail" ("id") ON DELETE CASCADE ON UPDATE NO ACTION;

ALTER TABLE "Box_Member" ADD FOREIGN KEY ("box_id") REFERENCES "Box" ("id") ON DELETE CASCADE ON UPDATE NO ACTION;

ALTER TABLE "Box_Member" ADD FOREIGN KEY ("user_id") REFERENCES "User_detail" ("id") ON DELETE CASCADE ON UPDATE NO ACTION;

ALTER TABLE "Announcement" ADD FOREIGN KEY ("box_id") REFERENCES "Box" ("id") ON DELETE CASCADE ON UPDATE NO ACTION;

ALTER TABLE "Announcement" ADD FOREIGN KEY ("admin_id") REFERENCES "User_detail" ("id") ON DELETE RESTRICT ON UPDATE NO ACTION;

ALTER TABLE "Membership" ADD FOREIGN KEY ("user_id") REFERENCES "User_detail" ("id") ON DELETE CASCADE ON UPDATE NO ACTION;

ALTER TABLE "Membership" ADD FOREIGN KEY ("plan_id") REFERENCES "Plan" ("id") ON DELETE CASCADE ON UPDATE NO ACTION;

ALTER TABLE "Plan" ADD FOREIGN KEY ("box_id") REFERENCES "Box" ("id") ON DELETE CASCADE ON UPDATE NO ACTION;

ALTER TABLE "Session_Pack" ADD FOREIGN KEY ("box_id") REFERENCES "Box" ("id") ON DELETE CASCADE ON UPDATE NO ACTION;

ALTER TABLE "User_Session_Pack" ADD FOREIGN KEY ("user_id") REFERENCES "User_detail" ("id") ON DELETE CASCADE ON UPDATE NO ACTION;

ALTER TABLE "User_Session_Pack" ADD FOREIGN KEY ("session_pack_id") REFERENCES "Session_Pack" ("id") ON DELETE CASCADE ON UPDATE NO ACTION;

ALTER TABLE "Class" ADD FOREIGN KEY ("box_id") REFERENCES "Box" ("id") ON DELETE CASCADE ON UPDATE NO ACTION;

ALTER TABLE "Class" ADD FOREIGN KEY ("coach_id") REFERENCES "User_detail" ("id") ON DELETE SET NULL ON UPDATE NO ACTION;

ALTER TABLE "Class_Attendance" ADD FOREIGN KEY ("class_id") REFERENCES "Class" ("id") ON DELETE CASCADE ON UPDATE NO ACTION;

ALTER TABLE "Class_Attendance" ADD FOREIGN KEY ("user_id") REFERENCES "User_detail" ("id") ON DELETE CASCADE ON UPDATE NO ACTION;

ALTER TABLE "Class_Attendance" ADD FOREIGN KEY ("membership_id") REFERENCES "Membership" ("id") ON DELETE SET NULL ON UPDATE NO ACTION;

ALTER TABLE "Class_Attendance" ADD FOREIGN KEY ("session_pack_id") REFERENCES "User_Session_Pack" ("id") ON DELETE SET NULL ON UPDATE NO ACTION;

ALTER TABLE "Class_Attendance" ADD FOREIGN KEY ("box_id") REFERENCES "Box" ("id") ON DELETE CASCADE ON UPDATE NO ACTION;

ALTER TABLE "Class_Waitlist" ADD FOREIGN KEY ("class_id") REFERENCES "Class" ("id") ON DELETE CASCADE ON UPDATE NO ACTION;

ALTER TABLE "Class_Waitlist" ADD FOREIGN KEY ("user_id") REFERENCES "User_detail" ("id") ON DELETE CASCADE ON UPDATE NO ACTION;

ALTER TABLE "Class_Waitlist" ADD FOREIGN KEY ("box_id") REFERENCES "Box" ("id") ON DELETE CASCADE ON UPDATE NO ACTION;

ALTER TABLE "Workout" ADD FOREIGN KEY ("class_id") REFERENCES "Class" ("id") ON DELETE SET NULL ON UPDATE NO ACTION;

ALTER TABLE "Workout_Section" ADD FOREIGN KEY ("workout_id") REFERENCES "Workout" ("id") ON DELETE CASCADE ON UPDATE NO ACTION;

ALTER TABLE "Workout_Section_Exercise" ADD FOREIGN KEY ("section_id") REFERENCES "Workout_Section" ("id") ON DELETE CASCADE ON UPDATE NO ACTION;

ALTER TABLE "Workout_Section_Exercise" ADD FOREIGN KEY ("movement_id") REFERENCES "Movement" ("id") ON DELETE RESTRICT ON UPDATE NO ACTION;

ALTER TABLE "Workout_Result" ADD FOREIGN KEY ("user_id") REFERENCES "User_detail" ("id") ON DELETE CASCADE ON UPDATE NO ACTION;

ALTER TABLE "Workout_Result" ADD FOREIGN KEY ("workout_id") REFERENCES "Workout" ("id") ON DELETE CASCADE ON UPDATE NO ACTION;

ALTER TABLE "Workout_Result_Like" ADD FOREIGN KEY ("result_id") REFERENCES "Workout_Result" ("id") ON DELETE CASCADE ON UPDATE NO ACTION;

ALTER TABLE "Workout_Result_Like" ADD FOREIGN KEY ("user_id") REFERENCES "User_detail" ("id") ON DELETE CASCADE ON UPDATE NO ACTION;

ALTER TABLE "Payment" ADD FOREIGN KEY ("user_id") REFERENCES "User_detail" ("id") ON DELETE CASCADE ON UPDATE NO ACTION;

ALTER TABLE "Payment" ADD FOREIGN KEY ("membership_id") REFERENCES "Membership" ("id") ON DELETE SET NULL ON UPDATE NO ACTION;

ALTER TABLE "Payment" ADD FOREIGN KEY ("session_pack_id") REFERENCES "User_Session_Pack" ("id") ON DELETE SET NULL ON UPDATE NO ACTION;

ALTER TABLE "Applied_Discount" ADD FOREIGN KEY ("user_id") REFERENCES "User_detail" ("id") ON DELETE CASCADE ON UPDATE NO ACTION;

ALTER TABLE "Applied_Discount" ADD FOREIGN KEY ("discount_id") REFERENCES "Discount" ("id") ON DELETE CASCADE ON UPDATE NO ACTION;

ALTER TABLE "Applied_Discount" ADD FOREIGN KEY ("membership_id") REFERENCES "Membership" ("id") ON DELETE SET NULL ON UPDATE NO ACTION;

ALTER TABLE "Applied_Discount" ADD FOREIGN KEY ("session_pack_id") REFERENCES "User_Session_Pack" ("id") ON DELETE SET NULL ON UPDATE NO ACTION;

ALTER TABLE "Expense" ADD FOREIGN KEY ("box_id") REFERENCES "Box" ("id") ON DELETE CASCADE ON UPDATE NO ACTION;

ALTER TABLE "Expense" ADD FOREIGN KEY ("user_id") REFERENCES "User_detail" ("id") ON DELETE CASCADE ON UPDATE NO ACTION;

ALTER TABLE "Achievement_Unlocked" ADD FOREIGN KEY ("achievement_id") REFERENCES "Achievement" ("id") ON DELETE CASCADE ON UPDATE NO ACTION;

ALTER TABLE "Achievement_Unlocked" ADD FOREIGN KEY ("user_id") REFERENCES "User_detail" ("id") ON DELETE CASCADE ON UPDATE NO ACTION;

ALTER TABLE "Achievement_Unlocked" ADD FOREIGN KEY ("workout_result_id") REFERENCES "Workout_Result" ("id") ON DELETE CASCADE ON UPDATE NO ACTION;

ALTER TABLE "Box_Membership_Request" ADD FOREIGN KEY ("user_id") REFERENCES "User_detail" ("id") ON DELETE CASCADE ON UPDATE NO ACTION;

ALTER TABLE "Box_Membership_Request" ADD FOREIGN KEY ("box_id") REFERENCES "Box" ("id") ON DELETE CASCADE ON UPDATE NO ACTION;

ALTER TABLE "Box_Membership_Request" ADD FOREIGN KEY ("processed_by") REFERENCES "Box_Staff" ("id") ON DELETE SET NULL ON UPDATE NO ACTION;

--------------------------------------- START OF FUNCTIONS ---------------------------------------
-- Function to update PR when a better workout result is recorded
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
                    UPDATE "PR" SET 
                        value = new_pr_value,
                        achieved_at = NEW.date::timestamp,
                        updated_at = NOW()
                    WHERE id = current_pr.id;
                
                -- For rep-based movements (higher reps = better)
                WHEN NEW.result_type = 'reps' AND new_pr_value > current_pr.value THEN
                    UPDATE "PR" SET 
                        value = new_pr_value,
                        achieved_at = NEW.date::timestamp,
                        updated_at = NOW()
                    WHERE id = current_pr.id;
                
                -- For time-based movements (lower time = better)
                WHEN NEW.result_type = 'time' AND new_pr_value < current_pr.value THEN
                    UPDATE "PR" SET 
                        value = new_pr_value,
                        achieved_at = NEW.date::timestamp,
                        updated_at = NOW()
                    WHERE id = current_pr.id;
                
                -- For distance-based movements (higher distance = better)
                WHEN NEW.result_type = 'distance' AND new_pr_value > current_pr.value THEN
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

-- Create trigger to automatically update PRs when workout results are inserted or updated
CREATE TRIGGER trigger_update_pr_from_workout_result
    AFTER INSERT OR UPDATE ON "Workout_Result"
    FOR EACH ROW
    WHEN (NEW.deleted_at IS NULL) -- Only trigger for non-deleted results
    EXECUTE FUNCTION update_pr_from_workout_result();

-- Function to check and record achievement achievements when workout results are registered
CREATE OR REPLACE FUNCTION check_achievement_unlocked()
RETURNS TRIGGER AS $$
DECLARE
    achievement_rec RECORD;
    movement_rec RECORD;
    result_value INT;
    achievement_achieved BOOLEAN;
BEGIN
    -- Get movements in this workout
    FOR movement_rec IN 
        SELECT DISTINCT wse.movement_id
        FROM "Workout_Section" ws
        JOIN "Workout_Section_Exercise" wse ON ws.id = wse.section_id
        WHERE ws.workout_id = NEW.workout_id
    LOOP
        -- Find active achievements for movements that haven't been achieved by this user yet
        FOR achievement_rec IN 
            SELECT a.id, a.target_value, a.target_unit, a.movement_id
            FROM "Achievement" a
            WHERE a.movement_id = movement_rec.movement_id
            AND a.is_active = true 
            AND a.achieved_at IS NULL
            AND a.deleted_at IS NULL
            -- Make sure this user hasn't already unlocked this achievement
            AND NOT EXISTS (
                SELECT 1 FROM "Achievement_Unlocked" au 
                WHERE au.achievement_id = a.id
                AND au.user_id = NEW.user_id
            )
        LOOP
            achievement_achieved := false;
            
            -- Convert result value based on result type
            CASE NEW.result_type
                WHEN 'weight' THEN
                    IF achievement_rec.target_unit = 'kg' THEN
                        result_value := CAST(NEW.value AS INT);
                        achievement_achieved := result_value >= achievement_rec.target_value;
                    END IF;
                WHEN 'reps' THEN
                    IF achievement_rec.target_unit = 'reps' THEN
                        result_value := CAST(NEW.value AS INT);
                        achievement_achieved := result_value >= achievement_rec.target_value;
                    END IF;
                WHEN 'time' THEN
                    IF achievement_rec.target_unit = 'minutes' THEN
                        -- Convert time to seconds for comparison
                        result_value := CASE 
                            WHEN NEW.value ~ '^\d+:\d+$' THEN 
                                CAST(split_part(NEW.value, ':', 1) AS INT) * 60 + CAST(split_part(NEW.value, ':', 2) AS INT)
                            ELSE 
                                CAST(NEW.value AS INT)
                        END;
                        -- For time-based achievements, achieving means being equal or faster (lower time)
                        achievement_achieved := result_value <= achievement_rec.target_value;
                    END IF;
                WHEN 'distance' THEN
                    IF achievement_rec.target_unit = 'meters' THEN
                        result_value := CAST(NEW.value AS INT);
                        achievement_achieved := result_value >= achievement_rec.target_value;
                    END IF;
                ELSE
                    CONTINUE; -- Skip unsupported result types
            END CASE;

            -- If achievement is achieved, record it
            IF achievement_achieved THEN
                -- Insert achievement unlock record with user_id
                INSERT INTO "Achievement_Unlocked" (id, achievement_id, user_id, workout_result_id, achieved_at, created_at)
                VALUES (
                    gen_random_uuid(),
                    achievement_rec.id,
                    NEW.user_id,
                    NEW.id,
                    NEW.date::timestamp,
                    NOW()
                );
                
                -- Update achieved_at in Achievement table (marks when first achieved globally)
                UPDATE "Achievement" SET 
                    achieved_at = COALESCE(achieved_at, NEW.date::timestamp),
                    updated_at = NOW()
                WHERE id = achievement_rec.id;
            END IF;
        END LOOP;
    END LOOP;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically check achievements when workout results are inserted or updated
CREATE TRIGGER trigger_check_achievement_unlocked
    AFTER INSERT OR UPDATE ON "Workout_Result"
    FOR EACH ROW
    WHEN (NEW.deleted_at IS NULL) -- Only trigger for non-deleted results
    EXECUTE FUNCTION check_achievement_unlocked();

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers to automatically update updated_at timestamps on UPDATE
CREATE TRIGGER trigger_user_detail_updated_at
    BEFORE UPDATE ON "User_detail"
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_pr_updated_at
    BEFORE UPDATE ON "PR"
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_achievement_updated_at
    BEFORE UPDATE ON "Achievement"
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_box_updated_at
    BEFORE UPDATE ON "Box"
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_box_staff_updated_at
    BEFORE UPDATE ON "Box_Staff"
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_box_member_updated_at
    BEFORE UPDATE ON "Box_Member"
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_announcement_updated_at
    BEFORE UPDATE ON "Announcement"
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_membership_updated_at
    BEFORE UPDATE ON "Membership"
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_plan_updated_at
    BEFORE UPDATE ON "Plan"
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_session_pack_updated_at
    BEFORE UPDATE ON "Session_Pack"
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_user_session_pack_updated_at
    BEFORE UPDATE ON "User_Session_Pack"
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_class_updated_at
    BEFORE UPDATE ON "Class"
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_class_attendance_updated_at
    BEFORE UPDATE ON "Class_Attendance"
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_class_waitlist_updated_at
    BEFORE UPDATE ON "Class_Waitlist"
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_workout_updated_at
    BEFORE UPDATE ON "Workout"
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_workout_section_updated_at
    BEFORE UPDATE ON "Workout_Section"
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_movement_updated_at
    BEFORE UPDATE ON "Movement"
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_workout_section_exercise_updated_at
    BEFORE UPDATE ON "Workout_Section_Exercise"
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_workout_result_updated_at
    BEFORE UPDATE ON "Workout_Result"
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_payment_updated_at
    BEFORE UPDATE ON "Payment"
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_discount_updated_at
    BEFORE UPDATE ON "Discount"
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_expense_updated_at
    BEFORE UPDATE ON "Expense"
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_box_membership_request_updated_at
    BEFORE UPDATE ON "Box_Membership_Request"
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add updated_at timestamp update triggers to existing tables
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 1. Prevent double-booking: User cannot attend multiple classes at the same time
-- This function gets the class time range for double-booking prevention
CREATE OR REPLACE FUNCTION get_class_time_range(class_uuid UUID)
RETURNS tsrange AS $$
DECLARE
    class_start TIMESTAMP;
    class_end TIMESTAMP;
BEGIN
    SELECT datetime, datetime + (duration || ' minutes')::INTERVAL
    INTO class_start, class_end
    FROM "Class" 
    WHERE id = class_uuid;
    
    RETURN tsrange(class_start, class_end);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Add exclusion constraint to prevent double-booking
ALTER TABLE "Class_Attendance" 
ADD CONSTRAINT prevent_double_booking 
EXCLUDE USING gist (
    user_id WITH =,
    get_class_time_range(class_id) WITH &&
) WHERE (status = 'present' AND deleted_at IS NULL);

-- 2. Prevent overlapping memberships for the same user
ALTER TABLE "Membership"
ADD CONSTRAINT prevent_overlapping_memberships
EXCLUDE USING gist (
    user_id WITH =,
    daterange(start_date, end_date, '[]') WITH &&
) WHERE (deleted_at IS NULL);

-- 3. Prevent sessions_used from exceeding session_count
-- This requires a trigger function to validate against the session pack
CREATE OR REPLACE FUNCTION validate_session_usage()
RETURNS TRIGGER AS $$
DECLARE
    max_sessions INT;
BEGIN
    -- Get the maximum sessions allowed from the session pack
    SELECT sp.session_count INTO max_sessions
    FROM "Session_Pack" sp
    WHERE sp.id = NEW.session_pack_id;
    
    -- Check if sessions_used exceeds the limit
    IF NEW.sessions_used > max_sessions THEN
        RAISE EXCEPTION 'Sessions used (%) cannot exceed session pack limit (%)', 
            NEW.sessions_used, max_sessions;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to validate session usage
CREATE TRIGGER check_session_usage
    BEFORE INSERT OR UPDATE ON "User_Session_Pack"
    FOR EACH ROW
    EXECUTE FUNCTION validate_session_usage();

-- Function to automatically create user profile when auth user is created
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public."User_detail" (
    id, 
    name, 
    email, 
    email_confirmed_at,
    last_sign_in_at,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.email,
    NEW.email_confirmed_at,
    NEW.last_sign_in_at,
    NEW.created_at,
    NEW.updated_at
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create user profile automatically
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update user profile when auth user is updated
CREATE OR REPLACE FUNCTION public.handle_user_update()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public."User_detail"
  SET 
    email = NEW.email,
    email_confirmed_at = NEW.email_confirmed_at,
    last_sign_in_at = NEW.last_sign_in_at,
    updated_at = NEW.updated_at
  WHERE id = NEW.id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update user profile when auth user is updated
CREATE OR REPLACE TRIGGER on_auth_user_updated
  AFTER UPDATE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_user_update();
