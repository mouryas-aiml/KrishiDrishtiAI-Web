import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { Language, ScanRecord } from "./types";

type AppState = {
  language: Language;
  scans: ScanRecord[];
  setLanguage: (language: Language) => void;
  addScan: (scan: ScanRecord) => void;
  hydrate: () => Promise<void>;
};

const SCANS_KEY = "krishi-drishti-scans";
const LANGUAGE_KEY = "krishi-drishti-language";

export const useAppStore = create<AppState>((set, get) => ({
  language: "en",
  scans: [],
  setLanguage: (language) => {
    set({ language });
    void AsyncStorage.setItem(LANGUAGE_KEY, language);
  },
  addScan: (scan) => {
    const scans = [scan, ...get().scans];
    set({ scans });
    void AsyncStorage.setItem(SCANS_KEY, JSON.stringify(scans));
  },
  hydrate: async () => {
    const [language, scans] = await Promise.all([
      AsyncStorage.getItem(LANGUAGE_KEY),
      AsyncStorage.getItem(SCANS_KEY)
    ]);
    set({
      language: language === "kn" ? "kn" : "en",
      scans: scans ? (JSON.parse(scans) as ScanRecord[]) : []
    });
  }
}));
