# Apple App Store Setup Guide for ReelRate

## 📋 Prerequisites

1. **Apple Developer Account** ($99/year)
2. **Mac computer** with macOS (required for iOS development)
3. **Xcode** (latest version from Mac App Store)
4. **Capacitor CLI** installed globally
5. **iOS Simulator** or physical iOS device for testing

## 🛠️ Step 1: Install Required Dependencies

```bash
# Install Capacitor iOS platform (if not already done)
npm install @capacitor/ios @capacitor/splash-screen @capacitor/status-bar @capacitor/keyboard @capacitor/app

# Add iOS platform
npx cap add ios
```

## 🏗️ Step 2: Build and Prepare iOS Project

```bash
# Build the Next.js project
npm run build
npm run export

# Sync with Capacitor
npx cap sync ios

# Open in Xcode
npx cap open ios
```

## 📱 Step 3: Configure iOS App in Xcode

### 1. Project Settings

1. Open the project in Xcode
2. Select the project root in the navigator
3. Under "TARGETS", select "App"
4. In the "General" tab:
   - **Display Name**: ReelRate
   - **Bundle Identifier**: com.reelrate.app
   - **Version**: 1.0.0
   - **Build**: 1
   - **Deployment Target**: iOS 13.0 or higher

### 2. App Icons

1. In Xcode, navigate to `App/App/Assets.xcassets/AppIcon.appiconset`
2. Add app icons for all required sizes:
   - 20x20 (2x, 3x)
   - 29x29 (2x, 3x)
   - 40x40 (2x, 3x)
   - 60x60 (2x, 3x)
   - 76x76 (1x, 2x)
   - 83.5x83.5 (2x)
   - 1024x1024 (1x) - App Store icon

### 3. Launch Screen

1. Navigate to `App/App/Base.lproj/LaunchScreen.storyboard`
2. Customize the launch screen with your app branding
3. Use your app colors and logo

### 4. Info.plist Configuration

Edit `App/App/Info.plist`:

```xml
<key>CFBundleDisplayName</key>
<string>ReelRate</string>
<key>CFBundleName</key>
<string>ReelRate</string>
<key>CFBundleShortVersionString</key>
<string>1.0.0</string>
<key>CFBundleVersion</key>
<string>1</string>
<key>NSAppTransportSecurity</key>
<dict>
    <key>NSAllowsArbitraryLoads</key>
    <true/>
</dict>
<key>UIRequiredDeviceCapabilities</key>
<array>
    <string>armv7</string>
</array>
<key>UISupportedInterfaceOrientations</key>
<array>
    <string>UIInterfaceOrientationPortrait</string>
    <string>UIInterfaceOrientationPortraitUpsideDown</string>
</array>
```

### 5. Capabilities

In Xcode project settings, under "Signing & Capabilities":
- Enable "App Groups" if using shared data
- Add "Background Modes" if needed (background refresh, etc.)
- Configure "Push Notifications" if using notifications

## 🔐 Step 4: Code Signing and Provisioning

### 1. Apple Developer Account Setup

1. Go to [Apple Developer Portal](https://developer.apple.com/account/)
2. Create App ID:
   - **Description**: ReelRate
   - **Bundle ID**: com.reelrate.app
   - **Capabilities**: Select required capabilities

### 2. Certificates

1. Create iOS Distribution Certificate:
   - Go to "Certificates, Identifiers & Profiles"
   - Create new certificate for "iOS Distribution"
   - Download and install in Keychain

### 3. Provisioning Profiles

1. Create App Store Distribution Provisioning Profile:
   - Select your App ID
   - Select your Distribution Certificate
   - Download and install

### 4. Xcode Signing

In Xcode project settings:
1. Select "Automatically manage signing" OR
2. Manually select your provisioning profile
3. Ensure "Release" configuration uses Distribution profile

## 🏪 Step 5: App Store Connect Setup

### 1. Create App Record

1. Go to [App Store Connect](https://appstoreconnect.apple.com/)
2. Click "My Apps" > "+" > "New App"
3. Fill in details:
   - **Platform**: iOS
   - **Name**: ReelRate
   - **Primary Language**: Thai (or your preferred language)
   - **Bundle ID**: com.reelrate.app
   - **SKU**: reelrate-ios-app (unique identifier)

### 2. App Information

#### General Information
- **Name**: ReelRate - รีวิวหนังและอนิเมะ
- **Subtitle**: แอปรีวิวหนังและอนิเมะที่ดีที่สุด
- **Category**: Entertainment
- **Secondary Category**: Lifestyle (optional)

#### Localizations
Add Thai and English localizations with appropriate descriptions.

### 3. Pricing and Availability

- **Price**: Free
- **Availability**: All countries/regions (or select specific ones)
- **App Store Distribution**: Available on the App Store

### 4. App Store Listing

#### App Description (Thai)
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

ดาวน์โหลดวันนี้และเริ่มต้นการเดินทางรีวิวของคุณ!
```

#### Keywords (Thai)
```
หนัง, อนิเมะ, รีวิว, ให้คะแนน, ชุมชน, บันเทิง, ภาพยนตร์, การ์ตูน, ดูหนัง, ดูอนิเมะ
```

#### Screenshots

**iPhone Screenshots** (Required - 3-10 screenshots):
- 6.7" Display (iPhone 14 Pro Max): 1290x2796
- 6.5" Display (iPhone 11 Pro Max): 1242x2688
- 5.5" Display (iPhone 8 Plus): 1242x2208

**iPad Screenshots** (Optional):
- 12.9" Display (iPad Pro): 2048x2732
- 11" Display (iPad Pro): 1668x2388

#### App Preview Videos (Optional)
- 30-second videos showing app functionality
- Same sizes as screenshots

### 5. App Review Information

#### Contact Information
- **First Name**: Your first name
- **Last Name**: Your last name
- **Phone Number**: Your contact number
- **Email**: Your contact email

#### Demo Account (if login required)
- **Username**: demo@reelrate.app
- **Password**: DemoPassword123
- **Additional Info**: Any special instructions for reviewers

#### Notes
```
ReelRate is a movie and anime review application that allows users to:
1. Search and discover movies and anime
2. Write and read reviews
3. Rate content on a 5-star scale
4. Create personal favorite lists
5. Join a community of reviewers

The app uses TMDB API for movie data and Jikan API for anime data.
All user-generated content is moderated and follows community guidelines.

Test account credentials:
Username: demo@reelrate.app
Password: DemoPassword123

Please test the search, review, and rating features.
```

### 6. Age Rating

Complete the age rating questionnaire:
- **Age Rating**: 12+ (due to movie content)
- **Frequent/Intense**: Select appropriate levels for:
  - Cartoon or Fantasy Violence
  - Realistic Violence
  - Sexual Content or Nudity
  - Profanity or Crude Humor
  - Simulated Gambling
  - Horror/Fear Themes
  - Mature/Suggestive Themes
  - Alcohol, Tobacco, or Drug Use

## 📤 Step 6: Build and Upload

### 1. Archive the App

In Xcode:
1. Select "Any iOS Device" as the destination
2. Go to "Product" > "Archive"
3. Wait for the archive to complete
4. The Organizer window will open

### 2. Upload to App Store Connect

In Xcode Organizer:
1. Select your archive
2. Click "Distribute App"
3. Choose "App Store Connect"
4. Select "Upload"
5. Follow the prompts to upload

### 3. Processing

- Wait for Apple to process your build (can take several hours)
- You'll receive an email when processing is complete
- The build will appear in App Store Connect under "TestFlight" and "App Store"

## 🔍 Step 7: Submit for Review

### 1. Select Build

In App Store Connect:
1. Go to your app's "App Store" tab
2. Click "+" next to "iOS App"
3. Select your uploaded build
4. Save

### 2. Complete All Sections

Ensure all sections are complete:
- ✅ App Information
- ✅ Pricing and Availability  
- ✅ App Store Listing
- ✅ App Review Information
- ✅ Version Information
- ✅ Build selected

### 3. Submit

1. Click "Submit for Review"
2. Answer additional questions if prompted
3. Confirm submission

## ⏱️ Step 8: Review Process

### Timeline
- **Review Time**: 24-48 hours (typically)
- **Status Updates**: Check App Store Connect for updates
- **Email Notifications**: Apple will email status changes

### Possible Outcomes

#### Approved ✅
- App goes live on App Store
- Users can download immediately
- Celebrate! 🎉

#### Rejected ❌
- Review feedback in Resolution Center
- Address issues and resubmit
- Common rejection reasons:
  - App crashes or doesn't work as expected
  - Missing functionality described in metadata
  - Inappropriate content
  - Privacy policy issues
  - Design guideline violations

## 🔄 Step 9: Post-Launch

### Updates
1. Increment version number in Xcode
2. Build and upload new version
3. Update App Store listing if needed
4. Submit for review

### Monitoring
- Monitor crash reports in Xcode Organizer
- Check App Store Connect Analytics
- Respond to user reviews
- Track downloads and user engagement

### TestFlight (Beta Testing)
- Use TestFlight for beta testing before public release
- Invite up to 10,000 external testers
- Get feedback before App Store submission

## 🚨 Common Issues and Solutions

### Build Issues
- **Code Signing**: Ensure certificates and provisioning profiles are valid
- **Xcode Version**: Use latest Xcode version
- **iOS Version**: Test on minimum supported iOS version

### Upload Issues
- **Large App Size**: Optimize images and assets
- **Invalid Binary**: Check for missing architectures or invalid code signing
- **Metadata Issues**: Ensure all required fields are filled

### Review Rejections
- **Guideline 2.1**: App crashes or has bugs
- **Guideline 4.3**: Spam or duplicate functionality
- **Guideline 5.1.1**: Privacy policy missing or inadequate
- **Design Guidelines**: UI doesn't follow iOS design principles

### Performance Issues
- **App Size**: Keep under 150MB for cellular downloads
- **Launch Time**: App should launch in under 20 seconds
- **Memory Usage**: Monitor memory usage on older devices

## 📞 Support Resources

- [App Store Connect Help](https://help.apple.com/app-store-connect/)
- [iOS App Store Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)
- [Capacitor iOS Documentation](https://capacitorjs.com/docs/ios)
- [Apple Developer Forums](https://developer.apple.com/forums/)

## 💡 Tips for Success

1. **Test Thoroughly**: Test on multiple devices and iOS versions
2. **Follow Guidelines**: Read and follow Apple's guidelines carefully
3. **Quality Screenshots**: Use high-quality, representative screenshots
4. **Clear Description**: Write clear, accurate app descriptions
5. **Privacy Policy**: Ensure your privacy policy is comprehensive and accessible
6. **Respond Quickly**: Address review feedback promptly
7. **Beta Test**: Use TestFlight to catch issues before submission

---

**Note**: The iOS app submission process is more stringent than Android. Allow extra time for review and potential revisions. Apple prioritizes user experience and security, so ensure your app meets their high standards.