
-- Migration: Add is_forgot_password boolean field to invite table
ALTER TABLE invite ADD COLUMN is_forgot_password BOOLEAN DEFAULT false;
