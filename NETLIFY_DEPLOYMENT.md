# 🚀 Netlify Deployment Guide

## 📋 Prerequisites

1. **Netlify Account**: Sign up at [netlify.com](https://netlify.com)
2. **GitHub Repository**: Push your code to GitHub
3. **Supabase Project**: Ensure your Supabase project is set up

## 🔧 Environment Variables

Set these environment variables in your Netlify dashboard:

### Required Variables
```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Site Configuration
NEXT_PUBLIC_SITE_URL=https://your-site.netlify.app

# Optional: Google Analytics
NEXT_PUBLIC_GA_ID=your-ga-id

# Optional: Google Site Verification
GOOGLE_SITE_VERIFICATION=your-verification-code
```

## 🚀 Deployment Steps

### Method 1: Connect GitHub Repository (Recommended)

1. **Connect Repository**:
   - Go to [Netlify Dashboard](https://app.netlify.com)
   - Click "New site from Git"
   - Choose "GitHub" and select your repository

2. **Build Settings**:
   - Build command: `npm run build`
   - Publish directory: `.next`
   - Node version: `18`

3. **Environment Variables**:
   - Go to Site settings → Environment variables
   - Add all required variables listed above

4. **Deploy**:
   - Click "Deploy site"
   - Wait for build to complete

### Method 2: Manual Deploy

1. **Build Locally**:
   ```bash
   npm run build
   npm run export
   ```

2. **Deploy to Netlify**:
   - Drag and drop the `.next` folder to Netlify
   - Or use Netlify CLI: `netlify deploy --prod --dir=.next`

## ⚙️ Netlify Configuration

The project includes a `netlify.toml` file with optimized settings:

- **Build Command**: `npm run build`
- **Publish Directory**: `.next`
- **Node Version**: 18
- **Security Headers**: CSP, HSTS, XSS Protection
- **Caching**: Optimized for static assets
- **Redirects**: Client-side routing support

## 🔒 Security Features

- **Content Security Policy**: Restricts resource loading
- **HTTPS Enforcement**: Automatic SSL certificates
- **Security Headers**: XSS protection, frame options
- **Environment Variables**: Secure secret management

## 📊 Performance Optimizations

- **Static Generation**: Pre-built pages for better performance
- **Image Optimization**: WebP/AVIF format support
- **Bundle Splitting**: Optimized JavaScript chunks
- **Caching**: Long-term caching for static assets

## 🐛 Troubleshooting

### Common Issues

1. **Build Failures**:
   - Check Node.js version (should be 18)
   - Verify all environment variables are set
   - Check build logs for specific errors

2. **3D Components Not Loading**:
   - Ensure Three.js dependencies are installed
   - Check browser console for WebGL errors
   - Verify Canvas API support

3. **Supabase Connection Issues**:
   - Verify environment variables are correct
   - Check Supabase project is active
   - Ensure RLS policies are configured

### Build Commands

```bash
# Install dependencies
npm install

# Build for production
npm run build

# Start production server (local testing)
npm start

# Check build output
ls -la .next/
```

## 🔄 Continuous Deployment

Once connected to GitHub:
- **Automatic Deploys**: Every push to main branch
- **Preview Deploys**: Pull request previews
- **Rollback**: Easy rollback to previous versions

## 📈 Monitoring

- **Build Logs**: Available in Netlify dashboard
- **Performance**: Built-in analytics
- **Error Tracking**: Monitor runtime errors
- **Uptime**: 99.9% uptime guarantee

## 🎯 Post-Deployment Checklist

- [ ] Site loads without errors
- [ ] Authentication works (login/signup)
- [ ] 3D components render correctly
- [ ] All pages are accessible
- [ ] Mobile responsiveness works
- [ ] Performance is acceptable
- [ ] SSL certificate is active
- [ ] Custom domain is configured (optional)

## 🚀 Go Live!

Your UIL Academy platform is now ready for production! 🎉

The site will be available at: `https://your-site-name.netlify.app`

### Next Steps

1. **Custom Domain**: Add your own domain in Netlify settings
2. **Analytics**: Set up Google Analytics or Netlify Analytics
3. **Monitoring**: Configure error tracking and performance monitoring
4. **Backup**: Set up automated backups of your Supabase database
