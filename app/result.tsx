import { useLocalSearchParams, useRouter } from "expo-router";
import { Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { diseaseNames, getCopy } from "../src/localization";
import { useAppStore } from "../src/store";

export default function ResultScreen() {
  const router = useRouter();
  const { scanId } = useLocalSearchParams<{ scanId: string }>();
  const scan = useAppStore((state) => state.scans.find((item) => item.id === Number(scanId)));
  const copy = getCopy(useAppStore((state) => state.language));
  return <SafeAreaView className="flex-1 bg-cream"><View className="p-5"><Text className="text-3xl font-bold text-forest">{copy.diagnosis}</Text>{scan?.predictions.map((prediction) => <View key={prediction.index} className="mt-4 rounded-2xl bg-white p-5"><Text className="text-lg font-bold text-forest">{diseaseNames[prediction.index]}</Text><Text className="mt-2 text-leaf">{Math.round(prediction.probability * 100)}% {copy.confidence}</Text></View>)}<Text className="mt-8 leading-6 text-slate-600">Remove affected leaves, improve airflow, and follow the crop-specific treatment guidance in the disease library.</Text><Pressable onPress={() => router.replace("/(tabs)/scan")} className="mt-8 rounded-2xl bg-forest p-5"><Text className="text-center font-bold text-white">{copy.scan}</Text></Pressable></View></SafeAreaView>;
}
