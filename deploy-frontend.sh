#!/bin/bash

# Vercel Deployment Script for Frontend
echo "🚀 Preparing Frontend for Vercel Deployment..."

# Navigate to frontend directory
cd frontend

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build the project to check for errors
echo "🔨 Building project..."
npm run build

echo "✅ Frontend is ready for Vercel deployment!"
echo ""
echo "Next steps:"
echo "1. Go to https://vercel.com/new"
echo "2. Import your GitHub repository: Prathmesh125/reviewsystem"
echo "3. Set root directory to 'frontend'"
echo "4. Configure environment variables (see DEPLOYMENT_GUIDE.md)"
echo "5. Deploy!"