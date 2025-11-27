#!/bin/bash

# Railway Deployment Script for Backend
echo "🚀 Preparing Backend for Railway Deployment..."

# Navigate to backend directory
cd backend

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Generate Prisma client
echo "🔄 Generating Prisma client..."
npx prisma generate

# Optional: Run database push (Railway will handle this automatically)
echo "📊 Database ready for Railway auto-setup..."

echo "✅ Backend is ready for Railway deployment!"
echo ""
echo "Next steps:"
echo "1. Go to https://railway.app/new"
echo "2. Connect your GitHub repository: Prathmesh125/reviewsystem"
echo "3. Set root directory to 'backend'"
echo "4. Add PostgreSQL database"
echo "5. Configure environment variables (see DEPLOYMENT_GUIDE.md)"
