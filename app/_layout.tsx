import { Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AppProvider } from "../src/state/AppContext";

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AppProvider>
        <Stack screenOptions={{ headerBackTitle: "뒤로" }}>
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="onboarding" options={{ title: "피부 프로필" }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="profile" options={{ title: "프로필 수정" }} />
          <Stack.Screen name="scan/review" options={{ title: "분석 검토" }} />
          <Stack.Screen name="product/[id]" options={{ title: "제품 상세" }} />
          <Stack.Screen name="vanity/analysis" options={{ title: "화장대 분석" }} />
          <Stack.Screen name="creator/[id]" options={{ title: "공개 화장대" }} />
          <Stack.Screen name="pro" options={{ title: "Pro 데모" }} />
          <Stack.Screen name="purchase/[productId]" options={{ title: "구매처 보기" }} />
        </Stack>
      </AppProvider>
    </SafeAreaProvider>
  );
}
