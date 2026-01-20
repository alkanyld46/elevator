# Development vs Production Setup

This document explains how to switch between local development and production environments.

## Quick Start - Local Development

### 1. Start Everything (Frontend + Backend)
```bash
# From root directory
npm run dev
```

This starts:
- **Backend** at http://localhost:5000 (using local MongoDB)
- **Frontend** at http://localhost:3000 (pointing to localhost backend)

### 2. Or Start Individually
```bash
# Terminal 1 - Backend only
cd server
npm run dev

# Terminal 2 - Frontend only
cd client
npm start
```

## Environment Files

### Client (`client/`)
| File | Purpose | Used When |
|------|---------|-----------|
| `.env.development` | Local dev settings | `npm start` |
| `.env.production` | Production settings | `npm run build` |

### Server (`server/`)
| File | Purpose | Used When |
|------|---------|-----------|
| `.env.development` | Local MongoDB | `npm run dev` |
| `.env` | Production (Render) | `npm start` on Render |

## Switching Environments

### To Work Locally (Offline Development)
No changes needed! Just run:
```bash
npm run dev
```
- Uses `server/.env.development` (local MongoDB at `localhost:27017/test`)
- Uses `client/.env.development` (API at `localhost:5000`)

### To Deploy to Production
1. **Push to GitHub:**
   ```bash
   git add -A
   git commit -m "your changes"
   git push origin main
   ```

2. **Render auto-deploys** from GitHub

3. **Environment variables on Render:**
   - Backend reads from Render's Environment Variables dashboard
   - Frontend uses `client/.env.production` during build

## Database Setup

### Local Development (MongoDB)
Make sure MongoDB is running locally:
```bash
# Check if MongoDB is running
mongosh --eval "db.adminCommand('ping')"
```

Your local database:
- URI: `mongodb://localhost:27017/test`
- Collections: `users`, `elevators`, `maintenancerecords`

### Production (MongoDB Atlas)
- URI is set in Render's environment variables
- Database: `Elevator` on cluster0.82gerzo.mongodb.net

## Common Tasks

### Test Production Build Locally
```bash
cd client
npm run build
npx serve -s build
```

### Reset Local Database
```bash
mongosh test --eval "db.dropDatabase()"
```

### View Logs
```bash
# Server logs appear in the terminal running npm run dev
# Client logs appear in browser DevTools Console
```

## Troubleshooting

### "MongoDB not connected" error
1. Make sure MongoDB is running: `mongosh`
2. Check if using correct env file

### "CORS blocked" error
1. Ensure `CORS_ORIGINS` includes your frontend URL
2. Restart the server after changing `.env`

### Frontend not updating after env change
1. Stop the dev server (Ctrl+C)
2. Restart with `npm start`
3. Hard refresh browser (Ctrl+Shift+R)
