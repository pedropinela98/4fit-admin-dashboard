-- Migration: Add is_forgot_password and supporting columns to invite table for password reset functionality
-- This migration adds columns needed for the forgot password feature:
-- - is_forgot_password: boolean flag to distinguish password reset tokens from invitation tokens
-- - used_at: timestamp to track when a token was used (prevents reuse)
-- The expires_at column should already exist from the original invite table creation

-- Add is_forgot_password column if it doesn't exist
ALTER TABLE invite 
  ADD COLUMN IF NOT EXISTS is_forgot_password BOOLEAN DEFAULT false;

-- Add used_at column if it doesn't exist (to track when token is used)
ALTER TABLE invite 
  ADD COLUMN IF NOT EXISTS used_at TIMESTAMP;

-- Ensure expires_at column exists (should be from original table, but adding as safeguard)
ALTER TABLE invite 
  ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP;

-- Create index for performance when querying active forgot password tokens
CREATE INDEX IF NOT EXISTS idx_invite_forgot_password_active 
  ON invite(token, is_forgot_password) 
  WHERE used_at IS NULL AND is_forgot_password = true;

-- Create index for email lookups
CREATE INDEX IF NOT EXISTS idx_invite_email 
  ON invite(email);

-- Add comment to document the table structure
COMMENT ON COLUMN invite.is_forgot_password IS 'TRUE for password reset tokens, FALSE for invitation tokens';
COMMENT ON COLUMN invite.used_at IS 'Timestamp when token was used (NULL means not used yet)';
COMMENT ON COLUMN invite.expires_at IS 'Token expiration timestamp (2 hours for password reset, configurable for invitations)';

