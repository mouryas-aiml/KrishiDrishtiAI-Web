import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, Image, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import { getCopy } from "../../src/localization";
import { useAppStore } from "../../src/store";
import { classifyImage } from "../../src/inference";
import { saveScan } from "../../src/database";

export default function ScanScreen() {
  const router = useRouter();
  const copy = getCopy(useAppStore((state) => state.language));
  const addScan = useAppStore((state) => state.addScan);
  const [imageUri, setImageUri] = useState<string>();
  const [busy, setBusy] = useState(false);
  async function pick(source: "camera" | "gallery") {
    const result = source === "camera" ? await ImagePicker.launchCameraAsync({ quality: 1 }) : await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 1 });
    if (result.canceled || !result.assets[0]) return;
    setImageUri(result.assets[0].uri);
    setBusy(true);
    try {
      const predictions = await classifyImage(result.assets[0].uri);
      const scan = { id: Date.now(), imageUri: result.assets[0].uri, createdAt: new Date().toISOString(), predictions };
      addScan(scan);
      await saveScan(scan);
      router.push({ pathname: "/result", params: { scanId: String(scan.id) } });
    } catch (error) {
      Alert.alert("Scan unavailable", error instanceof Error ? error.message : "The image could not be scanned.");
    } finally { setBusy(false); }
  }
  return <SafeAreaView className="flex-1 bg-cream"><View className="flex-1 justify-center p-6">
    <Text className="text-3xl font-bold text-forest">{copy.chooseImage}</Text><Text className="mt-2 text-slate-500">Your image stays on this device during inference.</Text>
    {imageUri ? <Image source={{ uri: imageUri }} className="my-8 h-64 rounded-3xl" resizeMode="cover" /> : <View className="my-8 h-64 items-center justify-center rounded-3xl border-2 border-dashed border-leaf bg-white"><Text className="text-6xl">🍃</Text></View>}
    <Pressable disabled={busy} onPress={() => void pick("camera")} className="mb-3 rounded-2xl bg-forest p-5"><Text className="text-center font-bold text-white">{busy ? "Analysing..." : copy.camera}</Text></Pressable>
    <Pressable disabled={busy} onPress={() => void pick("gallery")} className="rounded-2xl border border-forest bg-white p-5"><Text className="text-center font-bold text-forest">{copy.gallery}</Text></Pressable>
  </View></SafeAreaView>;
}
