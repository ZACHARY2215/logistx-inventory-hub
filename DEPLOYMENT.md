# LogistX Deployment Guide

This guide covers deploying LogistX to various platforms.

## 🚀 Quick Deploy to Vercel (Recommended)

### Prerequisites
- GitHub account
- Vercel account
- Supabase project set up

### Steps

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Deploy to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Vercel will auto-detect it's a Vite project
   - Click "Deploy"

3. **Configure Environment Variables**
   - In Vercel dashboard, go to your project
   - Go to Settings > Environment Variables
   - Add:
     ```
     VITE_SUPABASE_URL=your-supabase-url
     VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
     ```

4. **Update Supabase Configuration**
   - Update `src/integrations/supabase/client.ts` to use environment variables:
   ```typescript
   const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
   const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
   ```

5. **Redeploy**
   - Push changes to trigger automatic deployment
   - Or manually redeploy from Vercel dashboard

## 🌐 Deploy to Netlify

### Steps

1. **Build the Project**
   ```bash
   npm run build
   ```

2. **Deploy to Netlify**
   - Go to [netlify.com](https://netlify.com)
   - Drag and drop the `dist` folder
   - Or connect your GitHub repository

3. **Configure Environment Variables**
   - In Netlify dashboard, go to Site settings > Environment variables
   - Add the same variables as Vercel

4. **Configure Build Settings**
   - Build command: `npm run build`
   - Publish directory: `dist`

## 🐳 Deploy with Docker

### Create Dockerfile
```dockerfile
# Build stage
FROM node:18-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### Create nginx.conf
```nginx
events {
    worker_connections 1024;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    server {
        listen 80;
        server_name localhost;
        root /usr/share/nginx/html;
        index index.html;

        location / {
            try_files $uri $uri/ /index.html;
        }

        location /api {
            proxy_pass https://your-supabase-url.supabase.co;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
        }
    }
}
```

### Build and Run
```bash
docker build -t logistx .
docker run -p 80:80 logistx
```

## ☁️ Deploy to AWS

### Using AWS Amplify

1. **Connect Repository**
   - Go to AWS Amplify Console
   - Connect your GitHub repository
   - Select the main branch

2. **Configure Build Settings**
   ```yaml
   version: 1
   frontend:
     phases:
       preBuild:
         commands:
           - npm ci
       build:
         commands:
           - npm run build
     artifacts:
       baseDirectory: dist
       files:
         - '**/*'
     cache:
       paths:
         - node_modules/**/*
   ```

3. **Set Environment Variables**
   - Add Supabase URL and key in Amplify console

### Using AWS S3 + CloudFront

1. **Build and Upload**
   ```bash
   npm run build
   aws s3 sync dist/ s3://your-bucket-name --delete
   ```

2. **Configure CloudFront**
   - Create CloudFront distribution
   - Set S3 bucket as origin
   - Configure custom error pages for SPA routing

## 🔧 Environment Configuration

### Production Environment Variables

Create a `.env.production` file:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_APP_ENV=production
```

### Update Supabase Client
```typescript
// src/integrations/supabase/client.ts
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "https://npmeujpnbpqbotksxcdt.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "your-fallback-key";
```

## 🔐 Security Considerations

### 1. Environment Variables
- Never commit API keys to version control
- Use environment variables for all sensitive data
- Rotate keys regularly

### 2. Supabase Configuration
- Enable Row Level Security (RLS)
- Review and test all RLS policies
- Use service role key only on server-side

### 3. CORS Configuration
- Configure CORS in Supabase dashboard
- Add your production domain to allowed origins
- Remove localhost from production CORS settings

### 4. Authentication
- Enable email confirmation for production
- Set up proper password policies
- Consider implementing 2FA for admin accounts

## 📊 Performance Optimization

### 1. Build Optimization
```bash
# Analyze bundle size
npm run build
npx vite-bundle-analyzer dist
```

### 2. Image Optimization
- Use WebP format for images
- Implement lazy loading
- Optimize image sizes

### 3. Code Splitting
```typescript
// Lazy load components
const ReportsManagement = lazy(() => import('./components/reports/ReportsManagement'));
const UserManagement = lazy(() => import('./components/users/UserManagement'));
```

### 4. Caching
- Configure proper cache headers
- Use CDN for static assets
- Implement service worker for offline support

## 🔍 Monitoring and Analytics

### 1. Error Tracking
```typescript
// Add error boundary
import { ErrorBoundary } from 'react-error-boundary';

function ErrorFallback({error, resetErrorBoundary}) {
  return (
    <div role="alert">
      <h2>Something went wrong:</h2>
      <pre>{error.message}</pre>
      <button onClick={resetErrorBoundary}>Try again</button>
    </div>
  );
}

// Wrap your app
<ErrorBoundary FallbackComponent={ErrorFallback}>
  <App />
</ErrorBoundary>
```

### 2. Performance Monitoring
- Use Vercel Analytics or similar
- Monitor Core Web Vitals
- Track user interactions

### 3. Database Monitoring
- Monitor Supabase usage
- Set up alerts for high usage
- Track query performance

## 🚨 Troubleshooting

### Common Deployment Issues

#### Build Failures
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

#### Environment Variable Issues
- Check variable names (must start with VITE_)
- Verify values are correct
- Ensure variables are set in deployment platform

#### CORS Errors
- Check Supabase CORS settings
- Verify domain is in allowed origins
- Check for trailing slashes in URLs

#### Authentication Issues
- Verify Supabase URL and keys
- Check RLS policies
- Ensure user roles are set correctly

### Debug Mode
```typescript
// Enable debug mode in development
const isDevelopment = import.meta.env.DEV;
if (isDevelopment) {
  console.log('Supabase URL:', SUPABASE_URL);
  console.log('Environment:', import.meta.env.MODE);
}
```

## 📈 Scaling Considerations

### 1. Database Scaling
- Monitor Supabase usage limits
- Consider upgrading to Pro plan for higher limits
- Implement database indexing for better performance

### 2. CDN Configuration
- Use CloudFront or similar for global distribution
- Configure proper cache headers
- Implement edge caching for API responses

### 3. Load Balancing
- Use multiple deployment regions
- Implement health checks
- Set up auto-scaling if needed

## 🔄 CI/CD Pipeline

### GitHub Actions Example
```yaml
name: Deploy to Vercel

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'
      - name: Install dependencies
        run: npm ci
      - name: Run tests
        run: npm test
      - name: Build
        run: npm run build
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
```

## 📞 Support

For deployment issues:
1. Check platform-specific documentation
2. Review error logs in deployment platform
3. Test locally with production environment variables
4. Create an issue in the repository

---

**Happy deploying! 🚀**
