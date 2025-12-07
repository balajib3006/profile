# Deploying to Vercel

This guide walks you through deploying your portfolio to Vercel with PostgreSQL database persistence.

## Prerequisites

- GitHub account with your portfolio repository
- Vercel account ([sign up free](https://vercel.com/signup))
- Node.js 18+ installed locally

## Step 1: Install Vercel CLI

```bash
npm install -g vercel
```

## Step 2: Login to Vercel

```bash
vercel login
```

Follow the prompts to authenticate with your Vercel account.

## Step 3: Deploy to Vercel

From your project directory:

```bash
vercel
```

The CLI will ask you several questions:
- **Set up and deploy?** → Yes
- **Which scope?** → Select your account
- **Link to existing project?** → No (first time) or Yes (subsequent deployments)
- **Project name?** → Accept default or enter custom name
- **Directory?** → `.` (current directory)
- **Override settings?** → No

Vercel will deploy your app and provide a URL like: `https://your-app.vercel.app`

## Step 4: Add Vercel Postgres Database

### Option A: Vercel Dashboard (Recommended)

1. Go to your project at [vercel.com](https://vercel.com/dashboard)
2. Click on your project
3. Go to **Storage** tab
4. Click **Create Database**
5. Select **Postgres**
6. Choose **Continue** (free tier available)
7. Accept the terms and click **Create**

Vercel will automatically:
- Create the PostgreSQL database
- Set environment variables (`POSTGRES_URL`, `POSTGRES_PRISMA_URL`, etc.)
- Redeploy your application

### Option B: Use External PostgreSQL

If you prefer an external database (Railway, Supabase, Neon):

1. Create a PostgreSQL database on your chosen platform
2. Get the connection string
3. In Vercel dashboard → **Settings** → **Environment Variables**
4. Add: `DATABASE_URL` = `postgresql://user:pass@host:port/db`
5. Redeploy the application

## Step 5: Configure Environment Variables

In Vercel dashboard → **Settings** → **Environment Variables**, add:

| Variable | Value | Environment |
|----------|-------|-------------|
| `NODE_ENV` | `production` | Production |
| `SESSION_SECRET` | Generate random string | Production, Preview, Development |
| `FRONTEND_URL` | Your Vercel app URL | Production |
| `ALLOWED_ORIGINS` | Your Vercel app URL | Production |

**Generate a secure session secret:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Step 6: Redeploy

After adding environment variables:

```bash
vercel --prod
```

Or trigger a redeploy from the Vercel dashboard.

## Step 7: Verify Deployment

1. **Visit your site**: `https://your-app.vercel.app`
2. **Test the portfolio**: Check if data loads correctly
3. **Test admin panel**: Navigate to `/admin/login.html`
4. **Login**: Use default credentials (username: `admin`, password: `admin123`)
5. **Check database**: Create/edit content in admin panel

## Step 8: Update Admin Password

> **⚠️ IMPORTANT**: Change the default admin password immediately!

1. Login to admin panel
2. Navigate to settings/profile
3. Change password to something secure

## Monitoring and Logs

### View Logs

In Vercel dashboard:
- Go to your project
- Click **Deployments**
- Click on a deployment
- Click **Functions** → **View Logs**

### Common Issues

**Database connection errors:**
- Verify `POSTGRES_URL` or `DATABASE_URL` is set correctly
- Check database is running and accessible
- Ensure IP whitelist includes Vercel's IPs (if using external DB)

**CORS errors:**
- Update `ALLOWED_ORIGINS` to include your Vercel URL
- Update `FRONTEND_URL` environment variable
- Redeploy after changing variables

**Session issues:**
- Verify `SESSION_SECRET` is set
- Check cookie settings in `server.js`

**File upload issues:**
- Vercel's filesystem is ephemeral
- Consider using cloud storage (Cloudinary, S3, etc.)
- See [File Storage Guide](#file-storage-optional) below

## File Storage (Optional)

For persistent file uploads, integrate cloud storage:

### Cloudinary (Recommended)

1. Sign up at [cloudinary.com](https://cloudinary.com)
2. Get API credentials
3. Add environment variables:
   ```
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   ```
4. Update multer configuration to use Cloudinary

### AWS S3

1. Create S3 bucket
2. Get AWS credentials
3. Add environment variables and update multer config

## Continuous Deployment

Vercel automatically deploys when you push to your GitHub repository:

1. Go to Vercel dashboard → **Settings** → **Git**
2. Connect your GitHub repository
3. Configure:
   - **Production Branch**: `main` (or your default branch)
   - **Install Command**: `npm install`
   - **Build Command**: Leave empty (using serverless functions)
   - **Output Directory**: Leave empty

Now every push to `main` triggers automatic deployment!

## Custom Domain (Optional)

1. Go to project **Settings** → **Domains**
2. Click **Add**
3. Enter your domain name
4. Follow DNS configuration instructions
5. Wait for SSL certificate provisioning

## Performance Optimization

### Enable Edge Caching

In `vercel.json`, you can add caching rules:

```json
{
  "headers": [
    {
      "source": "/public/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

### Database Connection Pooling

Vercel Postgres automatically provides connection pooling. If using external PostgreSQL, ensure connection pooling is enabled.

## Troubleshooting

### Check Function Logs
```bash
vercel logs <deployment-url> --follow
```

### Test Locally with Vercel Dev
```bash
vercel dev
```

This runs your app locally using Vercel's serverless environment.

### Environment Variables Not Working

- Ensure they're set for the correct environment (Production/Preview/Development)
- Redeploy after adding variables
- Check spelling and formatting

## Cost Considerations

**Vercel Free Tier:**
- 100 GB bandwidth/month
- Serverless function execution
- Unlimited deployments

**Vercel Postgres:**
- Free tier: 256 MB storage, 60 hours compute/month
- Hobby: $20/month for more resources

Monitor usage in **Settings** → **Usage**.

## Support

- [Vercel Documentation](https://vercel.com/docs)
- [Vercel Postgres Docs](https://vercel.com/docs/storage/vercel-postgres)
- [Vercel Community](https://github.com/vercel/vercel/discussions)

---

**Next Steps:**
- Set up custom domain
- Configure cloud file storage
- Add monitoring (Sentry, LogRocket)
- Set up automated backups for database
