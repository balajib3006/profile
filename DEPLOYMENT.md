# Cloudflare Workers Deployment Guide

This guide explains how to deploy your portfolio backend to Cloudflare Workers.

## Prerequisites

1. **Cloudflare Account**: Sign up at https://cloudflare.com
2. **Node.js**: Version 18 or higher
3. **Wrangler CLI**: Install globally with `npm install -g wrangler`

## Step 1: Install Dependencies

```bash
npm install
```

## Step 2: Authenticate with Cloudflare

```bash
wrangler login
```

This will open a browser window to authorize Wrangler.

## Step 3: Create D1 Database

```bash
wrangler d1 create portfolio-db
```

Copy the `database_id` from the output and update `wrangler.toml`:

```toml
[[d1_databases]]
binding = "DB"
database_name = "portfolio-db"
database_id = "YOUR_DATABASE_ID_HERE"  # Paste ID here
```

## Step 4: Create Tables

```bash
wrangler d1 execute portfolio-db --file=schema.sql
```

## Step 5: Migrate Data from SQLite

First, export your data:

```bash
node migrate-data.js
```

This creates `data-migration.sql`. Import it:

```bash
wrangler d1 execute portfolio-db --file=data-migration.sql
```

## Step 6: Create R2 Bucket for Uploads

```bash
wrangler r2 bucket create portfolio-uploads
```

## Step 7: Set Environment Secrets

```bash
wrangler secret put SESSION_SECRET
wrangler secret put MAILGUN_API_KEY      # If using Mailgun for emails
wrangler secret put MAILGUN_DOMAIN       # If using Mailgun
wrangler secret put TWILIO_ACCOUNT_SID   # If using Twilio for WhatsApp
wrangler secret put TWILIO_AUTH_TOKEN    # If using Twilio
wrangler secret put TWILIO_WHATSAPP_FROM # If using Twilio
```

**Important**: For `SESSION_SECRET`, generate a strong random string:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Step 8: Test Locally

```bash
npm run dev
```

This starts a local development server. Test your endpoints at `http://localhost:8787`

## Step 9: Deploy to Cloudflare

```bash
npm run deploy
```

Your Worker will be deployed and you'll get a URL like:
`https://portfolio-backend.your-subdomain.workers.dev`

## Step 10: Update Frontend Configuration

Update `public/config.js` with your Worker URL:

```javascript
window.API_URL = 'https://portfolio-backend.your-subdomain.workers.dev';
```

## Managing Your Worker

### View Logs
```bash
npm run tail
```

### List D1 Databases
```bash
wrangler d1 list
```

### Query D1 Database
```bash
wrangler d1 execute portfolio-db --command "SELECT * FROM users"
```

### Update Environment Variables
```bash
wrangler secret put <SECRET_NAME>
```

## Serving Uploaded Files from R2

To make R2 files publicly accessible, you need to set up a custom domain or use Cloudflare's R2 public buckets feature. Update your Worker to serve R2 files:

```javascript
// Add this route to src/index.js
router.get('/uploads/:filename', async (request) => {
    const filename = request.params.filename;
    const object = await request.env.UPLOADS.get(filename);
    
    if (!object) {
        return new Response('File not found', { status: 404 });
    }
    
    const headers = new Headers();
    object.writeHttpMetadata(headers);
    headers.set('etag', object.httpEtag);
    
    return new Response(object.body, { headers });
});
```

## Troubleshooting

### Database Not Found
- Verify `database_id` in `wrangler.toml` matches your D1 database
- Run `wrangler d1 list` to confirm

### Authentication Errors
- Check that `SESSION_SECRET` is set correctly
- Verify JWT tokens are being sent in requests

### CORS Issues
- Update `src/middleware/cors.js` with your frontend URL
- Ensure frontend sends credentials with requests

## Cost Estimate

Cloudflare Workers pricing (as of 2024):
- **Free Tier**: 100,000 requests/day
- **Paid Plan**: $5/month for 10 million requests

D1 pricing:
- **Free Tier**: 5GB storage, 5 million reads/day
- Very generous for portfolio sites

R2 pricing:
- **Free Tier**: 10GB storage, 1 million Class A operations/month
- No egress fees!

**Your portfolio will likely stay within free limits.**
