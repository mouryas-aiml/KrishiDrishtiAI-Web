import { Image, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { diseaseNames, getCopy } from "../../src/localization";
import { useAppStore } from "../../src/store";

export default function HistoryScreen() {
  const copy = getCopy(useAppStore((state) => state.language));
  const scans = useAppStore((state) => state.scans);
  return <SafeAreaView className="flex-1 bg-cream"><ScrollView contentContainerStyle={{ padding: 20 }}><Text className="text-3xl font-bold text-forest">{copy.history}</Text>{scans.length === 0 ? <Text className="mt-8 text-slate-500">{copy.noHistory}</Text> : scans.map((scan) => <View key={scan.id} className="mt-4 flex-row rounded-2xl bg-white p-3"><Image source={{ uri: scan.imageUri }} className="h-20 w-20 rounded-xl" /><View className="ml-3 justify-center"><Text className="font-bold text-forest">{diseaseNames[scan.predictions[0]?.index] ?? "Unknown"}</Text><Text className="mt-1 text-slate-500">{Math.round((scan.predictions[0]?.probability ?? 0) * 100)}% {copy.confidence}</Text><Text className="mt-1 text-xs text-slate-400">{new Date(scan.createdAt).toLocaleDateString()}</Text></View></View>)}</ScrollView></SafeAreaView>;
}
