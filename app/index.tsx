import { Redirect } from "expo-router";
import { ActivityIndicator, View } from "react-native";
import { useAppState } from "../src/state/AppContext";

export default function IndexRoute() {
  const { state, loading } = useAppState();

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator />
      </View>
    );
  }

  if (!state.onboardingComplete || !state.profile) {
    return <Redirect href="/onboarding" />;
  }

  return <Redirect href="/(tabs)/discover" />;
}
