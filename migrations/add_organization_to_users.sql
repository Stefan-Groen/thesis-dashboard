-- Add organization column to users table
-- This allows users to specify which organization they work for

ALTER TABLE users
ADD COLUMN IF NOT EXISTS organization VARCHAR(255);

-- Add a comment to document the column
COMMENT ON COLUMN users.organization IS 'The company or organization the user works for';
