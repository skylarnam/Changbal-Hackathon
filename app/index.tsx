import { ActivityIndicator, View } from "react-native";
import { LovableFlow } from "../src/components/LovableFlow";
import { useAppState } from "../src/state/AppContext";

export default function IndexRoute() {
  const { loading } = useAppState();

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator />
      </View>
    );
  }

  return <LovableFlow />;
}
