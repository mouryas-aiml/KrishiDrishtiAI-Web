import { useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { getCopy } from "../../src/localization";
import { useAppStore } from "../../src/store";

export default function AssistantScreen() {
  const copy = getCopy(useAppStore((state) => state.language));
  const [question, setQuestion] = useState("");
  return <SafeAreaView className="flex-1 bg-cream"><View className="flex-1 p-5"><Text className="text-3xl font-bold text-forest">{copy.assistant}</Text><Text className="mt-2 text-slate-500">Practical crop guidance for your farm.</Text><View className="mt-8 rounded-3xl bg-white p-5"><Text className="font-semibold text-forest">Try asking</Text><Text className="mt-3 leading-6 text-slate-600">“How do I manage early blight in tomato?”</Text></View><View className="mt-auto flex-row items-center rounded-2xl bg-white p-2"><TextInput value={question} onChangeText={setQuestion} placeholder={copy.ask} className="flex-1 px-3 text-slate-700" /><Pressable onPress={() => setQuestion("")} className="rounded-xl bg-forest px-4 py-3"><Text className="font-bold text-white">{copy.send}</Text></Pressable></View></View></SafeAreaView>;
}
