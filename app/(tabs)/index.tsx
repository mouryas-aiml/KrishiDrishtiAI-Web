import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { getCopy } from "../../src/localization";
import { useAppStore } from "../../src/store";

export default function HomeScreen() {
  const router = useRouter();
  const copy = getCopy(useAppStore((state) => state.language));
  return (
    <SafeAreaView className="flex-1 bg-cream">
      <ScrollView contentContainerStyle={{ padding: 20, gap: 18 }}>
        <View className="flex-row items-center justify-between">
          <View><Text className="text-sm text-leaf">{copy.greeting}</Text><Text className="mt-1 text-3xl font-bold text-forest">{copy.appName}</Text><Text className="mt-1 text-slate-500">{copy.subtitle}</Text></View>
          <Pressable onPress={() => router.push("/menu")} className="rounded-full bg-forest p-3"><Ionicons name="menu" size={24} color="white" /></Pressable>
        </View>
        <Pressable onPress={() => router.push("/(tabs)/scan")} className="rounded-3xl bg-forest p-6">
          <Ionicons name="camera" size={30} color="#F4B942" /><Text className="mt-4 text-2xl font-bold text-white">{copy.scan}</Text><Text className="mt-2 text-white/75">Identify crop disease with on-device AI.</Text>
        </Pressable>
        <View className="rounded-3xl bg-white p-5"><View className="flex-row items-center gap-3"><Ionicons name="partly-sunny" size={26} color="#F4B942" /><Text className="text-lg font-bold text-forest">{copy.risk}</Text></View><Text className="mt-3 leading-6 text-slate-600">{copy.riskText}</Text></View>
        <Text className="text-xl font-bold text-forest">{copy.crops}</Text>
        <View className="flex-row flex-wrap justify-between gap-y-3">{["Tomato", "Potato", "Apple", "Corn"].map((crop) => <Pressable key={crop} onPress={() => router.push("/(tabs)/scan")} className="w-[48%] rounded-2xl bg-white p-5"><Text className="text-3xl">🌿</Text><Text className="mt-3 font-semibold text-forest">{crop}</Text><Text className="mt-1 text-xs text-slate-500">Tap to scan</Text></Pressable>)}</View>
      </ScrollView>
    </SafeAreaView>
  );
}
