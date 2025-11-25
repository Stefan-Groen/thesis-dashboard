# Rating Feature Updates - View & Edit Existing Ratings

## New Features Added

### 1. View Existing Ratings
Users can now see their previous ratings when clicking "Rate Classification" again:
- Rating stars are pre-filled with the user's previous rating
- Review text is loaded and displayed
- Can update both rating and review text

### 2. Visual Indicator for Rated Articles
The "Rate Classification" button now shows:
- **Yellow filled star** (⭐) - Article has been rated by the user
- **Gray outline star** (☆) - Article not yet rated

### 3. Update Existing Ratings
Users can modify their ratings:
- Change star rating (1-10)
- Update review text
- Submit updates with the same button
- Success toast confirms the update

## Implementation Details

### Frontend Changes ([components/filtered-articles-table.tsx](components/filtered-articles-table.tsx))

#### New State Variables
```typescript
const [isLoadingRating, setIsLoadingRating] = React.useState(false)
const [existingRatings, setExistingRatings] = React.useState<Record<number, { rating: number; review: string | null }>>({})
```

#### New Function: `loadExistingRating()`
- Called when rating modal opens
- Fetches user's existing rating via GET API
- Caches result in state to avoid repeated API calls
- Shows loading state while fetching

#### Updated Button
```tsx
<Button variant="outline" size="sm" onClick={() => {
  setShowRatingModal(true)
  if (selectedArticle) {
    loadExistingRating(selectedArticle.id)
  }
}}>
  {selectedArticle && existingRatings[selectedArticle.id] ? (
    <IconStarFilled className="size-4 mr-2 text-yellow-500" />
  ) : (
    <IconStar className="size-4 mr-2" />
  )}
  Rate Classification
</Button>
```

#### Modal Loading State
Shows "Loading your rating..." while fetching existing rating from API.

### Backend Changes ([app/api/articles/ratings/route.ts](app/api/articles/ratings/route.ts))

#### New GET Method
```typescript
GET /api/articles/ratings?articleId=123
```

**Response** (if rating exists):
```json
{
  "rating": {
    "id": 1,
    "rating": 8,
    "review": "Very helpful classification",
    "created_at": "2024-11-24T10:30:00Z",
    "updated_at": "2024-11-24T10:30:00Z"
  }
}
```

**Response** (if no rating):
```json
{
  "rating": null
}
```

**Features**:
- Queries `article_ratings` table for user's existing rating
- Scoped to current user and organization
- Returns null if no rating found (first-time rating)

## User Experience Flow

### First-Time Rating
1. User opens article → clicks "Rate Classification" (gray star)
2. Modal opens with empty form (shows brief loading state)
3. User selects rating and adds review
4. Submits → Success toast
5. Button star turns **yellow** ⭐
6. Rating cached in memory

### Updating Existing Rating
1. User opens article → sees yellow star ⭐ on "Rate Classification" button
2. Clicks button → Modal opens with loading indicator
3. Previous rating and review are loaded and displayed
4. User can modify rating/review
5. Submits → Success toast: "Rating submitted successfully!"
6. Updated rating cached in memory

### State Management
- Ratings are cached in component state after first load
- Avoids unnecessary API calls for same article
- Updates cache after successful submission
- Cache persists while component is mounted

## Technical Notes

### Performance Optimization
- **Caching**: Ratings cached in `existingRatings` state
- **Conditional Loading**: Only fetches if not already cached
- **Optimistic Updates**: Button shows yellow star immediately after submission

### Error Handling
- API errors show console logs (silent failure for GET)
- Submit errors show toast notification
- Loading states prevent multiple submissions

### Multi-Tenant Safety
- GET endpoint filters by user ID and organization ID
- POST endpoint uses upsert (UPDATE if exists, INSERT if new)
- Each user per organization can have one rating per article

## Testing Checklist

- [x] Can view existing rating when reopening modal
- [x] Button shows yellow star after rating
- [x] Can update existing rating
- [x] Can update existing review text
- [x] Loading state shows while fetching
- [x] Cache works (no duplicate API calls for same article)
- [x] Yellow star persists across modal opens
- [x] Works for articles without prior rating (empty form)
- [x] Error handling works gracefully
- [x] Build succeeds without errors

## Files Modified

### Updated
- ✏️ `components/filtered-articles-table.tsx`
  - Added `loadExistingRating()` function
  - Added state for loading and caching ratings
  - Updated "Rate Classification" button with conditional star
  - Added loading state to modal
  - Updated `submitRating()` to update cache

- ✏️ `app/api/articles/ratings/route.ts`
  - Added GET method to retrieve existing ratings
  - Returns user's rating or null if none exists

### Created
- ✨ `RATING_FEATURE_UPDATE.md` - This documentation

## Visual Changes

### Before
- Rate Classification button always had gray star
- No indication if article was rated
- Empty form every time

### After
- **Gray star (☆)**: Not rated yet
- **Yellow star (⭐)**: Already rated
- Form pre-filled with previous rating/review
- Clear visual feedback

## Future Enhancements

1. **Show rating in article list**
   - Add rating badge next to article title
   - Show user's rating at a glance

2. **Batch rating load**
   - Load all user ratings on page load
   - Pre-populate yellow stars for entire list

3. **Rating history**
   - Track all rating changes over time
   - Show when rating was last updated

4. **Edit timestamp display**
   - Show "Last rated: 2 days ago" in modal
   - Help users remember when they rated

5. **Rating summary**
   - Show "You've rated 15 articles" in profile
   - Personal rating statistics
