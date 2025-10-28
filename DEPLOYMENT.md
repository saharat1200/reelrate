# ReelRate Deployment Guide

## 📋 Prerequisites

Before deploying ReelRate, ensure you have:

1. **GitHub Account** - For code repository
2. **Supabase Account** - For database and authentication
3. **TMDB API Key** - For movie data
4. **Google Play Console Account** - For Android deployment
5. **Apple Developer Account** - For iOS deployment

## 🚀 GitHub Deployment

### 1. Create GitHub Repository

1. Go to [GitHub](https://github.com) and create a new repository
2. Name it `reelrate` or your preferred name
3. Set it to public or private as needed
4. Don't initialize with README (we already have one)

### 2. Connect Local Repository to GitHub

```bash
# Add GitHub remote (replace with your repository URL)
git remote add origin https://github.com/yourusername/reelrate.git

# Push to GitHub
git branch -M main
git push -u origin main
```

### 3. Set up Environment Variables

1. Copy `.env.example` to `.env.local`
2. Fill in your actual API keys and configuration:
   - Supabase URL and keys
   - TMDB API key
   - Other required variables

## 🌐 Web Deployment (Vercel/Netlify)

### Vercel Deployment

1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push

### Netlify Deployment

1. Connect your GitHub repository to Netlify
2. Set build command: `npm run build`
3. Set publish directory: `out` or `.next`
4. Configure environment variables

## 📱 Mobile App Deployment

### PWA to Native App Conversion

ReelRate is built as a PWA (Progressive Web App) which can be converted to native apps using:

#### Option 1: Capacitor (Recommended)

```bash
# Install Capacitor
npm install @capacitor/core @capacitor/cli

# Initialize Capacitor
npx cap init reelrate com.yourcompany.reelrate

# Add platforms
npx cap add android
npx cap add ios

# Build and sync
npm run build
npx cap sync

# Open in native IDEs
npx cap open android  # Android Studio
npx cap open ios      # Xcode
```

#### Option 2: PWA Builder (Microsoft)

1. Visit [PWA Builder](https://www.pwabuilder.com/)
2. Enter your deployed PWA URL
3. Generate Android/iOS packages
4. Download and submit to stores

## 🤖 Google Play Store Deployment

### Prerequisites

1. **Google Play Console Account** ($25 one-time fee)
2. **Signed APK/AAB** file
3. **App Icons** (various sizes)
4. **Screenshots** (phone, tablet, TV if applicable)
5. **App Description** in required languages

### Steps

1. **Prepare App Bundle**
   ```bash
   # Using Capacitor
   cd android
   ./gradlew bundleRelease
   ```

2. **Create Play Console Listing**
   - App name: ReelRate
   - Description: Movie & Anime Review Platform
   - Category: Entertainment
   - Content rating: Teen (due to movie content)

3. **Upload Assets**
   - High-res icon (512x512)
   - Feature graphic (1024x500)
   - Screenshots (minimum 2, maximum 8)
   - Privacy policy URL

4. **Release Management**
   - Upload signed AAB file
   - Set up release notes
   - Choose release track (internal/alpha/beta/production)

## 🍎 Apple App Store Deployment

### Prerequisites

1. **Apple Developer Account** ($99/year)
2. **Xcode** (Mac required)
3. **App Store Connect** access
4. **Signed IPA** file

### Steps

1. **Prepare iOS App**
   ```bash
   # Using Capacitor
   npx cap open ios
   # Build in Xcode with proper signing
   ```

2. **App Store Connect Setup**
   - Create new app
   - Set bundle ID: com.yourcompany.reelrate
   - Choose app name and category

3. **Upload Binary**
   - Use Xcode or Application Loader
   - Upload signed IPA file

4. **App Store Listing**
   - App description
   - Keywords
   - Screenshots (various device sizes)
   - App icon (1024x1024)
   - Privacy policy

5. **Review Process**
   - Submit for review
   - Respond to any feedback
   - Release when approved

## 🔧 Configuration Files

### PWA Manifest (already configured)
- `public/manifest.json`
- Icons and theme colors set
- Display mode: standalone

### Service Worker (already configured)
- `public/sw.js`
- Caching strategies implemented
- Offline functionality

## 📊 Analytics & Monitoring

Consider adding:
- Google Analytics
- Sentry for error tracking
- Performance monitoring
- User feedback systems

## 🔒 Security Checklist

- [ ] Environment variables secured
- [ ] API keys not exposed in client code
- [ ] HTTPS enabled
- [ ] Content Security Policy configured
- [ ] Rate limiting implemented
- [ ] Input validation in place

## 📞 Support

For deployment issues:
1. Check the logs in your deployment platform
2. Verify environment variables
3. Test locally first
4. Check API rate limits
5. Review security settings

## 🔄 Continuous Deployment

Set up automatic deployment:
- GitHub Actions for CI/CD
- Automatic testing before deployment
- Staging environment for testing
- Production deployment on main branch

---

**Note**: This guide provides general steps. Specific requirements may vary based on your setup and store policies. Always refer to the latest documentation from each platform.