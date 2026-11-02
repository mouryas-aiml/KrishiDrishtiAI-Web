import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAppStore } from "../../src/store";
import { getCopy } from "../../src/localization";

export default function TabsLayout() {
  const copy = getCopy(useAppStore((state) => state.language));
  return (
    <Tabs screenOptions={{
      headerShown: false,
      tabBarActiveTintColor: "#0B3D2E",
      tabBarInactiveTintColor: "#7A8A83",
      tabBarStyle: { height: 68, paddingBottom: 10, paddingTop: 8, backgroundColor: "#FFFFFF" }
    }}>
      <Tabs.Screen name="index" options={{ title: copy.home, tabBarIcon: ({ color, size }) => <Ionicons name="leaf" color={color} size={size} /> }} />
      <Tabs.Screen name="scan" options={{ title: copy.scan, tabBarIcon: ({ color, size }) => <Ionicons name="scan" color={color} size={size} /> }} />
      <Tabs.Screen name="assistant" options={{ title: copy.assistant, tabBarIcon: ({ color, size }) => <Ionicons name="chatbubbles" color={color} size={size} /> }} />
      <Tabs.Screen name="history" options={{ title: copy.history, tabBarIcon: ({ color, size }) => <Ionicons name="time" color={color} size={size} /> }} />
      <Tabs.Screen name="profile" options={{ title: copy.profile, tabBarIcon: ({ color, size }) => <Ionicons name="person" color={color} size={size} /> }} />
    </Tabs>
  );
}
