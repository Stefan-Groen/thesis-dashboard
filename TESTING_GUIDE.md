# Multi-Tenant Implementation - Testing Guide

## 🎉 Congratulations!

You've successfully migrated your dashboard from single-tenant to multi-tenant architecture! All the core components have been updated.

---

## ✅ What's Been Completed

### Database ✓
- [x] Organizations table created
- [x] Users linked to organizations
- [x] Article classifications table created (many-to-many)
- [x] Existing data migrated to Biclou Prestige organization
- [x] Old columns removed from articles table

### Backend ✓
- [x] Python classification scripts updated (LLM_multitenant.py)
- [x] Fetch script updated (organization-agnostic)
- [x] Authentication includes organization_id in session
- [x] All critical API routes filter by organization

### API Routes Updated ✓
- [x] `/api/articles` - Main article listing
- [x] `/api/stats` - Dashboard statistics
- [x] `/api/chart-data` - Trend charts
- [x] `/api/activity-data` - Activity timeline
- [x] `/api/articles/[id]/star` - Star/unstar functionality
- [x] `/api/articles/[id]` - Delete article

---

## 🧪 Testing Checklist

### 1. **Start the Development Server**

```bash
cd /Users/stefan/Documents/thesis-dashboard
pnpm run dev
```

The server should start on http://localhost:3000

---

### 2. **Test Authentication**

**Test Login:**
```
1. Go to http://localhost:3000/login
2. Log in with your existing credentials
3. Check browser console - should see: "✅ Login successful for user: [username] (Organization ID: 1)"
```

**Expected:** Login should work normally

**If it fails:** Check that your user has `organization_id` set in the database

---

### 3. **Test Dashboard Pages**

Go through each dashboard page and verify data loads:

**Pages to Test:**
- [ ] `/dashboard` - Main dashboard
- [ ] `/dashboard/articles` - All articles
- [ ] `/dashboard/threats` - Threat articles
- [ ] `/dashboard/opportunities` - Opportunity articles
- [ ] `/dashboard/neutral` - Neutral articles
- [ ] `/dashboard/starred` - Starred articles

**Expected:** All pages should load and show your existing article classifications

**If pages are empty:**
- Check browser console for errors
- Verify database has data in `article_classifications` table

---

### 4. **Test Article Operations**

**Star an Article:**
```
1. Go to /dashboard/articles
2. Click the star icon on any article
3. Verify the star toggles on/off
4. Go to /dashboard/starred
5. Verify starred article appears there
```

**Expected:** Starring should work normally

---

### 5. **Test Dashboard Statistics**

**Check Stats Card:**
```
1. Go to /dashboard
2. Look at the statistics cards (Total Articles, Threats, Opportunities, etc.)
3. Numbers should match your existing data
```

**Expected:** Statistics should show correct counts for your organization

---

### 6. **Test Charts**

**Classification Trend Chart:**
```
1. Go to /dashboard
2. Scroll to the classification trend bar chart
3. Verify it shows threat/opportunity data over time
```

**Activity Chart:**
```
1. Check the activity chart
2. Should show articles published vs classified
```

**Expected:** Charts should display data correctly

---

### 7. **Verify Data Isolation (Critical!)**

This is the most important test for multi-tenancy.

**Verify Organization ID is Used:**
```
1. Open browser DevTools (F12)
2. Go to Network tab
3. Navigate to /dashboard/articles
4. Click on the "articles?..." request
5. In Preview/Response, check the returned articles
6. All should belong to your organization
```

**Database Check:**
```sql
-- Run this in Neon SQL Editor
SELECT
  ac.organization_id,
  COUNT(*) as classification_count
FROM article_classifications ac
GROUP BY ac.organization_id;
```

**Expected:** Should show organization_id = 1 with your article count

---

## 🐛 Common Issues & Solutions

### Issue 1: "User is not associated with an organization"

**Cause:** User's `organization_id` is NULL

**Fix:**
```sql
-- Check current users
SELECT id, username, organization_id FROM users;

-- Update if needed
UPDATE users
SET organization_id = 1
WHERE organization_id IS NULL;
```

---

### Issue 2: No Articles Showing

**Cause:** No classifications exist for your organization

**Check:**
```sql
SELECT COUNT(*) FROM article_classifications WHERE organization_id = 1;
```

**Fix:**
- Should have classifications from the migration
- If zero, the migration might have failed
- Check migration logs

---

### Issue 3: TypeScript Errors

**Cause:** Session types not recognized

**Fix:**
```bash
# Restart the dev server
# Press Ctrl+C to stop
pnpm run dev
```

---

### Issue 4: Chart Data Not Showing

**Cause:** Date range might be outside your data

**Check:**
```sql
-- Check article dates
SELECT
  MIN(date_published) as oldest,
  MAX(date_published) as newest
FROM articles;
```

**Fix:** Adjust the date range in the dashboard or add more recent test data

---

## 🚀 Next Steps

### Immediate (Do Now):

1. **Run the tests above** ✓
2. **Fix any issues** you encounter
3. **Verify everything works** before proceeding

### Soon:

4. **Test Python Classification Scripts:**
   ```bash
   cd /Users/stefan/Documents/thesis-classifier

   # Test fetch (should work as before)
   python3 fetch-data-and-write-to-db_multitenant.py

   # Test classification (should classify for all orgs)
   python3 LLM_multitenant.py
   ```

5. **Add a Second Test Organization:**
   ```sql
   -- Add test organization
   INSERT INTO organizations (name, company_context, is_active)
   VALUES (
     'Test Company',
     'A test company for verification purposes',
     true
   );

   -- Create test user
   INSERT INTO users (username, password_hash, organization_id, full_name)
   VALUES (
     'testuser',
     '$2b$10$...', -- Use your hash generation method
     (SELECT id FROM organizations WHERE name = 'Test Company'),
     'Test User'
   );
   ```

6. **Run classifier again:**
   ```bash
   python3 LLM_multitenant.py
   ```
   - Should classify all articles for BOTH organizations
   - Each org gets their own classifications

7. **Login as test user:**
   - Should only see Test Company's classifications
   - Should NOT see Biclou Prestige classifications

### Later:

8. **Merge database branch to main** (after thorough testing)
9. **Deploy to Vercel** (production)
10. **Set up automation** (GitHub Actions for periodic classification)
11. **Add admin interface** (manage organizations, users)

---

## 📊 Success Criteria

Before deploying to production, verify:

- [ ] ✅ Existing users can log in
- [ ] ✅ Dashboard loads with correct data
- [ ] ✅ Statistics show accurate counts
- [ ] ✅ Charts display properly
- [ ] ✅ Star/unstar works
- [ ] ✅ Delete article works
- [ ] ✅ No errors in browser console
- [ ] ✅ No errors in server logs
- [ ] ✅ Multiple organizations work independently
- [ ] ✅ Users only see their organization's data
- [ ] ✅ Python scripts classify for all organizations

---

## 🎓 What You've Learned

Through this migration, you've learned:

1. **Multi-tenant database design** - Separating data while sharing infrastructure
2. **Data normalization** - Junction tables, foreign keys
3. **Authentication context** - Storing and using organization info in sessions
4. **Query filtering** - Using JOINs and WHERE clauses for data isolation
5. **Database migrations** - Safely transforming existing data structures
6. **Full-stack development** - Database → Backend → Frontend changes

**This is production-grade architecture!** 🚀

---

## 🆘 Need Help?

If you encounter issues:

1. **Check browser console** for errors
2. **Check server logs** (`pnpm run dev` output)
3. **Check database** with SQL queries
4. **Review MULTITENANT_PROGRESS.md** for context

Common debugging queries:

```sql
-- Check organizations
SELECT * FROM organizations;

-- Check users and their organizations
SELECT u.username, u.organization_id, o.name as org_name
FROM users u
LEFT JOIN organizations o ON u.organization_id = o.id;

-- Check article classifications count per org
SELECT
  o.name,
  COUNT(ac.id) as classification_count
FROM organizations o
LEFT JOIN article_classifications ac ON o.id = ac.organization_id
GROUP BY o.name;

-- Check a specific article's classifications
SELECT
  a.title,
  o.name as organization,
  ac.classification,
  ac.starred
FROM articles a
JOIN article_classifications ac ON a.id = ac.article_id
JOIN organizations o ON ac.organization_id = o.id
WHERE a.id = 1; -- Replace with actual article ID
```

---

Good luck with testing! You've done an amazing job implementing this complex feature. 🎉
