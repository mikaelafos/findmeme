# FindMeme Deployment Guide

This guide will help you deploy FindMeme to Render (free tier available).

## Prerequisites

1. A GitHub account
2. A Render account (sign up at https://render.com)
3. Your Cloudinary credentials (you already have these)

## Step 1: Push to GitHub

1. Create a new repository on GitHub (https://github.com/new)
   - Name it "findmeme" or whatever you prefer
   - Keep it public or private (your choice)
   - Don't initialize with README (we already have one)

2. Push your code to GitHub:
   ```bash
   git add .
   git commit -m "Initial commit - FindMeme ready for deployment"
   git remote add origin https://github.com/YOUR_USERNAME/findmeme.git
   git branch -M main
   git push -u origin main
   ```

## Step 2: Deploy PostgreSQL Database on Render

1. Go to https://dashboard.render.com
2. Click "New +" → "PostgreSQL"
3. Configure:
   - **Name**: findmeme-db
   - **Database**: findmeme
   - **User**: (auto-generated)
   - **Region**: Choose closest to you
   - **Plan**: Free
4. Click "Create Database"
5. **IMPORTANT**: Copy the "Internal Database URL" (you'll need this)

## Step 3: Deploy Backend on Render

1. Click "New +" → "Web Service"
2. Connect your GitHub repository
3. Configure:
   - **Name**: findmeme-backend
   - **Region**: Same as database
   - **Branch**: main
   - **Root Directory**: backend
   - **Runtime**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free

4. Add Environment Variables (click "Advanced" → "Add Environment Variable"):
   ```
   DATABASE_URL = [paste Internal Database URL from Step 2]
   CLOUDINARY_CLOUD_NAME = dly72r6ah
   CLOUDINARY_API_KEY = 948424286237957
   CLOUDINARY_API_SECRET = VLfrCUNNqH9PVb4XGtDPOUT91CQ
   JWT_SECRET = [generate a random secure string, e.g., use https://randomkeygen.com/]
   PORT = 5050
   ```

5. Click "Create Web Service"

6. **Initialize the database** (after deployment completes):
   - Go to your backend service → "Shell" tab
   - Run: `npm run init-db`
   - You should see success messages

7. **Copy your backend URL** (e.g., `https://findmeme-backend.onrender.com`)

## Step 4: Deploy Frontend on Render

1. Click "New +" → "Static Site"
2. Connect your GitHub repository
3. Configure:
   - **Name**: findmeme-frontend
   - **Branch**: main
   - **Root Directory**: frontend
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: dist

4. Add Environment Variable:
   ```
   VITE_API_URL = [paste your backend URL from Step 3]/api
   ```
   Example: `https://findmeme-backend.onrender.com/api`

5. Click "Create Static Site"

## Step 5: Update Backend CORS

After frontend deploys, you need to allow it in your backend CORS settings.

1. Edit `backend/server.js` and update the CORS configuration:
   ```javascript
   app.use(cors({
     origin: ['https://your-frontend-url.onrender.com'],
     credentials: true
   }));
   ```

2. Commit and push:
   ```bash
   git add backend/server.js
   git commit -m "Update CORS for production"
   git push
   ```

3. Render will automatically redeploy your backend

## Step 6: Test Your Deployment

1. Visit your frontend URL (e.g., `https://findmeme-frontend.onrender.com`)
2. Test key features:
   - Sign up / Login
   - Upload a meme
   - Search for memes
   - Favorite a meme
   - View favorites page

## Important Notes

- **Free tier limitations**:
  - Services spin down after 15 minutes of inactivity
  - First request after spin-down may take 30-60 seconds
  - Database limited to 1GB (plenty for this app)

- **Your Cloudinary credentials are exposed in this deployment guide**. Consider:
  - Rotating them after deployment
  - Setting up environment restrictions in Cloudinary dashboard

- **JWT_SECRET**: Make sure to use a strong, random secret in production

## Troubleshooting

### Backend won't start
- Check logs in Render dashboard
- Verify DATABASE_URL is set correctly
- Make sure you ran `npm run init-db`

### Frontend can't connect to backend
- Check VITE_API_URL is correct
- Verify CORS settings in backend
- Check backend logs for errors

### Database connection errors
- Verify DATABASE_URL includes SSL settings
- Check if database is running in Render dashboard

## Next Steps

Once deployed, consider:
1. Setting up a custom domain
2. Rotating Cloudinary credentials
3. Adding monitoring/analytics
4. Implementing rate limiting
5. Adding image optimization
