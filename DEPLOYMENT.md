# GitHub Deployment Guide

## Quick Start Guide for GitHub Hosting

This guide will help you deploy your portfolio to GitHub with proper backend hosting.

## Deployment Architecture

Your portfolio has two parts:
1. **Frontend** (HTML/CSS/JS) - Can be hosted on GitHub Pages
2. **Backend** (Node.js API + Admin Panel) - Needs to be hosted on a cloud platform

## Step 1: Push to GitHub

1. **Initialize Git repository** (if not already done)
   ```bash
   cd "d:\Projects\My portfolio\profile\profile"
   git init
   git add .
   git commit -m "Initial commit: Portfolio with admin panel"
   ```

2. **Create GitHub repository**
   - Go to [github.com/new](https://github.com/new)
   - Name it `portfolio`
   - Don't initialize with README (we already have one)
   - Click "Create repository"

3. **Push to GitHub**
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/portfolio.git
   git branch -M main
   git push -u origin main
   ```

## Step 2: Deploy Backend to Render

### Why Render?
- Free tier available
- Automatic deployments from GitHub
- Supports Node.js  
- Easy environment variable management

### Deployment Steps:

1. **Create Render account**
   - Go to [render.com](https://render.com)
   - Sign up with your GitHub account

2. **Create Web Service**
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Select `portfolio` repository

3. **Configure Service**
   ```
   Name: portfolio-backend
   Environment: Node
   Build Command: npm install
   Start Command: npm start
   ```

4. **Add Environment Variables**
   ```
   NODE_ENV=production
   SESSION_SECRET=<click Generate>
   ALLOWED_ORIGINS=http://localhost:3000,https://YOUR_USERNAME.github.io
   ```

5. **Deploy**
   - Click "Create Web Service"
   - Wait for deployment (takes 2-3 minutes)
   - Note your backend URL: `https://portfolio-backend-xxxx.onrender.com`

## Step 3: Update Frontend with Backend URL

1. **Create config file** in `public/` and `admin/js/`

   Create `public/config.js`:
   ```javascript
   window.API_URL = 'https://portfolio-backend-xxxx.onrender.com/api';
   ```

   Create `admin/js/config.js`:
   ```javascript
   window.API_URL = 'https://portfolio-backend-xxxx.onrender.com/api';
   ```

2. **Include config in HTML files**

   In `public/index.html` before `script.js`:
   ```html
   <script src="config.js"></script>
   <script src="script.js"></script>
   ```

   In all admin HTML files before `admin.js`:
   ```html
   <script src="/admin/js/config.js"></script>
   <script src="/admin/js/admin.js"></script>
   ```

3. **Push changes**
   ```bash
   git add .
   git commit -m "Add production API URL"
   git push
   ```

## Step 4: Enable GitHub Pages (Optional - Public Portfolio Only)

If you want to also host the public portfolio on GitHub Pages:

1. **Go to repository settings**
   - Settings → Pages
   - Source: Deploy from `main` branch
   - Folder: `/ (root)`
   - Save

2. **Access your site**
   - URL: `https://YOUR_USERNAME.github.io/portfolio/`

> **Note:** GitHub Pages can host the frontend, but the admin panel features will still use the Render backend API.

## Alternative: Deploy Everything to Render

Instead of using GitHub Pages, you can host everything on Render:

1. Follow Step 2 above
2. Your app will be at: `https://portfolio-backend-xxxx.onrender.com`
3. Public portfolio: `https://portfolio-backend-xxxx.onrender.com/`
4. Admin panel: `https://portfolio-backend-xxxx.onrender.com/admin/login.html`

No need to update API URLs since everything is on the same domain!

## Post-Deployment Checklist

- [ ] Change default admin password via admin panel
- [ ] Test all admin panel features
- [ ] Test login/logout functionality
- [ ] Verify public portfolio loads correctly
- [ ] Test contact form (if implemented)
- [ ] Check mobile responsiveness
- [ ] Test in different browsers

## Updating Your Site

After making changes:

```bash
git add .
git commit -m "Description of changes"
git push
```

Render will automatically redeploy your backend within 1-2 minutes.

## Troubleshooting

### "Method Not Allowed" errors
- Check that `ALLOWED_ORIGINS` includes your GitHub Pages domain
- Verify `API_URL` is set correctly in config files

### "Not authenticated" errors
- Check that cookies are enabled
- Ensure `secure: true` in session config only for HTTPS

### Database resets on deployment
- Render free tier resets disk on restart
- Upgrade to paid tier for persistent storage
- Or use PostgreSQL database (see below)

## Upgrade to PostgreSQL (Recommended for Production)

1. **Create PostgreSQL database on Render**
   - New → PostgreSQL
   - Note the connection string

2. **Update `DATABASE_URL` environment variable**
   - Add to Render service
   - Update `database.js` to use PostgreSQL

3. **Install pg package**
   ```bash
   npm install pg
   ```

## Need Help?

- Render Docs: [render.com/docs](https://render.com/docs)
- GitHub Pages: [pages.github.com](https://pages.github.com)

---

**Your Portfolio URLs:**
- Backend API: `https://portfolio-backend-xxxx.onrender.com`
- Admin Panel: `https://portfolio-backend-xxxx.onrender.com/admin/login.html`
- Public Portfolio: `https://YOUR_USERNAME.github.io/portfolio/` (if using GitHub Pages)

