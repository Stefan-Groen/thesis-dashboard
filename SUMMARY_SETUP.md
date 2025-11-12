# Daily Summary Feature Setup

## Database Setup

You need to run the SQL migration to create the `summaries` table:

1. Connect to your Neon database
2. Run the SQL script in `migrations/create_summaries_table.sql`

```sql
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
```

## Environment Variables

Add your Chutes API key to `.env.local`:

```env
CHUTES_API_KEY=your_actual_chutes_api_key_here
```

Replace `your_actual_chutes_api_key_here` with your real API key.

## How to Use

1. **Navigate to Daily Summaries**: Click on "Daily Summaries" in the sidebar
2. **Generate a Summary**:
   - Select a date using the date picker
   - Click "Generate Summary"
   - The system will:
     - Fetch all threats and opportunities from that date
     - Send them to DeepSeek R1 via Chutes AI
     - Generate a professional executive summary
     - Save it to the database
     - Display the summary
3. **View Existing Summaries**: All previously generated summaries are listed on the page
4. **Download as PDF**: On any summary page, click "Download PDF" to get a formatted PDF version

## Features

- **AI-Powered Summaries**: Uses DeepSeek R1 model to analyze all classified threats and opportunities
- **Executive Format**: Creates professional 1-2 page summaries suitable for management
- **PDF Export**: Download summaries as formatted PDFs
- **Persistent Storage**: Summaries are stored in the database for future reference
- **Date Selection**: Generate summaries for any date with classified articles

## API Routes

- `POST /api/summaries/generate` - Generate a new summary for a specific date
- `GET /api/summaries` - Fetch all summaries
- `GET /api/summaries?date=YYYY-MM-DD` - Fetch a specific summary by date

## Summary Structure

The AI generates summaries with:
1. **Executive Overview** - High-level snapshot
2. **Key Threats** - Main risks and their impact
3. **Key Opportunities** - Promising opportunities
4. **Recommended Actions** - Concrete, prioritized action items
