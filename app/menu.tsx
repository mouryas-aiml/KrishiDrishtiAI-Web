import { useRouter } from "expo-router";
import { Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { getCopy } from "../src/localization";
import { useAppStore } from "../src/store";

export default function MenuScreen() {
  const router = useRouter();
  const copy = getCopy(useAppStore((state) => state.language));
  return <SafeAreaView className="flex-1 bg-forest"><View className="p-6"><Pressable onPress={() => router.back()}><Text className="text-3xl text-white">×</Text></Pressable><Text className="mt-8 text-3xl font-bold text-white">{copy.appName}</Text>{[["scan", copy.scan], ["history", copy.history], ["profile", copy.profile], ["diseases", copy.diseases], ["settings", copy.settings], ["about", copy.about]].map(([route, label]) => <Pressable key={route} onPress={() => router.push(route === "scan" || route === "history" || route === "profile" ? `/(tabs)/${route}` : "/about")} className="border-b border-white/15 py-5"><Text className="text-lg text-white">{label}</Text></Pressable>)}</View></SafeAreaView>;
}
