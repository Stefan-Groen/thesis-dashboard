-- Migration: Create article_ratings table
-- Purpose: Store user ratings and reviews for article classifications
-- Date: 2024-11-24

-- Create article_ratings table
CREATE TABLE IF NOT EXISTS article_ratings (
  id SERIAL PRIMARY KEY,
  article_id INTEGER NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  organization_id INTEGER NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 10),
  review TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Ensure one rating per article per user per organization
  UNIQUE (article_id, user_id, organization_id)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_article_ratings_article_id ON article_ratings(article_id);
CREATE INDEX IF NOT EXISTS idx_article_ratings_user_id ON article_ratings(user_id);
CREATE INDEX IF NOT EXISTS idx_article_ratings_organization_id ON article_ratings(organization_id);
CREATE INDEX IF NOT EXISTS idx_article_ratings_created_at ON article_ratings(created_at);

-- Add comments for documentation
COMMENT ON TABLE article_ratings IS 'Stores user ratings and reviews for article classifications';
COMMENT ON COLUMN article_ratings.rating IS 'Rating on a scale of 1-10';
COMMENT ON COLUMN article_ratings.review IS 'Optional text feedback explaining why the classification was (not) useful';
