# Deploying to 000webhost and Similar Platforms

## Important: Platform Limitations

**000webhost** and most free traditional hosting platforms (like InfinityFree, Hostinger Free) support:
- ✅ Static HTML/CSS/JavaScript
- ✅ PHP
- ✅ MySQL databases
- ❌ **Node.js** (not supported)

## Deployment Options

### Option 1: Hybrid Deployment (Recommended)

**Frontend** → 000webhost (free)  
**Backend + Admin** → Render/Railway (free Node.js hosting)

This gives you the best of both worlds!

---

### Option 2: Full Static Site (No Admin Panel)

Convert your portfolio to a fully static site without the admin panel. Good for simple portfolios that don't need frequent updates.

---

## Option 1: Hybrid Deployment Setup

### Step 1: Deploy Backend to Render

Follow the main [DEPLOYMENT.md](file:///d:/Projects/My%20portfolio/profile/profile/DEPLOYMENT.md) guide to deploy your Node.js backend to Render.

**Backend URL Example:** `https://portfolio-backend-xxxx.onrender.com`

### Step 2: Create Production Config Files

Create `public/config.js`:
```javascript
// Production API configuration
window.API_URL = 'https://your-backend-url.onrender.com';
```

Create `admin/js/config.js`:
```javascript
// Production API configuration for admin
window.API_URL = 'https://your-backend-url.onrender.com';
```

### Step 3: Update HTML Files

Add config script **before** your main scripts:

**In `public/index.html`:**
```html
<!-- Add before </body> -->
<script src="config.js"></script>
<script src="script.js"></script>
```

**In all admin HTML files** (`admin/login.html`, `admin/dashboard.html`, etc.):
```html
<!-- Add before </body> -->
<script src="/admin/js/config.js"></script>
<script src="/admin/js/admin.js"></script>
```

### Step 4: Deploy to 000webhost

1. **Create Account**
   - Go to [000webhost.com](https://www.000webhost.com/)
   - Sign up for free account
   - Create a new website

2. **Upload Files via File Manager or FTP**

   **Files to Upload:**
   ```
   public/
   ├── index.html
   ├── style.css
   ├── script.js
   ├── config.js  (NEW - with your Render backend URL)
   └── assets/
   
   admin/
   ├── *.html
   ├── css/
   ├── js/
   │   ├── admin.js
   │   └── config.js  (NEW - with your Render backend URL)
   ```

   **DO NOT Upload:**
   - `node_modules/`
   - `server.js`
   - `routes/`
   - `database.js`
   - `.env`
   - Backend files

3. **File Structure on 000webhost:**
   ```
   public_html/
   ├── index.html (your public/index.html)
   ├── style.css
   ├── script.js
   ├── config.js
   ├── admin/
   │   ├── login.html
   │   ├── dashboard.html
   │   └── ...
   └── assets/
   ```

4. **Access Your Site:**
   - Public Portfolio: `https://yoursite.000webhostapp.com/`
   - Admin Panel: `https://yoursite.000webhostapp.com/admin/login.html`

### Step 5: Update CORS on Backend

Update your Render backend environment variables to allow your 000webhost domain:

```
ALLOWED_ORIGINS=https://yoursite.000webhostapp.com,https://www.yoursite.000webhostapp.com
```

---

## Option 2: Alternative Free Hosts Supporting Node.js

If you want everything in one place with Node.js support:

| Platform | Free Tier | Node.js | Pros | Cons |
|----------|-----------|---------|------|------|
| **Render** | ✅ | ✅ | Easy, auto-deploy from GitHub | Cold starts after inactivity |
| **Railway** | ✅ | ✅ | Fast, good free tier | Limited hours/month |
| **Vercel** | ✅ | ✅ | Excellent performance | Serverless (requires restructuring) |
| **Cyclic** | ✅ | ✅ | Simple, generous free tier | Newer platform |
| **Glitch** | ✅ | ✅ | Browser-based editor | Public projects only (free) |
| **Fly.io** | ✅ | ✅ | Good performance | Credit card required |

**Recommended:** Stick with **Render** for the backend!

---

## Option 3: Static Site Generator (Advanced)

Convert your portfolio to use a static site generator:

1. **Build static pages** with your current data
2. **Deploy to 000webhost** as pure HTML/CSS/JS
3. **Update content** by rebuilding and re-uploading

**Good for:** Portfolios that rarely change

---

## Complete Deployment Walkthrough for 000webhost

### Prerequisites
- Render backend deployed
- Backend URL noted

### Step-by-Step:

1. **Create `public/config.js`:**
   ```javascript
   window.API_URL = 'https://portfolio-backend-xxxx.onrender.com';
   ```

2. **Create `admin/js/config.js`:**
   ```javascript
   window.API_URL = 'https://portfolio-backend-xxxx.onrender.com';
   ```

3. **Update `public/index.html`:**
   Find the line with `<script src="script.js"></script>` and add config before it:
   ```html
   <script src="config.js"></script>
   <script src="script.js"></script>
   ```

4. **Update admin HTML files:**
   In `admin/login.html`, `admin/dashboard.html`, etc., find script tags and add:
   ```html
   <script src="/admin/js/config.js"></script>
   <script src="/admin/js/admin.js"></script>
   ```

5. **Test Locally:**
   ```bash
   # Serve the public folder locally
   npx serve public -p 8080
   ```
   Access at `http://localhost:8080` and verify API calls work

6. **Upload to 000webhost:**
   - Login to 000webhost dashboard
   - Go to File Manager
   - Upload all files from `public/` to `public_html/`
   - Upload `admin/` folder to `public_html/admin/`

7. **Update Render CORS:**
   Add your 000webhost URL to `ALLOWED_ORIGINS` in Render dashboard

8. **Test Production:**
   - Visit `https://yoursite.000webhostapp.com/`
   - Check browser console for errors
   - Test admin login at `/admin/login.html`

---

## Using FTP for 000webhost

**FTP Credentials** (from 000webhost dashboard):
```
Host: files.000webhost.com
Username: your_username
Password: your_password
Port: 21
```

**Recommended FTP Clients:**
- FileZilla (free)
- WinSCP (Windows)
- Cyberduck (Mac)

**Upload Structure:**
```
Remote: /public_html/
├── index.html
├── style.css  
├── script.js
├── config.js
└── admin/
    ├── login.html
    ├── css/
    └── js/
```

---

## Troubleshooting

### "CORS Error" in Browser Console
**Fix:** Add your 000webhost URL to `ALLOWED_ORIGINS` in Render environment variables

### "Failed to Fetch" Errors
**Check:**
- Config.js has correct backend URL
- Backend is running on Render
- Config.js is loaded before script.js

### Admin Panel Login Not Working
**Check:**
- `/admin/js/config.js` exists
- Config is loaded in HTML
- Cookies are enabled in browser
- CORS is configured correctly

### 404 Errors for Admin Panel
**Fix:** Ensure `admin/` folder is uploaded to `public_html/admin/`

---

## Cost Comparison

| Service | Cost | Best For |
|---------|------|----------|
| 000webhost (Frontend) | FREE | Static files, HTML/CSS/JS |
| Render (Backend) | FREE | Node.js, APIs, databases |
| Custom Domain | ~$10/year | Professional appearance |

**Total Cost:** FREE (or ~$10/year with custom domain)

---

## Next Steps

1. Choose your deployment option (Hybrid recommended)
2. Deploy backend to Render first
3. Create config files with backend URL
4. Upload frontend to 000webhost
5. Update CORS settings
6. Test and enjoy!

For questions or issues, check the main [DEPLOYMENT.md](file:///d:/Projects/My%20portfolio/profile/profile/DEPLOYMENT.md) guide.
