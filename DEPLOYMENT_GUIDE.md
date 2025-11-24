# Vercel Deployment Guide

This guide will help you deploy your Article Classification Dashboard to Vercel.

## ✅ Pre-Deployment Checklist

Your application is **ready for deployment**! The build test passed successfully.

### What We've Verified:
- ✅ Next.js configuration is correct
- ✅ Build process completes successfully
- ✅ All dependencies are properly configured
- ✅ Database connection is set up for production (SSL enabled)
- ✅ Authentication is configured
- ✅ Loading states are implemented for all pages
- ✅ Environment variables are documented

## 📋 Required Environment Variables

You'll need to configure these in Vercel:

### 1. DATABASE_URL
Your PostgreSQL connection string. Format:
```
postgresql://username:password@host:port/database
```

**For Production**: Use a hosted PostgreSQL service like:
- [Vercel Postgres](https://vercel.com/docs/storage/vercel-postgres)
- [Neon](https://neon.tech/) (recommended - free tier available)
- [Supabase](https://supabase.com/)
- [Railway](https://railway.app/)

### 2. AUTH_SECRET
A secure random string for NextAuth.js encryption.

**Generate it with**:
```bash
openssl rand -base64 32
```

### 3. CHUTES_API_KEY
Your Chutes API key for AI-powered summaries.

## 🚀 Deployment Steps

### Step 1: Prepare Your Database

1. **Choose a PostgreSQL provider** (e.g., Neon, Supabase, or Vercel Postgres)

2. **Create a new PostgreSQL database**

3. **Run your migrations** (if you have migration files):
   ```bash
   # Connect to your production database
   psql "your-production-database-url"

   # Run migration files
   \i migrations/001_create_organizations_table.sql
   \i migrations/002_update_users_table.sql
   # ... etc
   ```

4. **Or import your existing schema**:
   ```bash
   pg_dump your-local-db > schema.sql
   psql "your-production-database-url" < schema.sql
   ```

### Step 2: Push to GitHub

1. **Initialize git** (if not already done):
   ```bash
   git init
   git add .
   git commit -m "Initial commit - ready for deployment"
   ```

2. **Create a GitHub repository** at https://github.com/new

3. **Push your code**:
   ```bash
   git remote add origin https://github.com/yourusername/your-repo-name.git
   git branch -M main
   git push -u origin main
   ```

### Step 3: Deploy to Vercel

1. **Go to** [https://vercel.com/new](https://vercel.com/new)

2. **Import your GitHub repository**

3. **Configure your project**:
   - Framework Preset: **Next.js** (auto-detected)
   - Root Directory: `./` (leave as default)
   - Build Command: `pnpm build` (auto-detected)
   - Output Directory: `.next` (auto-detected)

4. **Add Environment Variables**:

   Click "Environment Variables" and add:

   ```
   DATABASE_URL=postgresql://user:pass@host:5432/db
   AUTH_SECRET=your-generated-secret-here
   CHUTES_API_KEY=your-chutes-key-here
   ```

   **Important**: Make sure to add these for all environments (Production, Preview, Development)

5. **Click "Deploy"**

### Step 4: Post-Deployment

1. **Wait for deployment** (usually 2-3 minutes)

2. **Visit your deployed site** at `https://your-project.vercel.app`

3. **Test the login** with your existing credentials

4. **Create your first organization and user** using the scripts:
   ```bash
   # Set your production DATABASE_URL in .env.local
   DATABASE_URL="your-vercel-postgres-url" pnpm create-org
   DATABASE_URL="your-vercel-postgres-url" pnpm create-user
   ```

## 🔧 Troubleshooting

### Build Failures

If your build fails on Vercel:

1. **Check the build logs** in Vercel dashboard
2. **Verify all environment variables** are set correctly
3. **Make sure DATABASE_URL is accessible** from Vercel's servers
4. **Check if your database requires IP whitelisting** (add Vercel's IPs)

### Database Connection Issues

If you get database connection errors:

1. **Verify DATABASE_URL format** is correct
2. **Check SSL settings** - the code automatically enables SSL in production
3. **Whitelist Vercel IPs** if your database requires it
4. **Test connection** from Vercel's server region

### Authentication Issues

If login doesn't work:

1. **Verify AUTH_SECRET** is set in Vercel
2. **Check that users exist** in your production database
3. **Verify organizationId** is set for users in the database

### Performance Issues

If the app is slow:

1. **Use a database in the same region** as your Vercel deployment
2. **Enable connection pooling** (already configured in lib/db.ts)
3. **Consider upgrading** your database plan if needed

## 📊 Monitoring

Vercel provides built-in monitoring:

1. **Analytics**: View page views and visitor metrics
2. **Speed Insights**: Monitor Core Web Vitals (already integrated with `@vercel/speed-insights`)
3. **Logs**: View real-time function logs in the Vercel dashboard

## 🔐 Security Checklist

- ✅ `.env.local` is in `.gitignore` (never commit secrets!)
- ✅ AUTH_SECRET is strong and randomly generated
- ✅ Database uses SSL in production
- ✅ API routes are protected with authentication
- ✅ Admin routes require super admin access

## 📝 Post-Deployment Tasks

1. **Set up custom domain** (optional):
   - Go to Project Settings > Domains
   - Add your custom domain
   - Update DNS records

2. **Enable automatic deployments**:
   - Already configured! Every push to `main` triggers a deployment

3. **Set up preview deployments**:
   - Already configured! Every pull request gets a preview URL

4. **Configure production database backups**:
   - Set up automated backups in your database provider
   - Test restore procedure

## 🎉 Success!

Your dashboard is now live! You can:

- Access it at your Vercel URL
- Share it with your organization
- Monitor usage through Vercel Analytics
- Update by pushing to GitHub

## 🔄 Making Updates

To deploy updates:

```bash
git add .
git commit -m "Your update description"
git push origin main
```

Vercel will automatically build and deploy your changes.

## 📞 Support

If you encounter any issues:

1. Check Vercel build logs
2. Review the Troubleshooting section above
3. Check Next.js documentation: https://nextjs.org/docs
4. Check Vercel documentation: https://vercel.com/docs
