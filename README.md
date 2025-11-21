# Portfolio with Admin Panel

A modern portfolio website with a full-featured admin panel for content management.

## Features

### Public Portfolio
- Responsive design with premium UI/UX
- Dynamic content loading from backend API
- Skills, projects, experience, and contact sections
- Modern animations and glassmorphism effects

### Admin Panel
- Secure login with session management
- CRUD operations for all content types
- Premium dark theme UI matching public site aesthetic
- Real-time content updates

## Tech Stack

- **Frontend**: HTML, CSS, JavaScript
- **Backend**: Node.js, Express.js
- **Database**: SQLite (development), PostgreSQL (production)
- **Authentication**: bcrypt + express-session

## Local Development

### Prerequisites
- Node.js 18+ ([Download](https://nodejs.org/))
- npm (comes with Node.js)

### Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/portfolio.git
   cd portfolio
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create environment file**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` and update the values

4. **Start the server**
   ```bash
   npm run dev
   ```

5. **Access the application**
   - Public Portfolio: `http://localhost:3000/`
   - Admin Panel: `http://localhost:3000/admin/login.html`
   - Default credentials: `admin` / `password123`

## Deployment

### Option 1: Deploy to Render (Recommended)

1. Create account at [render.com](https://render.com)
2. Create new **Web Service**
3. Connect your GitHub repository
4. Render will auto-detect `render.yaml`
5. Add environment variables in Render dashboard
6. Deploy!

### Option 2: Deploy to Vercel

1. Install Vercel CLI
   ```bash
   npm i -g vercel
   ```

2. Deploy
   ```bash
   vercel
   ```

3. Set environment variables in Vercel dashboard

### Option 3: GitHub Pages (Static Frontend Only)

For static portfolio without admin panel:
1. Enable GitHub Pages in repository settings
2. Select `main` branch as source
3. Access at `https://yourusername.github.io/portfolio/`

> Note: GitHub Pages only supports static sites. For full CMS functionality, deploy backend to Render/Vercel.

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | Server port | `3000` |
| `NODE_ENV` | Environment | `development` or `production` |
| `SESSION_SECRET` | Session encryption key | Random string |
| `ALLOWED_ORIGINS` | CORS allowed origins | `https://yourdomain.com` |
| `DATABASE_URL` | PostgreSQL URL (production) | `postgresql://...` |

## Project Structure

```
portfolio/
├── admin/                 # Admin panel frontend
│   ├── css/
│   ├── js/
│   └── *.html
├── public/               # Public portfolio frontend  
│   ├── style.css
│   ├── script.js
│   └── index.html
├── routes/               # API routes
│   ├── auth.js
│   ├── admin.js
│   └── index.js
├── database.js           # Database initialization
├── server.js             # Express server
└── package.json          # Dependencies

```

## API Endpoints

### Authentication
- `POST /api/auth/login` - Admin login
- `GET /api/auth/check` - Check auth status
- `GET /api/auth/logout` - Logout

### Content Management (Protected)
- `GET/POST/PUT/DELETE /api/admin/skills`
- `GET/POST/PUT/DELETE /api/admin/projects`
- `GET/POST/PUT/DELETE /api/admin/experience`
- `GET/POST/PUT/DELETE /api/admin/messages`

### Public Data
- `GET /api/data` - Get all portfolio data

## Security Notes

> ⚠️ **Important for Production:**
> - Change default admin password
> - Use strong `SESSION_SECRET`
> - Enable HTTPS (set `secure: true` for cookies)
> - Add rate limiting for API endpoints
> - Use PostgreSQL instead of SQLite
> - Regularly backup your database

## License

ISC

## Author

Balaji B

---

Made with ❤️ using Node.js & Express
