-- ===============================================
-- SESSION USAGE AUDIT SYSTEM
-- ===============================================
-- Complete audit framework for session pack usage tracking
-- Includes: audit table, change types, triggers, validation, alerts
-- ===============================================

-- Create session change type enum
CREATE TYPE "session_change_type" AS ENUM (
  'class_attendance',   -- Automatic increment from class attendance
  'manual_increment',   -- Manual increase by admin
  'manual_decrement',   -- Manual decrease by admin  
  'admin_correction'    -- Administrative correction
);

-- Create session usage audit table
CREATE TABLE "Session_Usage_Audit" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_session_pack_id" UUID NOT NULL,
  "user_id" UUID NOT NULL,
  "class_id" UUID,  -- NULL for manual adjustments
  "old_sessions_used" INT NOT NULL,
  "new_sessions_used" INT NOT NULL,
  "change_type" session_change_type NOT NULL,
  "changed_by" UUID,  -- NULL for system, user_id for manual changes
  "reason" TEXT,  -- Required for manual changes
  "is_suspicious" BOOLEAN NOT NULL DEFAULT false,
  "created_at" TIMESTAMP NOT NULL DEFAULT (now())
);

-- Create indexes for performance
CREATE INDEX "idx_session_audit_user_session_pack" ON "Session_Usage_Audit" ("user_session_pack_id");
CREATE INDEX "idx_session_audit_user_id" ON "Session_Usage_Audit" ("user_id");
CREATE INDEX "idx_session_audit_change_type" ON "Session_Usage_Audit" ("change_type");
CREATE INDEX "idx_session_audit_created_at" ON "Session_Usage_Audit" ("created_at");
CREATE INDEX "idx_session_audit_suspicious" ON "Session_Usage_Audit" ("is_suspicious") WHERE is_suspicious = true;

-- Add foreign key constraints
ALTER TABLE "Session_Usage_Audit" ADD FOREIGN KEY ("user_session_pack_id") REFERENCES "User_Session_Pack" ("id") ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE "Session_Usage_Audit" ADD FOREIGN KEY ("user_id") REFERENCES "User_detail" ("id") ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE "Session_Usage_Audit" ADD FOREIGN KEY ("class_id") REFERENCES "Class" ("id") ON DELETE SET NULL ON UPDATE NO ACTION;
ALTER TABLE "Session_Usage_Audit" ADD FOREIGN KEY ("changed_by") REFERENCES "User_detail" ("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- Function to detect suspicious patterns
CREATE OR REPLACE FUNCTION detect_suspicious_session_changes()
RETURNS TRIGGER AS $$
DECLARE
    recent_manual_changes INT;
    large_decrease BOOLEAN := false;
    suspicious_pattern BOOLEAN := false;
BEGIN
    -- Check for large session decreases (more than 5 sessions at once)
    IF NEW.change_type IN ('manual_decrement', 'admin_correction') AND 
       NEW.old_sessions_used - NEW.new_sessions_used > 5 THEN
        large_decrease := true;
    END IF;
    
    -- Check for multiple manual changes in last 24 hours
    SELECT COUNT(*) INTO recent_manual_changes
    FROM "Session_Usage_Audit"
    WHERE user_session_pack_id = NEW.user_session_pack_id
    AND change_type IN ('manual_decrement', 'manual_increment', 'admin_correction')
    AND created_at > NOW() - INTERVAL '24 hours';
    
    -- Mark as suspicious if multiple manual changes or large decrease
    IF recent_manual_changes >= 3 OR large_decrease THEN
        suspicious_pattern := true;
    END IF;
    
    NEW.is_suspicious := suspicious_pattern;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for suspicious pattern detection
CREATE TRIGGER detect_suspicious_session_changes_trigger
    BEFORE INSERT ON "Session_Usage_Audit"
    FOR EACH ROW
    EXECUTE FUNCTION detect_suspicious_session_changes();

-- Function to audit session usage changes
CREATE OR REPLACE FUNCTION audit_session_usage_changes()
RETURNS TRIGGER AS $$
DECLARE
    change_context TEXT;
    change_reason TEXT;
    change_type_val session_change_type;
    changed_by_val UUID;
BEGIN
    -- Only audit sessions_used changes
    IF OLD.sessions_used != NEW.sessions_used THEN
        
        -- Get change context from application
        change_context := current_setting('app.session_change_context', true);
        change_reason := current_setting('app.session_change_reason', true);
        
        -- Determine change type and who made the change
        CASE change_context
            WHEN 'class_attendance' THEN
                change_type_val := 'class_attendance'::session_change_type;
                changed_by_val := NULL;  -- System change
            WHEN 'manual_increment' THEN
                change_type_val := 'manual_increment'::session_change_type;
                changed_by_val := auth.uid();
            WHEN 'manual_decrement' THEN
                change_type_val := 'manual_decrement'::session_change_type;
                changed_by_val := auth.uid();
            ELSE
                change_type_val := 'admin_correction'::session_change_type;
                changed_by_val := auth.uid();
        END CASE;
        
        -- Validate reason is provided for manual changes
        IF change_type_val IN ('manual_increment', 'manual_decrement', 'admin_correction') AND 
           (change_reason IS NULL OR LENGTH(TRIM(change_reason)) = 0) THEN
            RAISE EXCEPTION 'Reason is required for manual session adjustments';
        END IF;
        
        -- Insert audit record
        INSERT INTO "Session_Usage_Audit" (
            user_session_pack_id, user_id, class_id, old_sessions_used, 
            new_sessions_used, change_type, changed_by, reason, created_at
        ) VALUES (
            NEW.id, NEW.user_id, 
            CASE WHEN change_context = 'class_attendance' 
                 THEN current_setting('app.session_change_class_id', true)::UUID
                 ELSE NULL
            END,
            OLD.sessions_used, NEW.sessions_used, 
            change_type_val, changed_by_val, change_reason, NOW()
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create audit trigger on User_Session_Pack
CREATE TRIGGER audit_session_usage_changes_trigger
    AFTER UPDATE ON "User_Session_Pack"
    FOR EACH ROW
    EXECUTE FUNCTION audit_session_usage_changes();

-- Function to validate session usage business rules
CREATE OR REPLACE FUNCTION validate_session_usage()
RETURNS TRIGGER AS $$
DECLARE
    max_sessions INT;
BEGIN
    -- Get maximum sessions allowed from session pack
    SELECT sp.session_count INTO max_sessions
    FROM "Session_Pack" sp
    WHERE sp.id = NEW.session_pack_id;
    
    -- Validate sessions_used doesn't exceed session_count
    IF NEW.sessions_used > max_sessions THEN
        RAISE EXCEPTION 'Sessions used (%) cannot exceed session pack limit (%)', 
            NEW.sessions_used, max_sessions;
    END IF;
    
    -- Validate sessions_used is not negative
    IF NEW.sessions_used < 0 THEN
        RAISE EXCEPTION 'Sessions used cannot be negative';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create validation trigger (reuse existing trigger name if exists)
DROP TRIGGER IF EXISTS check_session_usage ON "User_Session_Pack";
CREATE TRIGGER check_session_usage
    BEFORE INSERT OR UPDATE ON "User_Session_Pack"
    FOR EACH ROW
    EXECUTE FUNCTION validate_session_usage();

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Session Usage Audit System created successfully!';
    RAISE NOTICE 'Components: audit table, change types, triggers, validation, suspicious pattern detection';
    RAISE NOTICE 'MANDATORY REASON: Required for all manual session adjustments';
    RAISE NOTICE 'REAL-TIME ALERTS: Suspicious patterns flagged automatically';
    RAISE NOTICE 'Use app settings: app.session_change_context, app.session_change_reason, app.session_change_class_id';
END $$;