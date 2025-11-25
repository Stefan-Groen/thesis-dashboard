# Article Rating Feature - Implementation Summary

## Overview
A new feature has been added that allows users to rate and review article classifications directly from the article detail modal.

## What Was Implemented

### 1. UI Changes

#### Article Detail Modal ([components/filtered-articles-table.tsx](components/filtered-articles-table.tsx))
- **Removed**: "Source" information from bottom left
- **Added**: "Rate Classification" button with star icon on the bottom left
- **Kept**: PDF download and "Read Full Article" buttons on the right

#### New Rating Modal
- **Star Rating System**: Interactive 10-star rating with hover effects
  - Yellow filled stars for selected rating
  - Gray outline stars for unselected
  - Hover preview before clicking
  - Shows "You rated: X out of 10" feedback

- **Review Text Area**:
  - Optional text input (max 500 characters)
  - Character counter
  - Placeholder text: "Optional: Share your feedback about this classification..."
  - Label: "Explain shortly why this classification was (not) useful"

- **Modal Header**:
  - Title: "Rate Classification"
  - Shows the article title for context

- **Action Buttons**:
  - Cancel button (clears form and closes)
  - Submit button (disabled until rating is selected)
  - Loading state: "Submitting..." while saving

### 2. Backend API

#### New Endpoint: `/api/articles/ratings` ([app/api/articles/ratings/route.ts](app/api/articles/ratings/route.ts))

**Method**: POST

**Authentication**: Required (session-based)

**Request Body**:
```json
{
  "articleId": 123,
  "rating": 8,
  "review": "Very helpful classification"
}
```

**Response** (Success - 200):
```json
{
  "success": true,
  "rating": {
    "id": 1,
    "rating": 8,
    "review": "Very helpful classification",
    "created_at": "2024-11-24T10:30:00Z",
    "updated_at": "2024-11-24T10:30:00Z"
  }
}
```

**Error Responses**:
- `401`: Unauthorized (not logged in)
- `400`: Invalid input (missing articleId, invalid rating, etc.)
- `403`: User or organization not found
- `500`: Server error

**Features**:
- Validates rating is between 1-10
- Validates articleId is a valid number
- Review text is optional
- **Upsert behavior**: If user already rated the article, updates the existing rating
- Multi-tenant: Scoped to user's organization

### 3. Database Schema

#### New Table: `article_ratings`

```sql
CREATE TABLE article_ratings (
  id SERIAL PRIMARY KEY,
  article_id INTEGER NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  organization_id INTEGER NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 10),
  review TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE (article_id, user_id, organization_id)
);
```

**Indexes** (for performance):
- `idx_article_ratings_article_id`
- `idx_article_ratings_user_id`
- `idx_article_ratings_organization_id`
- `idx_article_ratings_created_at`

**Constraints**:
- One rating per article per user per organization
- Rating must be between 1 and 10
- Foreign keys with cascade delete

**Migration File**: [migrations/006_create_article_ratings_table.sql](migrations/006_create_article_ratings_table.sql)

### 4. User Experience Flow

1. User opens article detail modal (clicks on any article)
2. User clicks "Rate Classification" button (bottom left)
3. Rating modal appears with article title
4. User selects rating by clicking stars (1-10)
5. User optionally adds review text
6. User clicks "Submit Rating"
7. Success toast: "Rating submitted successfully!"
8. Modal closes automatically
9. Form resets for next rating

**Re-rating**: If user rates the same article again, their previous rating is updated (not duplicated)

## Files Modified/Created

### Modified
- ✏️ `components/filtered-articles-table.tsx`
  - Added rating modal state management
  - Added rating submission logic
  - Updated bottom button section
  - Added new Rating Modal UI

### Created
- ✨ `app/api/articles/ratings/route.ts` - API endpoint
- ✨ `migrations/006_create_article_ratings_table.sql` - Database migration
- ✨ `migrations/RATINGS_MIGRATION_README.md` - Migration guide
- ✨ `RATING_FEATURE_SUMMARY.md` - This file

## Next Steps to Deploy

### 1. Run the Database Migration

**Local**:
```bash
psql "your-local-database-url" -f migrations/006_create_article_ratings_table.sql
```

**Production (after deploying to Vercel)**:
```bash
psql "your-production-database-url" -f migrations/006_create_article_ratings_table.sql
```

### 2. Test the Feature

1. Open any article detail modal
2. Click "Rate Classification"
3. Select a rating (1-10 stars)
4. Add optional review text
5. Click "Submit Rating"
6. Verify success toast appears
7. Try rating the same article again (should update, not create duplicate)

### 3. Monitor in Database

Query to see all ratings:
```sql
SELECT
  ar.id,
  a.title,
  u.username,
  o.name as organization,
  ar.rating,
  ar.review,
  ar.created_at
FROM article_ratings ar
JOIN articles a ON ar.article_id = a.id
JOIN users u ON ar.user_id = u.id
JOIN organizations o ON ar.organization_id = o.id
ORDER BY ar.created_at DESC;
```

## Future Enhancement Ideas

1. **Analytics Dashboard**:
   - Average rating per article
   - Average rating per classification type (Threat/Opportunity/Neutral)
   - Most/least helpful articles
   - Rating trends over time

2. **Display Ratings**:
   - Show average rating in article list
   - Show rating count badge
   - Display user's own rating in article detail

3. **Filtering**:
   - Filter articles by rating threshold
   - Sort by highest/lowest rated

4. **Admin View**:
   - Export all ratings to CSV
   - Review low-rated classifications
   - Identify problematic classifications

5. **Notifications**:
   - Alert admins when classification receives low rating
   - Thank users for providing feedback

## Technical Notes

- **Multi-tenant**: Ratings are scoped to organization, so different organizations can rate the same article independently
- **Upsert logic**: Uses PostgreSQL's `ON CONFLICT ... DO UPDATE` for updating existing ratings
- **Validation**: Both client-side (disabled button) and server-side (API validation)
- **Toast notifications**: Uses Sonner for user feedback
- **Accessibility**: Keyboard navigation and focus states on star buttons
- **Performance**: Indexed columns for fast queries

## Testing Checklist

- [ ] Can rate an article (1-10 stars)
- [ ] Can add optional review text
- [ ] Rating submission shows success toast
- [ ] Modal closes after successful submission
- [ ] Cannot submit without selecting a rating
- [ ] Can update existing rating for same article
- [ ] Review text respects 500 character limit
- [ ] Character counter updates correctly
- [ ] Cancel button clears form and closes modal
- [ ] Loading state shows during submission
- [ ] Error handling works (network errors, validation errors)
- [ ] Works for all article types (regular, PDF uploads)
- [ ] Multi-tenant: Users only see their own ratings
