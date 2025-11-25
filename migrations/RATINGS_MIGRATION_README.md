# Article Ratings Feature - Migration Guide

This migration adds a new feature that allows users to rate and review article classifications.

## What's New

Users can now:
- Rate article classifications on a scale of 1-10 using stars
- Leave optional text feedback explaining why the classification was (not) useful
- Access this feature via the "Rate Classification" button in the article detail modal

## Database Changes

A new table `article_ratings` has been added to store ratings and reviews.

### Table Schema

```sql
article_ratings (
  id SERIAL PRIMARY KEY,
  article_id INTEGER (references articles),
  user_id INTEGER (references users),
  organization_id INTEGER (references organizations),
  rating INTEGER (1-10),
  review TEXT (optional),
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)
```

**Unique Constraint**: One rating per article per user per organization
- Users can update their rating by submitting again (upsert behavior)

## Running the Migration

### Local Development

```bash
# Connect to your local database
psql "your-local-database-url"

# Run the migration
\i migrations/006_create_article_ratings_table.sql
```

### Production (Vercel)

```bash
# Connect to your production database
psql "your-production-database-url"

# Run the migration
\i migrations/006_create_article_ratings_table.sql
```

## API Endpoint

**POST** `/api/articles/ratings`

**Request Body:**
```json
{
  "articleId": 123,
  "rating": 8,
  "review": "Very helpful classification, spotted the supply chain risk early"
}
```

**Response:**
```json
{
  "success": true,
  "rating": {
    "id": 1,
    "rating": 8,
    "review": "Very helpful classification...",
    "created_at": "2024-11-24T10:30:00Z",
    "updated_at": "2024-11-24T10:30:00Z"
  }
}
```

## UI Changes

### Article Detail Modal
- Removed the "Source" display from bottom left
- Added "Rate Classification" button with star icon on bottom left
- PDF and "Read Full Article" buttons remain on the right

### Rating Modal
- Clean, centered dialog with the article title
- 10-star rating system with hover effects
- Text area for optional review (max 500 characters)
- Submit/Cancel buttons

## Future Enhancements

Potential features to add:
- View aggregated ratings per article
- Admin dashboard to analyze rating data
- Filter articles by high/low user ratings
- Export rating data for analysis
