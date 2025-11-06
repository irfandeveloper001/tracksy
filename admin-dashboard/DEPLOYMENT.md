# Deployment Guide

## 🚀 Production Deployment

This guide covers deploying the Tracksy Admin Dashboard to production.

## Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- Environment variables configured
- Backend API deployed and accessible
- Supabase project set up

## Environment Variables

Create a `.env.production` file in the root directory:

```env
# API Configuration
VITE_API_BASE_URL=https://api.yourdomain.com/api

# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Google Maps (optional)
VITE_GOOGLE_MAPS_API_KEY=your-google-maps-key

# Error Tracking (optional)
VITE_SENTRY_DSN=your-sentry-dsn

# Environment
NODE_ENV=production
```

## Build Process

### 1. Install Dependencies

```bash
npm install
# or
yarn install
```

### 2. Build for Production

```bash
npm run build
# or
yarn build
```

This will create an optimized production build in the `build/` directory.

### 3. Verify Build

```bash
npm run preview
# or
yarn preview
```

This will start a local server to preview the production build.

## Deployment Options

### Option 1: Vercel (Recommended)

1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Deploy:
   ```bash
   vercel --prod
   ```

3. Configure environment variables in Vercel dashboard

4. Set up custom domain (optional)

### Option 2: Netlify

1. Install Netlify CLI:
   ```bash
   npm i -g netlify-cli
   ```

2. Build and deploy:
   ```bash
   npm run build
   netlify deploy --prod
   ```

3. Configure environment variables in Netlify dashboard

### Option 3: AWS S3 + CloudFront

1. Build the application:
   ```bash
   npm run build
   ```

2. Upload to S3:
   ```bash
   aws s3 sync build/ s3://your-bucket-name --delete
   ```

3. Invalidate CloudFront cache:
   ```bash
   aws cloudfront create-invalidation --distribution-id YOUR_DIST_ID --paths "/*"
   ```

### Option 4: Docker

1. Build Docker image:
   ```bash
   docker build -t tracksy-admin-dashboard .
   ```

2. Run container:
   ```bash
   docker run -p 3000:3000 \
    -e VITE_API_BASE_URL=https://api.yourdomain.com/api \
    -e VITE_SUPABASE_URL=https://your-project.supabase.co \
    -e VITE_SUPABASE_ANON_KEY=your-key \
    tracksy-admin-dashboard
   ```

## Docker Configuration

Create a `Dockerfile`:

```dockerfile
# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine

COPY --from=builder /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

Create `nginx.conf`:

```nginx
server {
    listen 80;
    server_name _;

    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;
}
```

## Environment-Specific Configuration

### Development

```bash
npm run dev
```

Uses `.env.development` or `.env.local`

### Staging

```bash
npm run build -- --mode staging
```

Uses `.env.staging`

### Production

```bash
npm run build -- --mode production
```

Uses `.env.production`

## Performance Optimization

### 1. Code Splitting

Already configured in Remix - routes are automatically code-split.

### 2. Asset Optimization

- Images should be optimized before upload
- Use WebP format when possible
- Lazy load images

### 3. Caching

Configure caching headers in your hosting provider:
- Static assets: Cache-Control: public, max-age=31536000, immutable
- HTML: Cache-Control: public, max-age=0, must-revalidate

## Monitoring

### Error Tracking

1. Set up Sentry (optional):
   - Sign up at https://sentry.io
   - Create a project
   - Add `VITE_SENTRY_DSN` to environment variables
   - Errors will be automatically tracked

### Analytics

1. Set up Google Analytics (optional):
   - Add Google Analytics ID in Settings > Integrations
   - Or configure in environment variables

### Performance Monitoring

- Use browser DevTools Performance tab
- Monitor Core Web Vitals
- Use Lighthouse for audits

## Security Checklist

- [ ] Environment variables are secure and not exposed
- [ ] API keys are properly configured
- [ ] HTTPS is enabled
- [ ] CORS is properly configured on backend
- [ ] Authentication tokens are handled securely
- [ ] Error messages don't expose sensitive information
- [ ] Dependencies are up to date
- [ ] Security headers are configured

## Troubleshooting

### Build Fails

1. Check Node.js version (should be 18+)
2. Clear node_modules and reinstall:
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```
3. Check for TypeScript errors:
   ```bash
   npm run typecheck
   ```

### API Connection Issues

1. Verify `VITE_API_BASE_URL` is correct
2. Check CORS configuration on backend
3. Verify API is accessible from deployment environment

### Authentication Issues

1. Verify Supabase credentials are correct
2. Check Supabase project settings
3. Verify redirect URLs are configured

## Rollback Procedure

1. Keep previous build artifacts
2. Revert to previous deployment:
   ```bash
   # Vercel
   vercel rollback

   # Netlify
   netlify rollback

   # AWS S3
   # Upload previous build folder
   ```

## Post-Deployment

1. Test all major features
2. Verify authentication flows
3. Check real-time updates
4. Test on different devices/browsers
5. Monitor error logs
6. Check performance metrics

## Support

For issues or questions:
- Check documentation in `/docs`
- Review error logs
- Contact development team

---

**Last Updated**: Phase 12 Complete
**Status**: ✅ Production Ready

