# Google Play Store Setup Guide for ReelRate

## 📋 Prerequisites

1. **Google Play Console Account** ($25 one-time registration fee)
2. **Android Studio** installed
3. **Java Development Kit (JDK)** 8 or higher
4. **Capacitor CLI** installed globally

## 🛠️ Step 1: Install Required Dependencies

```bash
# Install Capacitor CLI globally
npm install -g @capacitor/cli

# Install Capacitor core and Android platform
npm install @capacitor/core @capacitor/android @capacitor/splash-screen @capacitor/status-bar @capacitor/keyboard @capacitor/app

# Initialize Capacitor (if not already done)
npx cap init reelrate com.reelrate.app --web-dir=out

# Add Android platform
npx cap add android
```

## 🏗️ Step 2: Build the Project

```bash
# Build the Next.js project for static export
npm run build
npm run export

# Sync with Capacitor
npx cap sync android

# Open in Android Studio
npx cap open android
```

## 📱 Step 3: Configure Android App

### Update Android Manifest
Edit `android/app/src/main/AndroidManifest.xml`:

```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
<uses-permission android:name="android.permission.ACCESS_WIFI_STATE" />
<uses-permission android:name="android.permission.CAMERA" />
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
```

### Update App Icons
Replace icons in `android/app/src/main/res/`:
- `mipmap-hdpi/` (72x72)
- `mipmap-mdpi/` (48x48)
- `mipmap-xhdpi/` (96x96)
- `mipmap-xxhdpi/` (144x144)
- `mipmap-xxxhdpi/` (192x192)

### Update App Name and Theme
Edit `android/app/src/main/res/values/strings.xml`:

```xml
<resources>
    <string name="app_name">ReelRate</string>
    <string name="title_activity_main">ReelRate</string>
    <string name="package_name">com.reelrate.app</string>
    <string name="custom_url_scheme">com.reelrate.app</string>
</resources>
```

## 🔐 Step 4: Generate Signed APK/AAB

### Create Keystore
```bash
keytool -genkey -v -keystore reelrate-release-key.keystore -alias reelrate -keyalg RSA -keysize 2048 -validity 10000
```

### Configure Gradle Signing
Edit `android/app/build.gradle`:

```gradle
android {
    ...
    signingConfigs {
        release {
            if (project.hasProperty('MYAPP_RELEASE_STORE_FILE')) {
                storeFile file(MYAPP_RELEASE_STORE_FILE)
                storePassword MYAPP_RELEASE_STORE_PASSWORD
                keyAlias MYAPP_RELEASE_KEY_ALIAS
                keyPassword MYAPP_RELEASE_KEY_PASSWORD
            }
        }
    }
    buildTypes {
        release {
            signingConfig signingConfigs.release
            minifyEnabled false
            proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
        }
    }
}
```

### Create gradle.properties
Create `android/gradle.properties`:

```properties
MYAPP_RELEASE_STORE_FILE=reelrate-release-key.keystore
MYAPP_RELEASE_KEY_ALIAS=reelrate
MYAPP_RELEASE_STORE_PASSWORD=your_keystore_password
MYAPP_RELEASE_KEY_PASSWORD=your_key_password
```

### Build Release AAB
```bash
cd android
./gradlew bundleRelease
```

## 🏪 Step 5: Google Play Console Setup

### 1. Create App Listing

1. Go to [Google Play Console](https://play.google.com/console)
2. Click "Create app"
3. Fill in app details:
   - **App name**: ReelRate
   - **Default language**: Thai (or your preferred language)
   - **App or game**: App
   - **Free or paid**: Free

### 2. Store Listing

#### App Details
- **App name**: ReelRate - รีวิวหนังและอนิเมะ
- **Short description**: แอปรีวิวหนังและอนิเมะที่ดีที่สุด พร้อมระบบให้คะแนนและชุมชนรีวิวเวอร์
- **Full description**:
```
ReelRate เป็นแอปพลิเคชันรีวิวหนังและอนิเมะที่ครบครันที่สุด ให้คุณค้นพบ รีวิว และให้คะแนนหนังและอนิเมะโปรดของคุณ

✨ คุณสมบัติเด่น:
🎬 ค้นหาหนังและอนิเมะจากฐานข้อมูลขนาดใหญ่
⭐ ระบบให้คะแนนและรีวิวที่ง่ายต่อการใช้งาน
👥 ชุมชนรีวิวเวอร์ที่มีส่วนร่วม
❤️ รายการโปรดส่วนตัว
🔔 การแจ้งเตือนสำหรับหนังและอนิเมะใหม่
🌐 รองรับหลายภาษา (ไทย/อังกฤษ)
📱 ใช้งานได้ทั้งออนไลน์และออฟไลน์

เหมาะสำหรับผู้ที่รักการดูหนังและอนิเมะ และต้องการแบ่งปันความคิดเห็นกับชุมชน
```

#### Graphics
- **App icon**: 512x512 PNG (high-res version of your app icon)
- **Feature graphic**: 1024x500 PNG
- **Screenshots**: 
  - Phone: 2-8 screenshots (16:9 or 9:16 aspect ratio)
  - 7-inch tablet: 1-8 screenshots (optional)
  - 10-inch tablet: 1-8 screenshots (optional)

#### Categorization
- **App category**: Entertainment
- **Tags**: Movies, Anime, Reviews, Entertainment
- **Content rating**: Teen (due to movie content)

### 3. Content Rating

Complete the content rating questionnaire:
- Select "Entertainment" category
- Answer questions about violence, sexual content, etc.
- Most movie/anime apps get "Teen" rating

### 4. Target Audience

- **Target age group**: 13+ (Teen and Adult)
- **Appeals to children**: No (unless specifically designed for children)

### 5. Privacy Policy

Create and host a privacy policy that covers:
- Data collection (user profiles, reviews, preferences)
- Third-party services (TMDB, Jikan API, Supabase)
- User rights and data deletion
- Contact information

Example URL: `https://your-domain.com/privacy-policy`

### 6. App Access

- **Special access**: None required for basic functionality
- **Permissions**: Explain why you need internet, storage, camera permissions

## 📤 Step 6: Upload and Release

### 1. Upload App Bundle

1. Go to "Release" > "Production"
2. Click "Create new release"
3. Upload your signed AAB file
4. Add release notes:

```
🎉 ReelRate เวอร์ชันแรก!

✨ คุณสมบัติใหม่:
- ค้นหาและรีวิวหนังและอนิเมะ
- ระบบให้คะแนนที่ใช้งานง่าย
- ชุมชนรีวิวเวอร์
- รายการโปรดส่วนตัว
- รองรับภาษาไทยและอังกฤษ
- ใช้งานได้แบบออฟไลน์

📱 เริ่มต้นการเดินทางรีวิวหนังและอนิเมะของคุณวันนี้!
```

### 2. Review and Publish

1. Review all sections for completeness
2. Submit for review
3. Wait for Google's approval (usually 1-3 days)
4. Once approved, your app will be live on Google Play Store

## 🔄 Step 7: Post-Launch

### Updates
- Use the same signing key for all updates
- Increment version code in `android/app/build.gradle`
- Test thoroughly before releasing updates

### Monitoring
- Monitor crash reports in Play Console
- Respond to user reviews
- Track app performance and user engagement

### Marketing
- Optimize store listing based on user feedback
- Use Google Play's promotional tools
- Consider running ads or promotional campaigns

## 🚨 Common Issues and Solutions

### Build Errors
- Ensure all dependencies are installed
- Check Android SDK and build tools versions
- Clean and rebuild: `./gradlew clean && ./gradlew bundleRelease`

### Signing Issues
- Verify keystore path and passwords
- Ensure keystore is in the correct location
- Check gradle.properties configuration

### Upload Issues
- Ensure version code is incremented
- Check that AAB is properly signed
- Verify app bundle meets Google Play requirements

### Review Rejections
- Common reasons: missing privacy policy, inappropriate content, technical issues
- Address feedback and resubmit
- Ensure compliance with Google Play policies

## 📞 Support Resources

- [Google Play Console Help](https://support.google.com/googleplay/android-developer/)
- [Capacitor Android Documentation](https://capacitorjs.com/docs/android)
- [Android Developer Documentation](https://developer.android.com/)

---

**Note**: This process may take several days to complete, especially for first-time submissions. Be patient and thorough in following Google Play's guidelines.