import { Tabs } from "expo-router";
import { colors } from "../../src/components/ui";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.muted
      }}
    >
      <Tabs.Screen
        name="discover"
        options={{
          title: "발견",
          tabBarButtonTestID: "tab-discover"
        }}
      />
      <Tabs.Screen
        name="scan"
        options={{
          title: "스캔",
          tabBarButtonTestID: "tab-scan"
        }}
      />
      <Tabs.Screen
        name="vanity"
        options={{
          title: "내 화장대",
          tabBarButtonTestID: "tab-vanity"
        }}
      />
    </Tabs>
  );
}
