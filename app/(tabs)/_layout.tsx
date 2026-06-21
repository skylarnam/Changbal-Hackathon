import { router, Tabs, usePathname } from "expo-router";
import { Pressable, Text } from "react-native";
import { colors } from "../../src/components/ui";

export default function TabLayout() {
  const pathname = usePathname();

  return (
    <Tabs
      initialRouteName="vanity"
      screenOptions={{
        headerShown: false,
        headerStyle: {
          backgroundColor: colors.background
        },
        headerTintColor: colors.text,
        headerTitleStyle: {
          fontWeight: "800"
        },
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          height: 78,
          paddingTop: 10,
          paddingBottom: 18
        },
        tabBarLabelStyle: {
          fontSize: 13.9,
          fontWeight: "800"
        },
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.muted
      }}
    >
      <Tabs.Screen
        name="vanity"
        options={{
          title: "My Vanity",
          tabBarButtonTestID: "tab-vanity",
          tabBarButton: () => (
            <TabButton title="My Vanity" active={pathname.includes("/vanity") || pathname === "/"} onPress={() => router.push("/(tabs)/vanity")} />
          )
        }}
      />
      <Tabs.Screen
        name="scan"
        options={{
          title: "Scan",
          tabBarButtonTestID: "tab-scan",
          tabBarButton: () => (
            <TabButton title="Scan" active={false} testID="tab-scan" onPress={() => router.push("/scan-modal")} />
          )
        }}
      />
      <Tabs.Screen
        name="routine"
        options={{
          title: "My Routine",
          tabBarButtonTestID: "tab-routine",
          tabBarButton: () => (
            <TabButton title="My Routine" active={pathname.includes("/routine")} onPress={() => router.push("/(tabs)/routine")} />
          )
        }}
      />
      <Tabs.Screen
        name="discover"
        options={{
          title: "Discover",
          href: null
        }}
      />
    </Tabs>
  );
}

function TabButton({ title, active, onPress, testID }: { title: string; active: boolean; onPress: () => void; testID?: string }) {
  return (
    <Pressable accessibilityRole="button" testID={testID} onPress={onPress} style={{ alignItems: "center", justifyContent: "center", flex: 1, minHeight: 56, paddingTop: 4 }}>
      <Text style={{ color: active ? colors.text : colors.muted, fontSize: 13.9, fontWeight: "800" }}>{title}</Text>
    </Pressable>
  );
}
