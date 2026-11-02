import { Language } from "./types";

export const copy = {
  en: {
    appName: "Krishi Drishti",
    greeting: "Good morning, farmer",
    subtitle: "Your crops, watched with intelligence.",
    scan: "Scan a leaf",
    assistant: "AI Assistant",
    history: "Scan history",
    crops: "Crop library",
    risk: "Weather & early risk",
    riskText: "Warm, humid conditions may increase fungal risk. Check your leaves today.",
    home: "Home",
    profile: "Profile",
    settings: "Settings",
    diseases: "Diseases",
    about: "About",
    chooseImage: "Choose a leaf image",
    camera: "Use camera",
    gallery: "Choose from gallery",
    diagnosis: "Diagnosis",
    noHistory: "Your completed scans will appear here.",
    confidence: "confidence",
    ask: "Ask about symptoms, fertilizers, or prevention...",
    send: "Send",
    language: "Language",
    save: "Save"
  },
  kn: {
    appName: "ಕೃಷಿ ದೃಷ್ಟಿ",
    greeting: "ಶುಭೋದಯ ರೈತರೆ",
    subtitle: "ನಿಮ್ಮ ಬೆಳೆಗಳನ್ನು ಬುದ್ಧಿವಂತಿಕೆಯಿಂದ ಗಮನಿಸಿ.",
    scan: "ಎಲೆಯನ್ನು ಸ್ಕ್ಯಾನ್ ಮಾಡಿ",
    assistant: "AI ಸಹಾಯಕ",
    history: "ಸ್ಕ್ಯಾನ್ ಇತಿಹಾಸ",
    crops: "ಬೆಳೆ ಗ್ರಂಥಾಲಯ",
    risk: "ಹವಾಮಾನ ಮತ್ತು ಅಪಾಯ",
    riskText: "ಬೆಚ್ಚಗಿನ, ತೇವಾಂಶದ ವಾತಾವರಣದಲ್ಲಿ ಶಿಲೀಂಧ್ರದ ಅಪಾಯ ಹೆಚ್ಚಬಹುದು.",
    home: "ಮುಖಪುಟ",
    profile: "ಪ್ರೊಫೈಲ್",
    settings: "ಸೆಟ್ಟಿಂಗ್‌ಗಳು",
    diseases: "ರೋಗಗಳು",
    about: "ಕುರಿತು",
    chooseImage: "ಎಲೆಯ ಚಿತ್ರ ಆಯ್ಕೆಮಾಡಿ",
    camera: "ಕ್ಯಾಮೆರಾ ಬಳಸಿ",
    gallery: "ಗ್ಯಾಲರಿಯಿಂದ ಆಯ್ಕೆಮಾಡಿ",
    diagnosis: "ರೋಗನಿರ್ಣಯ",
    noHistory: "ನಿಮ್ಮ ಸ್ಕ್ಯಾನ್‌ಗಳು ಇಲ್ಲಿ ಕಾಣಿಸುತ್ತವೆ.",
    confidence: "ವಿಶ್ವಾಸ",
    ask: "ಲಕ್ಷಣಗಳು ಅಥವಾ ಗೊಬ್ಬರದ ಬಗ್ಗೆ ಕೇಳಿ...",
    send: "ಕಳುಹಿಸಿ",
    language: "ಭಾಷೆ",
    save: "ಉಳಿಸಿ"
  }
} as const;

export type Copy = { [Key in keyof typeof copy.en]: string };

export function getCopy(language: Language): Copy {
  return copy[language];
}

export const diseaseNames = [
  "Apple scab", "Apple black rot", "Apple cedar rust", "Apple healthy", "Background",
  "Blueberry healthy", "Blueberry powdery mildew", "Cherry healthy", "Corn gray leaf spot",
  "Corn common rust", "Corn northern leaf blight", "Corn healthy", "Grape black rot",
  "Grape measles", "Grape leaf blight", "Grape healthy", "Citrus greening", "Peach bacterial spot",
  "Peach healthy", "Pepper bacterial spot", "Pepper healthy", "Potato early blight",
  "Potato late blight", "Potato healthy", "Raspberry healthy", "Soybean healthy",
  "Squash powdery mildew", "Strawberry leaf scorch", "Strawberry healthy", "Tomato bacterial spot",
  "Tomato early blight", "Tomato late blight", "Tomato leaf mold", "Tomato septoria leaf spot",
  "Tomato spider mites", "Tomato target spot", "Tomato yellow leaf curl virus",
  "Tomato mosaic virus", "Tomato healthy"
] as const;
