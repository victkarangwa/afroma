import "react-native-get-random-values";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { router, Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { useColorScheme, LogBox } from "react-native";
import { PaperProvider } from "react-native-paper";
import "react-native-reanimated";
import { StatusBar } from "expo-status-bar";
import Toast from "react-native-toast-message";
import { ApiProvider, UserProvider } from "@/context";
import LocalStorage from "@/utils/storage";

// Ignore all warnings
LogBox.ignoreAllLogs();

export const unstable_settings = {
  // Ensure any route can link back to `/`
  initialRouteName: "starters/index",
};

export default function RootLayout() {
  const colorScheme = useColorScheme() === "dark" ? "light" : "light"; // force light theme
  const [loaded] = useFonts({
    SpaceMono: require("@/assets/fonts/SpaceMono-Regular.ttf"),
  });

  useEffect(() => {
    const fetchData = async () => {
      if (loaded) {
        try {
          // await SplashScreen.hideAsync();
          
          // Check for auth token
          const authToken = await LocalStorage.getItem("authToken");
          const tokenExpiresAt = await LocalStorage.getItem("tokenExpiresAt");

          console.log("authToken", authToken);
          console.log("tokenExpiresAt", tokenExpiresAt);
          
          // Check if token exists and is not expired
          if (authToken && tokenExpiresAt && typeof tokenExpiresAt === 'string') {
            console.log("authToken and tokenExpiresAt found");
            const expirationDate = new Date(tokenExpiresAt);
            const currentDate = new Date();
            
            if (currentDate < expirationDate) {
              console.log("Valid token found, navigating to home screen");
              router.replace({ pathname: "/(tabs)" });
              return;
            } else {
              console.log("Token expired, clearing storage");
              await LocalStorage.removeItem("authToken");
              await LocalStorage.removeItem("tokenExpiresAt");
            }
          }
          
          // Fallback to old token check for backward compatibility
          const oldToken = await LocalStorage.getItem("token");
          if (oldToken && oldToken !== undefined) {
            console.log("Old token found, navigating to home screen");
            router.replace({ pathname: "/(tabs)" });
            return;
          }
          
          console.log("No valid token found, navigating to registration");
          router.replace({ pathname: "/starters" });
        } catch (error) {
          console.error("Initialization Error:", error);
          // On error, navigate to registration
          router.replace({ pathname: "/starters" });
        }
      }
    };
    fetchData();
  }, [loaded]);

  // modify default theme
  const theme = {
    ...DefaultTheme,
    colors: {
      primary: "#fb6c31",
      outline: "#fb6c31",
      link: "#fb6c31",
    },
  };

  return (
    <ApiProvider>
      <UserProvider>
        <ThemeProvider
          value={colorScheme === "dark" ? DarkTheme : DefaultTheme}
        >
          <PaperProvider theme={colorScheme === "dark" ? DarkTheme : theme}>
            <Toast topOffset={80} />
            <StatusBar style="auto" />
            <Stack>
              <Stack.Screen
                name="starters/index"
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="getStarted/lookingFor"
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="form/completeProfile"
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="form/categoryProfile"
                options={{ headerShown: false }}
              />
              {/* <Stack.Screen
                name="getStarted/index"
                options={{ headerShown: false }}
              /> */}
              <Stack.Screen
                name="getStarted/login"
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="getStarted/otp"
                options={{ headerShown: false }}
              />
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen
                name="form/profile"
                options={{
                  headerTitle: "Edit Profile",
                  headerTitleAlign: "center",
                  headerBackTitle: "Back",
                  headerTintColor: "#fb6c31",
                }}
              />
              <Stack.Screen
                name="form/pictures"
                options={{
                  headerTitle: "Add Pictures",
                  headerTitleAlign: "center",
                }}
              />
              <Stack.Screen
                name="chats/room"
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="match/index"
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="payment/index"
                options={{
                  headerTitle: "Upgrade Account",
                  headerTitleAlign: "center",
                  // headerStyle: { backgroundColor: "#fb6c31" },
                  headerTintColor: "#fb6c31",
                  headerBackTitle: "Back",
                }}
              />
              <Stack.Screen
                name="forum/index"
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="forum/specificPost"
                options={{
                  headerTitle: "View Post",
                  headerTitleAlign: "center",
                  headerBackTitle: "Forums",
                  headerTintColor: "#fb6c31",
                }}
              />
              <Stack.Screen
                name="forum/newPost"
                options={{
                  headerTitle: "Create Post",
                  headerTitleAlign: "center",
                }}
              />
              <Stack.Screen
                name="getStarted/accountType"
                options={{ headerShown: false }}
              />
               <Stack.Screen
                name="posts/create"
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="notifications/index"
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="getStarted/profileInfo"
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="webview/termsAndConditions"
                options={{
                  headerTitle: "Terms and Conditions",
                  headerTitleAlign: "center",
                }}
              />
              <Stack.Screen
                name="webview/privacyPolicy"
                options={{
                  headerTitle: "Privacy Policy",
                  headerTitleAlign: "center",
                }}
              />
              <Stack.Screen
                name="faq/index"
                options={{
                  headerTitle: "Afroma FAQs",
                  headerTitleAlign: "center",
                }}
              />
              <Stack.Screen
                name="settings/index"
                options={{
                  headerTitle: "Settings",
                  headerTitleAlign: "center",
                  headerBackTitle: "Back",
                  headerTintColor: "#fb6c31",
                }}
              />
              <Stack.Screen
                name="getStarted/forgetPassword"
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="getStarted/verifyResetOtp"
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="getStarted/resetPassword"
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="profile-questions"
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="basic-profile"
                options={{ headerShown: false }}
              />
              <Stack.Screen name="+not-found" />
            </Stack>
          </PaperProvider>
        </ThemeProvider>
      </UserProvider>
    </ApiProvider>
  );
}
