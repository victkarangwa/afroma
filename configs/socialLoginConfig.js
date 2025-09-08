// Social Login Configuration
// Update these values with your actual app credentials

export const socialLoginConfig = {
  google: {
    webClientId: "264350061976-qe2m1m1gc5cs8a0mh1hhq3i64j8s1n5i.apps.googleusercontent.com",
    iosClientId: "264350061976-tsqp24rnknu5915rb7spu7gh13mce25m.apps.googleusercontent.com",
    androidClientId: "264350061976-vg2ud9s6hl22iv4h05rrsm69uv2lhv29.apps.googleusercontent.com",
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