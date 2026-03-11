-- Add username and password columns to credential_reference
ALTER TABLE credential_reference
  ADD COLUMN username TEXT,
  ADD COLUMN password TEXT;
