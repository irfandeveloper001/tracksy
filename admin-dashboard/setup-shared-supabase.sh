#!/bin/bash

# Script to set up shared Supabase configuration for admin dashboard
# This copies Supabase credentials from student/driver app

set -e

echo "🔧 Setting up shared Supabase configuration for Admin Dashboard..."
echo ""

# Check if student app .env exists
if [ -f "../studentapp/.env" ]; then
    echo "✅ Found student app .env file"
    source ../studentapp/.env
    
    # Extract Supabase credentials
    SUPABASE_URL=$(grep "EXPO_PUBLIC_SUPABASE_URL" ../studentapp/.env | cut -d '=' -f2 | tr -d '"' | tr -d "'")
    SUPABASE_KEY=$(grep "EXPO_PUBLIC_SUPABASE_ANON_KEY" ../studentapp/.env | cut -d '=' -f2 | tr -d '"' | tr -d "'")
    
    if [ -n "$SUPABASE_URL" ] && [ -n "$SUPABASE_KEY" ]; then
        echo "✅ Found Supabase credentials"
        
        # Create .env file in admin-dashboard
        cat > .env << EOF
# Supabase Configuration (shared with student/driver apps)
# Copied from studentapp/.env on $(date)

# Use EXPO_PUBLIC_ prefix (same as student/driver apps) - Admin dashboard supports both!
EXPO_PUBLIC_SUPABASE_URL=$SUPABASE_URL
EXPO_PUBLIC_SUPABASE_ANON_KEY=$SUPABASE_KEY

# OR use VITE_ prefix (also supported)
VITE_SUPABASE_URL=$SUPABASE_URL
VITE_SUPABASE_ANON_KEY=$SUPABASE_KEY

# API Configuration (update if needed)
VITE_API_BASE_URL=http://localhost:8000/api

# Environment
NODE_ENV=development
EOF
        
        echo "✅ Created admin-dashboard/.env with Supabase credentials"
        echo ""
        echo "📝 Next steps:"
        echo "1. Review the .env file (it's in admin-dashboard/.env)"
        echo "2. Update VITE_API_BASE_URL if your backend is different"
        echo "3. Run: npm run dev or npm run web"
        echo ""
    else
        echo "❌ Could not extract Supabase credentials from student app .env"
        echo "Please check studentapp/.env file"
        exit 1
    fi
elif [ -f "../driver-app/.env" ]; then
    echo "✅ Found driver app .env file"
    source ../driver-app/.env
    
    # Extract Supabase credentials
    SUPABASE_URL=$(grep "EXPO_PUBLIC_SUPABASE_URL" ../driver-app/.env | cut -d '=' -f2 | tr -d '"' | tr -d "'")
    SUPABASE_KEY=$(grep "EXPO_PUBLIC_SUPABASE_ANON_KEY" ../driver-app/.env | cut -d '=' -f2 | tr -d '"' | tr -d "'")
    
    if [ -n "$SUPABASE_URL" ] && [ -n "$SUPABASE_KEY" ]; then
        echo "✅ Found Supabase credentials"
        
        # Create .env file in admin-dashboard
        cat > .env << EOF
# Supabase Configuration (shared with student/driver apps)
# Copied from driver-app/.env on $(date)

# Use EXPO_PUBLIC_ prefix (same as student/driver apps) - Admin dashboard supports both!
EXPO_PUBLIC_SUPABASE_URL=$SUPABASE_URL
EXPO_PUBLIC_SUPABASE_ANON_KEY=$SUPABASE_KEY

# OR use VITE_ prefix (also supported)
VITE_SUPABASE_URL=$SUPABASE_URL
VITE_SUPABASE_ANON_KEY=$SUPABASE_KEY

# API Configuration (update if needed)
VITE_API_BASE_URL=http://localhost:8000/api

# Environment
NODE_ENV=development
EOF
        
        echo "✅ Created admin-dashboard/.env with Supabase credentials"
        echo ""
        echo "📝 Next steps:"
        echo "1. Review the .env file (it's in admin-dashboard/.env)"
        echo "2. Update VITE_API_BASE_URL if your backend is different"
        echo "3. Run: npm run dev or npm run web"
        echo ""
    else
        echo "❌ Could not extract Supabase credentials from driver app .env"
        echo "Please check driver-app/.env file"
        exit 1
    fi
else
    echo "❌ Could not find .env file in studentapp/ or driver-app/"
    echo ""
    echo "Please create .env file manually with:"
    echo ""
    echo "EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co"
    echo "EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key"
    echo "VITE_SUPABASE_URL=https://your-project.supabase.co"
    echo "VITE_SUPABASE_ANON_KEY=your-anon-key"
    echo ""
    exit 1
fi

echo "✅ Setup complete!"

