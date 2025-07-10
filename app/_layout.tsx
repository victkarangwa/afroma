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
          await SplashScreen.hideAsync();
          const token = await LocalStorage.getItem("token");
          if (token && token !== undefined) {
            router.replace({ pathname: "/(tabs)" });
            return;
          }
          // if (router.canDismiss()) router.dismissAll();
          router.replace({ pathname: "/getStarted/accountType" });
        } catch (error) {
          console.error("Initialization Error:", error);
        }
      }
    };
    fetchData();
  }, [loaded]);

  // modify default theme
  const theme = {
    ...DefaultTheme,
    colors: {
      primary: "#eca899",
      outline: "#eca899",
      link: "#eca899",
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
              <Stack.Screen
                name="getStarted/index"
                options={{ headerShown: false }}
              />
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
                  headerTintColor: "#eca899",
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
                  // headerStyle: { backgroundColor: "#eca899" },
                  headerTintColor: "#eca899",
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
                  headerTintColor: "#eca899",
                }}
              />
              <Stack.Screen name="+not-found" />
            </Stack>
          </PaperProvider>
        </ThemeProvider>
      </UserProvider>
    </ApiProvider>
  );
}
