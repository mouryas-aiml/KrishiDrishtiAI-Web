import { Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { getCopy } from "../../src/localization";
import { useAppStore } from "../../src/store";

export default function ProfileScreen() {
  const language = useAppStore((state) => state.language);
  const setLanguage = useAppStore((state) => state.setLanguage);
  const copy = getCopy(language);
  return <SafeAreaView className="flex-1 bg-cream"><View className="p-5"><Text className="text-3xl font-bold text-forest">{copy.profile}</Text><View className="mt-8 items-center rounded-3xl bg-forest p-8"><Text className="text-6xl">👩🏽‍🌾</Text><Text className="mt-4 text-2xl font-bold text-white">Farmer</Text><Text className="mt-1 text-white/70">Your farm profile</Text></View><Text className="mt-8 font-bold text-forest">{copy.language}</Text><View className="mt-3 flex-row gap-3"><Pressable onPress={() => setLanguage("en")} className={`rounded-xl p-4 ${language === "en" ? "bg-forest" : "bg-white"}`}><Text className={language === "en" ? "text-white" : "text-forest"}>English</Text></Pressable><Pressable onPress={() => setLanguage("kn")} className={`rounded-xl p-4 ${language === "kn" ? "bg-forest" : "bg-white"}`}><Text className={language === "kn" ? "text-white" : "text-forest"}>ಕನ್ನಡ</Text></Pressable></View></View></SafeAreaView>;
}
