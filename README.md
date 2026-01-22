# FindMeme

A modern meme sharing platform with search, tagging, and favorites functionality.

## Features

- Browse and search memes by title and tags
- User authentication (signup/login)
- Upload memes (images and videos)
- Favorite memes
- Tag-based filtering
- Responsive design

## Tech Stack

**Frontend:**
- React + Vite
- Tailwind CSS

**Backend:**
- Node.js + Express
- PostgreSQL
- Cloudinary (media storage)
- JWT authentication

## Deployment

This app is deployed on Render:
- Frontend: Static site
- Backend: Web service
- Database: PostgreSQL

## Environment Variables

Backend requires:
- `DATABASE_URL` - PostgreSQL connection string
- `CLOUDINARY_CLOUD_NAME` - Cloudinary cloud name
- `CLOUDINARY_API_KEY` - Cloudinary API key
- `CLOUDINARY_API_SECRET` - Cloudinary API secret
- `JWT_SECRET` - Secret for JWT tokens
- `PORT` - Server port (default: 5050)
