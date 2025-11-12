-- Create summaries table to store AI-generated daily summaries
CREATE TABLE IF NOT EXISTS summaries (
  id SERIAL PRIMARY KEY,
  summary_date DATE NOT NULL UNIQUE,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create index on summary_date for faster queries
CREATE INDEX IF NOT EXISTS idx_summaries_date ON summaries(summary_date);

-- Add comment to table
COMMENT ON TABLE summaries IS 'Stores AI-generated daily summaries of threats and opportunities';
COMMENT ON COLUMN summaries.summary_date IS 'The date for which this summary was generated';
COMMENT ON COLUMN summaries.content IS 'The AI-generated summary content';
