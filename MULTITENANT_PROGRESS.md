# Multi-Tenant Migration Progress

## ✅ Completed Tasks

### 1. **Database Schema Design** ✓
Created a proper multi-tenant database architecture:
- **organizations** table - Stores company information and business context
- **article_classifications** table - Junction table linking articles to organizations
- **Updated users** table - Links users to their organization

### 2. **Database Migrations** ✓
Successfully ran all migrations on Neon database branch:
- Created organizations table
- Updated users table with `organization_id` foreign key
- Created article_classifications table
- Migrated existing Biclou Prestige data
- Cleaned up old columns from articles table

### 3. **Python Classification Scripts** ✓
Created multi-tenant versions:
- `LLM_multitenant.py` - Classifies articles for ALL organizations
- `fetch-data-and-write-to-db_multitenant.py` - Fetches articles (organization-agnostic)
- Each organization gets their own classifications using their specific company context

### 4. **Authentication System** ✓
Updated auth to support multi-tenancy:
- Added `organizationId` to TypeScript types
- Updated auth.ts to fetch and include `organization_id` in session
- Session now contains: `{user: {id, username, organizationId}}`

### 5. **Main Articles API** ✓
Updated `/api/articles` route:
- Now filters by logged-in user's `organization_id`
- Uses JOIN with `article_classifications` table
- Users only see classifications for their organization

---

## 🔄 Remaining Tasks

### 6. **Update Other API Routes**
These routes still need to be updated to filter by organization:

#### Critical (Must Update):
- [ ] `/api/stats/route.ts` - Dashboard statistics
- [ ] `/api/chart-data/route.ts` - Charts and graphs
- [ ] `/api/activity-data/route.ts` - Activity feed
- [ ] `/api/articles/[id]/star/route.ts` - Star/unstar articles
- [ ] `/api/articles/[id]/route.ts` - Individual article details

#### Optional (May Need Updates):
- [ ] `/api/summaries/*` - Weekly summaries
- [ ] `/api/upload-article/route.ts` - Manual article upload
- [ ] `/api/upload-pdf/route.ts` - PDF upload

---

## 📋 Pattern for Updating API Routes

All API routes that query `article_classifications` need to follow this pattern:

```typescript
import { auth } from '@/auth'

export async function GET(request: NextRequest) {
  // 1. Get session
  const session = await auth()

  // 2. Check authentication
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // 3. Get organization ID
  const organizationId = session.user.organizationId

  if (!organizationId) {
    return NextResponse.json(
      { error: 'User not associated with organization' },
      { status: 403 }
    )
  }

  // 4. Query with organization filter
  const sql = `
    SELECT ...
    FROM articles a
    INNER JOIN article_classifications ac
      ON a.id = ac.article_id
    WHERE ac.organization_id = $1
  `

  const result = await query(sql, [organizationId])
  // ...
}
```

---

## 🧪 Testing Checklist

Before deploying to production:

- [ ] Test login with existing users
- [ ] Verify users see only their organization's data
- [ ] Test all dashboard pages load correctly
- [ ] Run Python classifier scripts on test data
- [ ] Add a second test organization and verify data isolation
- [ ] Check that starred articles work
- [ ] Verify charts and stats show correct data
- [ ] Test weekly summaries generation

---

## 🚀 Next Steps

### Immediate (Do Now):
1. **Update remaining API routes** using the pattern above
2. **Test the application** with your existing user
3. **Fix any errors** that come up

### Soon:
1. **Run the Python scripts** to classify new articles
2. **Add automation** (cron/GitHub Actions) for periodic classification
3. **Create second test organization** to verify multi-tenancy works

### Later:
1. **Merge database branch** to main once tested
2. **Deploy to production**
3. **Create admin interface** for managing organizations

---

## 📊 Database Structure (Visual Reference)

```
┌──────────────────────┐
│   ORGANIZATIONS      │
│──────────────────────│
│ id (PK)              │◄───┐
│ name                 │    │
│ company_context      │    │
│ is_active            │    │
└──────────────────────┘    │
         ▲                  │
         │                  │
         │             ┌────┴─────────────┐
         │             │   USERS          │
         │             │──────────────────│
         │             │ id (PK)          │
         │             │ username         │
         │             │ organization_id  │ (FK)
         │             └──────────────────┘
         │
┌────────┴──────────────────────┐
│ ARTICLE_CLASSIFICATIONS       │
│───────────────────────────────│
│ id (PK)                       │
│ article_id (FK) ──────────────┼──────┐
│ organization_id (FK)          │      │
│ classification                │      │
│ explanation                   │      │
│ advice                        │      │
│ status                        │      │
│ starred                       │      │
│                               │      │
│ UNIQUE(article_id, org_id)    │      │
└───────────────────────────────┘      │
                                       ▼
                              ┌────────────────────┐
                              │   ARTICLES         │
                              │────────────────────│
                              │ id (PK)            │
                              │ title              │
                              │ link (UNIQUE)      │
                              │ summary            │
                              │ source             │
                              │ date_published     │
                              └────────────────────┘
```

---

## 💡 Key Concepts to Remember

### 1. **Articles are Shared**
- One article in the `articles` table
- Multiple classifications in `article_classifications` (one per organization)

### 2. **Classifications are Per-Organization**
- Same article can be "Threat" for one org, "Neutral" for another
- Each uses their own company_context for classification

### 3. **Users See Only Their Organization's Data**
- Session contains `organization_id`
- All queries filter by `WHERE ac.organization_id = $1`

### 4. **Adding New Organizations is Easy**
1. Insert into `organizations` table
2. Create users linked to that organization
3. Run `LLM_multitenant.py` - automatically classifies for new org!

---

## 🆘 Troubleshooting

### "User is not associated with an organization"
**Cause:** User's `organization_id` is NULL
**Fix:** Run this SQL:
```sql
UPDATE users
SET organization_id = (SELECT id FROM organizations WHERE name = 'Biclou Prestige')
WHERE organization_id IS NULL;
```

### "Articles not showing up"
**Cause:** No classifications exist for this organization yet
**Fix:** Run `LLM_multitenant.py` to classify articles

### "TypeScript errors about organizationId"
**Cause:** Session type not updated
**Fix:** Restart your dev server (`pnpm run dev`)

---

## 📁 Files Modified

### Database:
- `migrations/001_create_organizations_table.sql`
- `migrations/002_update_users_table.sql`
- `migrations/003_create_article_classifications_table.sql`
- `migrations/RUN_THIS_COMPLETE_MIGRATION.sql`

### Python (thesis-classifier):
- `LLM_multitenant.py` (NEW)
- `fetch-data-and-write-to-db_multitenant.py` (NEW)
- `MULTITENANT_README.md` (NEW)

### Dashboard (thesis-dashboard):
- `types/next-auth.d.ts` - Added `organizationId`
- `auth.ts` - Fetch and include `organization_id` in session
- `app/api/articles/route.ts` - Filter by organization

### To Update:
- `app/api/stats/route.ts`
- `app/api/chart-data/route.ts`
- `app/api/activity-data/route.ts`
- `app/api/articles/[id]/star/route.ts`
- `app/api/articles/[id]/route.ts`

---

## 🎓 What You've Learned

1. **Multi-tenant architecture** - One app serving multiple isolated customers
2. **Database design** - Junction tables, foreign keys, data isolation
3. **Authentication context** - Storing organization info in session
4. **Query filtering** - Using JOINs and WHERE clauses for data isolation
5. **Migration strategies** - Safely transforming existing data

Great work so far! 🚀
