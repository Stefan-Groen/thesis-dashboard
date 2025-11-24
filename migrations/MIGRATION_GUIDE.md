# Multi-Tenant Migration Guide

This guide will walk you through migrating your dashboard from single-tenant to multi-tenant architecture.

## Overview

**What's changing:**
- Articles will be shared across all organizations
- Each organization will have their own classifications of articles
- Users will be linked to organizations and only see their organization's data

**Migration steps:**
1. Create organizations table
2. Update users table with foreign key to organizations
3. Create article_classifications table (the magic happens here!)
4. Migrate existing data
5. Clean up old columns

---

## Prerequisites

✅ **Before you start:**
- [ ] Backup created (Neon database branch) ✓ You already did this!
- [ ] Code backed up locally ✓ You already did this!
- [ ] Git branch created ✓ You already did this!
- [ ] `.env.local` updated with new Neon branch connection string

---

## Step-by-Step Migration

### Step 1: Run migrations 001-003

These create the new tables without touching existing data (safe to run).

```bash
# From the thesis-dashboard directory
cd /Users/stefan/Documents/thesis-dashboard

# Connect to your Neon database and run migrations
psql $DATABASE_URL -f migrations/001_create_organizations_table.sql
psql $DATABASE_URL -f migrations/002_update_users_table.sql
psql $DATABASE_URL -f migrations/003_create_article_classifications_table.sql
```

**Alternatively**, you can run these in the Neon SQL Editor:
1. Go to your Neon console
2. Select your branch
3. Open SQL Editor
4. Copy and paste each migration file
5. Execute

---

### Step 2: Add your organization

You need to insert your company information (Biclou Prestige) into the organizations table.

```sql
-- Insert Biclou Prestige organization
INSERT INTO organizations (name, company_context, is_active)
VALUES (
  'Biclou Prestige',
  'YOUR_COMPANY_CONTEXT_HERE',  -- We'll copy the content from company_case.txt
  true
)
RETURNING id;
```

**Note the `id` that gets returned!** You'll need it for the next steps.

Let me create a helper script for you that reads the company_case.txt and generates the SQL:

---

### Step 3: Link users to organization

Update all existing users to belong to Biclou Prestige:

```sql
-- Replace 1 with your actual organization_id from Step 2
UPDATE users
SET organization_id = 1
WHERE organization_id IS NULL;
```

---

### Step 4: Migrate existing classifications

Move all existing article classifications to the new table:

```sql
-- Replace 1 with your actual organization_id
INSERT INTO article_classifications (
  article_id,
  organization_id,
  classification,
  explanation,
  advice,
  reasoning,
  status,
  starred,
  classification_date,
  created_at
)
SELECT
  id,
  1,  -- Replace with your organization_id
  classification,
  explanation,
  advice,
  reasoning,
  status,
  starred,
  classification_date,
  NOW()
FROM articles
WHERE classification IS NOT NULL
ON CONFLICT (article_id, organization_id) DO NOTHING;
```

**Verify it worked:**
```sql
-- Check how many rows were migrated
SELECT COUNT(*) FROM article_classifications;

-- Should match:
SELECT COUNT(*) FROM articles WHERE classification IS NOT NULL;
```

---

### Step 5: Clean up articles table

⚠️ **WARNING:** Only run this after verifying Step 4 worked!

```bash
psql $DATABASE_URL -f migrations/005_cleanup_articles_table.sql
```

This removes the old classification columns from the articles table.

---

## Verification

After running all migrations, verify the structure:

```sql
-- Check organizations
SELECT * FROM organizations;

-- Check users are linked
SELECT username, organization_id FROM users;

-- Check article_classifications
SELECT COUNT(*), organization_id FROM article_classifications GROUP BY organization_id;

-- Check articles table structure
\d articles
```

---

## What's Next?

After the database migration is complete, you'll need to:

1. ✅ Update the Python classification scripts (LLM.py, etc.)
2. ✅ Update the dashboard API routes to filter by organization
3. ✅ Update the auth system to include organization_id in the session
4. ✅ Test everything!

---

## Rollback Plan

If something goes wrong, you can easily rollback:

1. **Neon Console** → Switch back to your main database branch
2. All your old data is safe!
3. No changes to production

---

## Need Help?

- Check that all migrations ran without errors
- Verify row counts match expectations
- Test with a single user login before deploying
