import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { getCopy } from "../src/localization";
import { useAppStore } from "../src/store";

export default function AboutScreen() {
  const copy = getCopy(useAppStore((state) => state.language));
  return <SafeAreaView className="flex-1 bg-cream"><View className="p-6"><Text className="text-3xl font-bold text-forest">{copy.about}</Text><Text className="mt-6 text-lg font-bold text-forest">{copy.appName}</Text><Text className="mt-3 leading-7 text-slate-600">An offline-first crop disease assistant built for farmers. Disease inference runs on-device using the preserved Krishi Drishti TensorFlow Lite model.</Text></View></SafeAreaView>;
}
