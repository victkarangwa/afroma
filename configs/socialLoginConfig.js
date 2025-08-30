// Social Login Configuration
// Update these values with your actual app credentials

export const socialLoginConfig = {
  google: {
    webClientId: "104521571553-70cj474frto1ascll6mfukhilpveqdvp.apps.googleusercontent.com", // Already configured in SocialLogin component
    iosClientId: "YOUR_IOS_CLIENT_ID", // Add your iOS client ID here
    androidClientId: "YOUR_ANDROID_CLIENT_ID", // Add your Android client ID here
  },
  facebook: {
    appId: "1921081955393227", // Replace with your Facebook App ID
    clientToken: "b3408f0f4a88fbf5eb88ca6469240b35", // Replace with your Facebook Client Token
    displayName: "Afroma",
    scheme: "fb1921081955393227", // Replace with your Facebook App ID
  }
};

// Instructions for setup:
// 1. Google Sign-In:
//    - Go to Google Cloud Console (https://console.cloud.google.com/)
//    - Create a project or select existing one
//    - Enable Google Sign-In API
//    - Create OAuth 2.0 credentials for Android and iOS
//    - Update the client IDs above

// 2. Facebook Login:
//    - Go to Facebook Developers (https://developers.facebook.com/)
//    - Create a new app or select existing one
//    - Add Facebook Login product
//    - Configure iOS and Android platforms
//    - Update the app ID and client token above

export default socialLoginConfig; 