import { Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AppProvider } from "../src/state/AppContext";

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AppProvider>
        <Stack screenOptions={{ headerBackTitle: "Back" }}>
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="onboarding" options={{ title: "Skin Profile" }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="scan-modal" options={{ headerShown: false, presentation: "transparentModal", animation: "fade" }} />
          <Stack.Screen name="profile" options={{ title: "Edit Profile" }} />
          <Stack.Screen name="scan/review" options={{ title: "Review Analysis" }} />
          <Stack.Screen name="product/[id]" options={{ title: "Product Details" }} />
          <Stack.Screen name="vanity/analysis" options={{ title: "Vanity Analysis" }} />
          <Stack.Screen name="creator/[id]" options={{ title: "Public Vanity" }} />
          <Stack.Screen name="pro" options={{ title: "Pro Demo" }} />
          <Stack.Screen name="purchase/[productId]" options={{ title: "Where to Buy" }} />
        </Stack>
      </AppProvider>
    </SafeAreaProvider>
  );
}
