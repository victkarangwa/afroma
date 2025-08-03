# Social Login Setup Guide

This guide will help you set up Google and Facebook login for your Afroma React Native app.

## Overview

The social login implementation includes:
- Google Sign-In using `@react-native-google-signin/google-signin`
- Facebook Login using `react-native-fbsdk-next`
- Proper error handling and user feedback
- Integration with your existing authentication flow

## Prerequisites

1. **Google Cloud Console Account**
2. **Facebook Developers Account**
3. **Expo Development Account** (for app configuration)

## Google Sign-In Setup

### 1. Google Cloud Console Configuration

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google Sign-In API:
   - Go to "APIs & Services" > "Library"
   - Search for "Google Sign-In API"
   - Click "Enable"

### 2. Create OAuth 2.0 Credentials

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth 2.0 Client IDs"
3. Configure for each platform:

#### Android Configuration
- Application type: Android
- Package name: `net.afroma.app`
- SHA-1 certificate fingerprint: (Get this from your keystore)

#### iOS Configuration
- Application type: iOS
- Bundle ID: `net.afroma.app`

#### Web Configuration
- Application type: Web application
- Authorized JavaScript origins: Add your domain
- Authorized redirect URIs: Add your redirect URIs

### 3. Update Configuration

Update `configs/socialLoginConfig.js` with your client IDs:

```javascript
export const socialLoginConfig = {
  google: {
    webClientId: "YOUR_WEB_CLIENT_ID.apps.googleusercontent.com",
    iosClientId: "YOUR_IOS_CLIENT_ID.apps.googleusercontent.com",
    androidClientId: "YOUR_ANDROID_CLIENT_ID.apps.googleusercontent.com",
  },
  // ... facebook config
};
```

## Facebook Login Setup

### 1. Facebook App Creation

1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Create a new app or select an existing one
3. Add the "Facebook Login" product to your app

### 2. Configure Platforms

#### iOS Configuration
1. In your Facebook app dashboard, go to "Settings" > "Basic"
2. Add iOS platform
3. Bundle ID: `net.afroma.app`
4. Enable Single Sign On

#### Android Configuration
1. Add Android platform
2. Package Name: `net.afroma.app`
3. Key Hashes: Add your app's key hashes
4. Enable Single Sign On

### 3. Update Configuration

Update `configs/socialLoginConfig.js` with your Facebook app details:

```javascript
export const socialLoginConfig = {
  // ... google config
  facebook: {
    appId: "YOUR_FACEBOOK_APP_ID",
    clientToken: "YOUR_FACEBOOK_CLIENT_TOKEN",
    displayName: "Afroma",
    scheme: "fbYOUR_FACEBOOK_APP_ID",
  }
};
```

### 4. Update App Configuration

Update `app.json` with your Facebook app ID:

```json
{
  "expo": {
    "plugins": [
      [
        "react-native-fbsdk-next",
        {
          "appID": "YOUR_FACEBOOK_APP_ID",
          "clientToken": "YOUR_FACEBOOK_CLIENT_TOKEN",
          "displayName": "Afroma",
          "scheme": "fbYOUR_FACEBOOK_APP_ID"
        }
      ]
    ]
  }
}
```

## Backend Integration

Your backend should handle the following endpoints:

### Google Login Endpoint
```
POST /auth/google/login
Content-Type: application/json

{
  "token": "GOOGLE_ID_TOKEN",
  "provider": "google"
}
```

### Facebook Login Endpoint
```
POST /auth/facebook/login
Content-Type: application/json

{
  "token": "FACEBOOK_ACCESS_TOKEN",
  "provider": "facebook"
}
```

### Expected Response Format
```json
{
  "code": "00",
  "token": "JWT_TOKEN",
  "expiresAt": "2024-12-31T23:59:59Z",
  "message": "Login successful"
}
```

## Testing

### Google Sign-In Testing
1. Ensure Google Play Services is installed on Android
2. Test on both Android and iOS devices
3. Verify token generation and backend communication

### Facebook Login Testing
1. Test on both Android and iOS devices
2. Verify permissions are requested correctly
3. Test token generation and backend communication

## Troubleshooting

### Common Issues

1. **Google Sign-In not working on Android**
   - Verify SHA-1 fingerprint is correct
   - Check Google Play Services is installed
   - Ensure webClientId is correct

2. **Facebook Login not working**
   - Verify app ID and client token
   - Check platform configuration
   - Ensure app is not in development mode for production

3. **Token validation issues**
   - Verify backend endpoints are correct
   - Check token format and expiration
   - Ensure proper error handling

### Debug Steps

1. Check console logs for detailed error messages
2. Verify network requests in browser dev tools
3. Test with different user accounts
4. Verify app configuration in respective developer consoles

## Security Considerations

1. **Token Validation**: Always validate tokens on the backend
2. **User Data**: Handle user data securely
3. **Error Handling**: Don't expose sensitive information in error messages
4. **App Review**: Follow platform guidelines for app store approval

## Additional Resources

- [Google Sign-In Documentation](https://developers.google.com/identity/sign-in/android)
- [Facebook Login Documentation](https://developers.facebook.com/docs/facebook-login/)
- [React Native Google Sign-In](https://github.com/react-native-google-signin/google-signin)
- [React Native FBSDK Next](https://github.com/thebergamo/react-native-fbsdk-next) 