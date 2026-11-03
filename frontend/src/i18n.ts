// Comprehensive South Indian & Pan-Indian Agricultural i18n Dictionary
// Languages: English, Kannada (ಕನ್ನಡ), Telugu (తెలుగు), Tamil (தமிழ்), Malayalam (മലയാളം), Hindi (हिन्दी)

export type LanguageCode = "English" | "Kannada" | "Telugu" | "Tamil" | "Malayalam" | "Hindi";

export const SUPPORTED_LANGUAGES: { code: LanguageCode; label: string; nativeName: string; locale: string }[] = [
  { code: "English", label: "English", nativeName: "English", locale: "en-IN" },
  { code: "Kannada", label: "Kannada", nativeName: "ಕನ್ನಡ", locale: "kn-IN" },
  { code: "Telugu", label: "Telugu", nativeName: "తెలుగు", locale: "te-IN" },
  { code: "Tamil", label: "Tamil", nativeName: "தமிழ்", locale: "ta-IN" },
  { code: "Malayalam", label: "Malayalam", nativeName: "മലയാളം", locale: "ml-IN" },
  { code: "Hindi", label: "Hindi", nativeName: "हिन्दी", locale: "hi-IN" },
];

export function getLanguageLocale(lang: string): string {
  const clean = lang.toLowerCase();
  if (clean.includes("kan")) return "kn-IN";
  if (clean.includes("tel") || clean.includes("తెలు")) return "te-IN";
  if (clean.includes("tam") || clean.includes("தமி")) return "ta-IN";
  if (clean.includes("mal") || clean.includes("മല")) return "ml-IN";
  if (clean.includes("hin")) return "hi-IN";
  return "en-IN";
}

export const translations: Record<string, Record<LanguageCode, string>> = {
  // Navigation Links
  navOverview: {
    English: "Overview",
    Kannada: "ಮುಖಪುಟ",
    Telugu: "ముఖ్యాంశాలు",
    Tamil: "மேலோட்டம்",
    Malayalam: "അവലോകനം",
    Hindi: "अवलोकन"
  },
  navScan: {
    English: "AI Scan",
    Kannada: "ಎಐ ಸ್ಕ್ಯಾನ್",
    Telugu: "ఏఐ స్కాన్",
    Tamil: "ஏஐ ஸ்கேன்",
    Malayalam: "എഐ സ്കാൻ",
    Hindi: "एआई स्कैन"
  },
  navCrops: {
    English: "Crop Library",
    Kannada: "ಬೆಳೆ ಗ್ರಂಥಾಲಯ",
    Telugu: "పంటల లైబ్రరీ",
    Tamil: "பயிர் நூலகம்",
    Malayalam: "വിള പുസ്തകശാല",
    Hindi: "फसल पुस्तकालय"
  },
  navAnalytics: {
    English: "Analytics",
    Kannada: "ವಿಶ್ಲೇಷಣೆ",
    Telugu: "విశ్లేషణలు",
    Tamil: "பகுப்பாய்வு",
    Malayalam: "വിശകലനം",
    Hindi: "विश्लेषण"
  },
  navAssistant: {
    English: "Assistant",
    Kannada: "ಕೃಷಿ ಸಹಾಯಕ",
    Telugu: "వ్యవసాయ సహాయకుడు",
    Tamil: "உதவியாளர்",
    Malayalam: "സഹായി",
    Hindi: "कृषि सहायक"
  },
  navWeather: {
    English: "Weather",
    Kannada: "ಹವಾಮಾನ",
    Telugu: "వాతావరణం",
    Tamil: "வானிலை",
    Malayalam: "കാലാവസ്ഥ",
    Hindi: "मौसम"
  },
  navSettings: {
    English: "Settings",
    Kannada: "ಸೆಟ್ಟಿಂಗ್ಸ್",
    Telugu: "అమరికలు",
    Tamil: "அமைப்புகள்",
    Malayalam: "ക്രമീകരണങ്ങൾ",
    Hindi: "सेटिंग्स"
  },
  navExplorer: {
    English: "3D Farm Explorer",
    Kannada: "3D ಕೃಷಿ ದೃಶ್ಯ",
    Telugu: "3D వ్యవసాయం",
    Tamil: "3D பண்ணை பார்வை",
    Malayalam: "3D ഫാം വ്യൂവർ",
    Hindi: "3D फार्म दृश्य"
  },
  workspace: {
    English: "Workspace",
    Kannada: "ಕಾರ್ಯಕ್ಷೇತ್ರ",
    Telugu: "పని ప్రదేశం",
    Tamil: "பணிமனை",
    Malayalam: "വർക്ക്‌സ്‌പേസ്",
    Hindi: "कार्यक्षेत्र"
  },

  // Greetings & Auth
  greeting: {
    English: "Namaskara",
    Kannada: "ನಮಸ್ಕಾರ",
    Telugu: "నమస్కారం",
    Tamil: "வணக்கம்",
    Malayalam: "നമസ്കാരം",
    Hindi: "नमस्ते"
  },
  farmerFriend: {
    English: "Farmer Friend",
    Kannada: "ರೈತ ಮಿತ್ರ",
    Telugu: "రైతు మిత్రుడు",
    Tamil: "விவசாய தோழர்",
    Malayalam: "കർഷക സുഹൃത്ത്",
    Hindi: "किसान मित्र"
  },
  loginRegister: {
    English: "Login / Register",
    Kannada: "ಲಾಗಿನ್ / ನೋಂದಣಿ",
    Telugu: "లాగిన్ / నమోదు",
    Tamil: "உள்நுழைவு / பதிவு",
    Malayalam: "ലോഗിൻ / രജിസ്റ്റർ",
    Hindi: "लॉगिन / रजिस्टर"
  },
  logout: {
    English: "Log Out",
    Kannada: "ಲಾಗ್ ಔಟ್",
    Telugu: "లాగ్ అవుట్",
    Tamil: "வெளியேறு",
    Malayalam: "ലോഗ് ഔട്ട്",
    Hindi: "लॉग आउट"
  },

  // Dashboard / Overview
  heroTitle: {
    English: "Make every scan a better decision.",
    Kannada: "ಪ್ರತಿ ಎಲೆ ಸ್ಕ್ಯಾನ್‌ನಿಂದ ಉತ್ತಮ ಬೆಳೆ ನಿರ್ಧಾರ ಕೈಗೊಳ್ಳಿ.",
    Telugu: "ప్రతి స్కాన్‌తో సరైన పంట నిర్ణయం తీసుకోండి.",
    Tamil: "ஒவ்வொரு ஸ்கேனையும் சிறந்த முடிவாக மாற்றுங்கள்.",
    Malayalam: "ഓരോ സ്കാനിലൂടെയും മികച്ച കൃഷി തീരുമാനം എടുക്കുക.",
    Hindi: "हर पत्ते की स्कैनिंग से लें बेहतर फसल सुरक्षा निर्णय।"
  },
  heroSubtitle: {
    English: "Screen leaf health in real-time with the Krishi Drishti deep learning model. Get instant organic treatment protocols, chemical dosages, and voice assistance.",
    Kannada: "ಕೃಷಿ ದೃಷ್ಟಿ ಎಐ ಮಾದರಿಯೊಂದಿಗೆ ನೈಜ ಸಮಯದಲ್ಲಿ ಎಲೆಗಳ ಆರೋಗ್ಯ ತಪಾಸಣೆ ಮಾಡಿ. ತ್ವರಿತ ಸಾವಯವ ಚಿಕಿತ್ಸೆ, ರಾಸಾಯನಿಕ ಪ್ರಮಾಣ ಮತ್ತು ಧ್ವನಿ ಮಾರ್ಗದರ್ಶನ ಪಡೆಯಿರಿ.",
    Telugu: "కృషి దృష్టి డీప్ లెర్నింగ్ మోడల్ ద్వారా పంట ఆకుల ఆరోగ్యాన్ని తనిఖీ చేయండి. తక్షణ సేంద్రీయ నివారణలు మరియు వాయిస్ సహాయం పొందండి.",
    Tamil: "கிருஷி திருஷ்டி ஆழமான கற்றல் மூலம் பயிர் இலைகளின் ஆரோக்கியத்தை நிகழ்நேரத்தில் சோதிக்கவும். உடனடி இயற்கை சிகிச்சை மற்றும் குரல் வழிகாட்டல் பெறவும்.",
    Malayalam: "കൃഷി ദൃഷ്ടി ഡീപ് ലേണിംഗ് വഴി തത്സമയം ഇലകളുടെ ആരോഗ്യം പരിശോധിക്കുക. ഉടനടി ജൈവ ചികിത്സകളും വോയ്‌സ് സഹായവും നേടുക.",
    Hindi: "कृषि दृष्टि डीप लर्निंग मॉडल से पत्तियों के स्वास्थ्य की वास्तविक समय में जाँच करें। तत्काल जैविक उपचार और वॉयस सहायता पाएँ।"
  },
  startScanBtn: {
    English: "Start a leaf scan",
    Kannada: "ಎಲೆ ಸ್ಕ್ಯಾನ್ ಪ್ರಾರಂಭಿಸಿ",
    Telugu: "ఆకు స్కాన్ ప్రారంభించండి",
    Tamil: "இலை ஸ்கேன் தொடங்கு",
    Malayalam: "ഇല സ്കാൻ ചെയ്യുക",
    Hindi: "पत्ता स्कैन शुरू करें"
  },
  askDoctorBtn: {
    English: "Ask AI Doctor",
    Kannada: "ಎಐ ಕೃಷಿ ವೈದ್ಯರನ್ನು ಕೇಳಿ",
    Telugu: "ఏఐ డాక్టర్‌ను అడగండి",
    Tamil: "ஏஐ மருத்துவரிடம் கேளுங்கள்",
    Malayalam: "എഐ ഡോക്ടറോട് ചോദിക്കുക",
    Hindi: "एआई डॉक्टर से पूछें"
  },
  totalScansRecorded: {
    English: "Total Scans Recorded",
    Kannada: "ಒಟ್ಟು ದಾಖಲಾದ ಸ್ಕ್ಯಾನ್‌ಗಳು",
    Telugu: "మొత్తం స్కాన్‌లు",
    Tamil: "மொத்த ஸ்கேன்கள்",
    Malayalam: "ആകെ സ്കാനുകൾ",
    Hindi: "कुल दर्ज स्कैन"
  },
  healthyTissueRatio: {
    English: "Healthy Tissue Ratio",
    Kannada: "ಆರೋಗ್ಯಕರ ಬೆಳೆ ಪ್ರಮಾಣ",
    Telugu: "ఆరోగ్యకరమైన పంట శాతం",
    Tamil: "ஆரோக்கியமான இலை விகிதம்",
    Malayalam: "ആരോഗ്യമുള്ള വിള നിരക്ക്",
    Hindi: "स्वस्थ फसल अनुपात"
  },
  modelEngine: {
    English: "Model Engine",
    Kannada: "ಮಾದರಿ ಎಂಜಿನ್",
    Telugu: "మోడల్ ఇంజిన్",
    Tamil: "மாதிரி எஞ்சின்",
    Malayalam: "മോഡൽ എഞ്ചിൻ",
    Hindi: "मॉडल इंजन"
  },
  languageAndVoice: {
    English: "Language & Voice",
    Kannada: "ಭಾಷೆ ಮತ್ತು ಧ್ವನಿ",
    Telugu: "భాష & వాయిస్",
    Tamil: "மொழி & குரல்",
    Malayalam: "ഭാഷയും ശബ്ദവും",
    Hindi: "भाषा और आवाज"
  },
  recentDiagnoses: {
    English: "Recent Field Diagnoses",
    Kannada: "ಇತ್ತೀಚಿನ ಕೃಷಿ ರೋಗ ನಿರ್ಣಯಗಳು",
    Telugu: "ఇటీవలి పంట రోగనిర్ధారణలు",
    Tamil: "சமீபத்திய நோய் கண்டறிதல்",
    Malayalam: "സമീപകാല രോഗനിർണ്ണയങ്ങൾ",
    Hindi: "हाल के फसल रोग निदान"
  },
  viewAll: {
    English: "View all",
    Kannada: "ಎಲ್ಲವನ್ನೂ ವೀಕ್ಷಿಸಿ",
    Telugu: "అన్నీ చూడండి",
    Tamil: "அனைத்தும் காண்க",
    Malayalam: "എല്ലാം കാണുക",
    Hindi: "सभी देखें"
  },

  // Scan Page
  realtimeDiagnosis: {
    English: "Real-time Image Diagnosis",
    Kannada: "ನೈಜ-ಸಮಯದ ಚಿತ್ರ ರೋಗ ನಿರ್ಣಯ",
    Telugu: "రియల్ టైమ్ ఇమేజ్ రోగ నిర్ధారణ",
    Tamil: "நிகழ்நேர இலை நோய் கண்டறிதல்",
    Malayalam: "തത്സമയ ഇല രോഗനിർണ്ണയം",
    Hindi: "वास्तविक समय पत्ती रोग निदान"
  },
  uploadOrChooseLeaf: {
    English: "Upload or Scan a Crop Leaf",
    Kannada: "ಬೆಳೆಯ ಎಲೆಯನ್ನು ಅಪ್‌ಲೋಡ್ ಮಾಡಿ ಅಥವಾ ಸ್ಕ್ಯಾನ್ ಮಾಡಿ",
    Telugu: "పంట ఆకును అప్‌లోడ్ చేయండి లేదా స్కాన్ చేయండి",
    Tamil: "பயிர் இலையை பதிவேற்றவும் அல்லது ஸ்கேன் செய்யவும்",
    Malayalam: "വിള ഇല അപ്‌ലോഡ് ചെയ്യുക അല്ലെങ്കിൽ സ്കാൻ ചെയ്യുക",
    Hindi: "फसल के पत्ते को अपलोड या स्कैन करें"
  },
  scanDesc: {
    English: "The leaf is analyzed using our 39-class crop pathology vision model with zero latency.",
    Kannada: "ನಮ್ಮ 39-ತರಗತಿಯ ಬೆಳೆ ರೋಗ ಮಾದರಿಯ ಮೂಲಕ ಎಲೆಯನ್ನು ತಕ್ಷಣ ವಿಶ್ಲೇಷಿಸಲಾಗುತ್ತದೆ.",
    Telugu: "మా 39 రకాల పంట వ్యాధి మోడల్ ద్వారా ఆకును వెంటనే విశ్లేషిస్తాము.",
    Tamil: "எங்கள் 39 வகை பயிர் நோய் மாதிரி மூலம் இலை உடனடியாக பகுப்பாய்வு செய்யப்படுகிறது.",
    Malayalam: "ഞങ്ങളുടെ 39 ഇനം വിള രോഗ മോഡൽ വഴി ഇല പെട്ടെന്ന് പരിശോധിക്കുന്നു.",
    Hindi: "हमारे 39-वर्ग फसल रोग मॉडल द्वारा पत्ते का तुरंत विश्लेषण किया जाता है।"
  },
  openCameraBtn: {
    English: "Open Live Camera",
    Kannada: "ಲೈವ್ ಕ್ಯಾಮೆರಾ ತೆರೆಯಿರಿ",
    Telugu: "లైవ్ కెమెరా తెరవండి",
    Tamil: "நேரடி கேமராவைத் திறக்கவும்",
    Malayalam: "ലൈവ് ക്യാമറ തുറക്കുക",
    Hindi: "लाइव कैमरा खोलें"
  },
  captureAnalyzeBtn: {
    English: "Capture & Analyze Leaf",
    Kannada: "ಫೋಟೋ ತೆಗೆದು ಪರೀಕ್ಷಿಸಿ",
    Telugu: "ఫోటో తీసి విశ్లేషించండి",
    Tamil: "படம் எடுத்து பகுப்பாய்வு செய்",
    Malayalam: "ഫോട്ടോ എടുത്ത് പരിശോധിക്കുക",
    Hindi: "फोटो खींचकर जाँचें"
  },
  closeCameraBtn: {
    English: "Close Camera",
    Kannada: "ಕ್ಯಾಮೆರಾ ಮುಚ್ಚಿ",
    Telugu: "కెమెరా మూసివేయండి",
    Tamil: "கேமராவை மூடு",
    Malayalam: "ക്യാമറ അടയ്ക്കുക",
    Hindi: "कैमरा बंद करें"
  },
  liveCameraScanner: {
    English: "Live Leaf Camera Scanner",
    Kannada: "ಲೈವ್ ಎಲೆ ಕ್ಯಾಮೆರಾ ಸ್ಕ್ಯಾನರ್",
    Telugu: "లైవ్ ఆకు కెమెరా స్కానర్",
    Tamil: "நேரடி இலை கேமரா ஸ்கேனர்",
    Malayalam: "തത്സമയ ഇല ക്യാമറ സ്കാനർ",
    Hindi: "लाइव पत्ता कैमरा स्कैनर"
  },
  centerLeafTarget: {
    English: "Center the crop leaf inside the target frame",
    Kannada: "ಎಲೆಯನ್ನು ಚೌಕಟ್ಟಿನ ಮಧ್ಯದಲ್ಲಿ ಇರಿಸಿ",
    Telugu: "పంట ఆకును ఫ్రేమ్ మధ్యలో ఉంచండి",
    Tamil: "இலையை சட்டத்தின் நடுவில் வைக்கவும்",
    Malayalam: "ഇല ഫ്രെയിമിന്റെ മധ്യത്തിൽ വെക്കുക",
    Hindi: "पत्ते को फ्रेम के बीच में रखें"
  },
  switchCameraBtn: {
    English: "Switch Camera",
    Kannada: "ಕ್ಯಾಮೆರಾ ಬದಲಾಯಿಸಿ",
    Telugu: "కెమెరా మార్చండి",
    Tamil: "கேமராவை மாற்று",
    Malayalam: "ക്യാമറ മാറ്റുക",
    Hindi: "कैमरा बदलें"
  },
  fieldNotesLabel: {
    English: "Field Notes / Observation:",
    Kannada: "ಕ್ಷೇತ್ರದ ಟಿಪ್ಪಣಿ / ವೀಕ್ಷಣೆ:",
    Telugu: "క్షేత్ర పరిశీలన గమనికలు:",
    Tamil: "வயல் குறிப்புகள் / அவதானிப்பு:",
    Malayalam: "ഫീൽഡ് നിരീക്ഷണ കുറിപ്പുകൾ:",
    Hindi: "खेत की टिप्पणी / अवलोकन:"
  },
  fieldNotesPlaceholder: {
    English: "e.g. Field Block 2, row 5, 20% leaf coverage affected",
    Kannada: "ಉದಾ: ಬ್ಲಾಕ್ 2, ಸಾಲು 5, ಶೇ 20 ರಷ್ಟು ಎಲೆಗಳಲ್ಲಿ ಬಾಧೆ",
    Telugu: "ఉదా: బ్లాక్ 2, వరుస 5, 20% ఆకులలో వ్యాప్తి",
    Tamil: "எ.கா: பகுதி 2, வரிசை 5, 20% இலைகளில் பாதிப்பு",
    Malayalam: "ഉദാ: ബ്ലോക്ക് 2, വരി 5, 20% ഇലകളിൽ ബാധിച്ചു",
    Hindi: "उदा. ब्लॉक 2, पंक्ति 5, 20% पत्तियों पर प्रभाव"
  },
  dragOrChooseLeaf: {
    English: "Choose or drag a leaf photograph",
    Kannada: "ಎಲೆಯ ಫೋಟೋವನ್ನು ಆಯ್ಕೆಮಾಡಿ ಅಥವಾ ಇಲ್ಲಿಗೆ ಎಳೆಯಿರಿ",
    Telugu: "ఆకు ఫోటోను ఎంచుకోండి లేదా డ్రాగ్ చేయండి",
    Tamil: "இலை புகைப்படத்தைத் தேர்ந்தெடுக்கவும் அல்லது இழுக்கவும்",
    Malayalam: "ഇലയുടെ ഫോട്ടോ തിരഞ്ഞെടുക്കുക",
    Hindi: "पत्ते का फोटो चुनें या यहाँ खींचें"
  },
  supportedFormats: {
    English: "Supports ALL formats: JPG, PNG, WEBP, AVIF, HEIC, BMP, TIFF, GIF",
    Kannada: "ಎಲ್ಲಾ ಫಾರ್ಮ್ಯಾಟ್‌ಗಳನ್ನು ಬೆಂಬಲಿಸುತ್ತದೆ: JPG, PNG, WEBP, AVIF, HEIC, BMP",
    Telugu: "అన్ని ఫార్మాట్లకు మద్దతు: JPG, PNG, WEBP, AVIF, HEIC, BMP",
    Tamil: "அனைத்து வடிவங்களும் ஆதரிக்கப்படும்: JPG, PNG, WEBP, AVIF, HEIC",
    Malayalam: "എല്ലാ ഫോർമാറ്റുകളും പിന്തുണയ്ക്കുന്നു: JPG, PNG, WEBP, AVIF",
    Hindi: "सभी प्रारूप समर्थित: JPG, PNG, WEBP, AVIF, HEIC, BMP"
  },
  analyzingLeaf: {
    English: "Evaluating leaf tissue with Crop Vision AI...",
    Kannada: "ಎಐ ಮೂಲಕ ಎಲೆಯ ಅಂಗಾಂಶ ಪರಿಶೀಲಿಸಲಾಗುತ್ತಿದೆ...",
    Telugu: "ఏఐ ద్వారా పంట ఆకును విశ్లేషిస్తున్నాము...",
    Tamil: "ஏஐ மூலம் இலை பகுப்பாய்வு செய்யப்படுகிறது...",
    Malayalam: "വിള ദർശൻ വഴി ഇല പരിശോധിക്കുന്നു...",
    Hindi: "क्रॉप विज़न एआई से पत्ती की जाँच हो रही है..."
  },
  verifiedTestLeaves: {
    English: "Verified Test Leaves",
    Kannada: "ಪರಿಶೀಲಿಸಿದ ಪರೀಕ್ಷಾ ಎಲೆಗಳು",
    Telugu: "ధృవీకరించబడిన నమూనా ఆకులు",
    Tamil: "சரிபார்க்கப்பட்ட மாதிரி இலைகள்",
    Malayalam: "പരിശോധിച്ച സാമ്പിൾ ഇലകൾ",
    Hindi: "सत्यापित नमूना पत्तियाँ"
  },
  verifiedLeavesHint: {
    English: "Click any verified field sample below to run an instant diagnosis:",
    Kannada: "ತಕ್ಷಣದ ಪರೀಕ್ಷೆಗೆ ಈ ಕೆಳಗಿನ ಯಾವುದೇ ಎಲೆಯ ಮೇಲೆ ಕ್ಲಿಕ್ ಮಾಡಿ:",
    Telugu: "తక్షణ పరీక్ష కోసం క్రింది నమూనా ఆకును క్లిక్ చేయండి:",
    Tamil: "உடனடி சோதனைக்கு கீழே உள்ள மாதிரியை கிளிக் செய்யவும்:",
    Malayalam: "ഉടനടി പരിശോധനയ്ക്കായി താഴെയുള്ള സാമ്പിളിൽ ക്ലിക്കുചെയ്യുക:",
    Hindi: "तुरंत जाँच के लिए नीचे दिए गए किसी भी नमूने पर क्लिक करें:"
  },

  // Disease Cards & Results
  listenAdvice: {
    English: "Listen Audio",
    Kannada: "ಆಡಿಯೋ ಆಲಿಸಿ",
    Telugu: "వాయిస్ వినండి",
    Tamil: "குரல் கேட்க",
    Malayalam: "ശബ്ദം കേൾക്കുക",
    Hindi: "आवाज सुनें"
  },
  stopAudio: {
    English: "Stop Audio",
    Kannada: "ಆಡಿಯೋ ನಿಲ್ಲಿಸಿ",
    Telugu: "వాయిస్ ఆపండి",
    Tamil: "குரலை நிறுத்து",
    Malayalam: "ശബ്ദം നിർത്തുക",
    Hindi: "आवाज बंद करें"
  },
  observedSymptoms: {
    English: "Observed Symptoms:",
    Kannada: "ಕಂಡುಬಂದ ರೋಗ ಲಕ್ಷಣಗಳು:",
    Telugu: "గమనించిన లక్షణాలు:",
    Tamil: "கண்டறியப்பட்ட அறிகுறிகள்:",
    Malayalam: "കണ്ടെത്തിയ ലക്ഷണങ്ങൾ:",
    Hindi: "देखे गए रोग लक्षण:"
  },
  organicRemedy: {
    English: "Organic Remedy:",
    Kannada: "ಸಾವಯವ ಪರಿಹಾರ:",
    Telugu: "సేంద్రీయ నివారణ:",
    Tamil: "இயற்கை சிகிச்சை:",
    Malayalam: "ജൈവ പ്രതിവിധി:",
    Hindi: "जैविक उपचार:"
  },
  chemicalSpray: {
    English: "Chemical Spray:",
    Kannada: "ರಾಸಾಯನಿಕ ಸಿಂಪಡಣೆ:",
    Telugu: "రసాయన పిచికారీ:",
    Tamil: "ரசாயன தெளிப்பு:",
    Malayalam: "രാസ തളിക്കൽ:",
    Hindi: "रासायनिक छिड़काव:"
  },
  preventionPractice: {
    English: "Prevention Practice:",
    Kannada: "ಮುಂಜಾಗ್ರತಾ ಕ್ರಮಗಳು:",
    Telugu: "నివారణ పద్ధతులు:",
    Tamil: "தடுப்பு முறைகள்:",
    Malayalam: "മുൻകരുതലുകൾ:",
    Hindi: "रोकथाम के उपाय:"
  },
  healthyFoliage: {
    English: "Healthy Foliage",
    Kannada: "ಆರೋಗ್ಯಕರ ಎಲೆ",
    Telugu: "ఆరోగ్యకరమైన ఆకు",
    Tamil: "ஆரோக்கியமான இலை",
    Malayalam: "ആരോഗ്യമുള്ള ഇല",
    Hindi: "स्वस्थ पत्ती"
  },

  // Crop Library
  allCrops: {
    English: "All Crops",
    Kannada: "ಎಲ್ಲಾ ಬೆಳೆಗಳು",
    Telugu: "అన్ని పంటలు",
    Tamil: "அனைத்து பயிர்கள்",
    Malayalam: "എല്ലാ വിളകളും",
    Hindi: "सभी फसलें"
  },
  fruits: {
    English: "Fruits",
    Kannada: "ಹಣ್ಣುಗಳು",
    Telugu: "పండ్లు",
    Tamil: "பழங்கள்",
    Malayalam: "പഴങ്ങൾ",
    Hindi: "फल"
  },
  vegetables: {
    English: "Vegetables & Crops",
    Kannada: "ತರಕಾರಿಗಳು ಮತ್ತು ಬೆಳೆಗಳು",
    Telugu: "కూరగాయలు & పంటలు",
    Tamil: "காய்கறிகள் & பயிர்கள்",
    Malayalam: "പച്ചക്കറികൾ",
    Hindi: "सब्जियाँ और फसलें"
  },
  searchCropPlaceholder: {
    English: "Search crop (e.g. Tomato, Apple)...",
    Kannada: "ಬೆಳೆಯನ್ನು ಹುಡುಕಿ (ಉದಾ: ಟೊಮೇಟೊ, ಸೇಬು)...",
    Telugu: "పంటను వెతకండి (ఉదా: టమోటా, ఆపిల్)...",
    Tamil: "பயிரைத் தேடுங்கள் (எ.கா: தக்காளி, ஆப்பிள்)...",
    Malayalam: "വിള തിരയുക (ഉദാ: തക്കാളി, ആപ്പിൾ)...",
    Hindi: "फसल खोजें (जैसे टमाटर, सेब)..."
  },

  // Weather Page
  weatherHeading: {
    English: "Current Field Weather Conditions",
    Kannada: "ಪ್ರಸ್ತುತ ಕ್ಷೇತ್ರದ ಹವಾಮಾನ ಪರಿಸ್ಥಿತಿ",
    Telugu: "ప్రస్తుత క్షేత్ర వాతావరణ పరిస్థితులు",
    Tamil: "தற்போதைய வயல்வெளி வானிலை நிலை",
    Malayalam: "നിലവിലെ ഫീൽഡ് കാലാവസ്ഥ",
    Hindi: "वर्तमान खेत मौसम की स्थिति"
  },
  loadLiveWeather: {
    English: "Load live weather",
    Kannada: "ನೈಜ ಹವಾಮಾನ ಪಡೆಯಿರಿ",
    Telugu: "లైవ్ వాతావరణం పొందండి",
    Tamil: "நேரடி வானிலை பெறவும்",
    Malayalam: "കാലാവസ്ഥ കാണുക",
    Hindi: "लाइव मौसम लोड करें"
  },
  useMyLocation: {
    English: "Use my location",
    Kannada: "ನನ್ನ ಜಿಪಿಎಸ್ ಸ್ಥಳ ಬಳಸಿ",
    Telugu: "నా లొకేషన్ ఉపయోగించండి",
    Tamil: "என் இருப்பிடத்தைப் பயன்படுத்து",
    Malayalam: "എന്റെ സ്ഥാനം ഉപയോഗിക്കുക",
    Hindi: "मेरा स्थान उपयोग करें"
  },
  latitude: {
    English: "Latitude",
    Kannada: "ಅಕ್ಷಾಂಶ (Latitude)",
    Telugu: "అక్షాంశం (Latitude)",
    Tamil: "அட்சரேகை (Latitude)",
    Malayalam: "അക്ഷാംശം (Latitude)",
    Hindi: "अक्षांश (Latitude)"
  },
  longitude: {
    English: "Longitude",
    Kannada: "ರೇಖಾಂಶ (Longitude)",
    Telugu: "రేఖాంశం (Longitude)",
    Tamil: "தீர்க்கரேகை (Longitude)",
    Malayalam: "രേഖാംശം (Longitude)",
    Hindi: "देशांतर (Longitude)"
  },
  temperature: {
    English: "Temperature",
    Kannada: "ತಾಪಮಾನ",
    Telugu: "ఉష్ణోగ్రత",
    Tamil: "வெப்பநிலை",
    Malayalam: "താപനില",
    Hindi: "तापमान"
  },
  humidity: {
    English: "Relative Humidity",
    Kannada: "ಸಾಪೇಕ್ಷ ಆರ್ದ್ರತೆ",
    Telugu: "తేమ శాతం",
    Tamil: "காற்றின் ஈரப்பதம்",
    Malayalam: "ഈർപ്പം",
    Hindi: "सापेक्ष आर्द्रता"
  },
  precipitation: {
    English: "Precipitation",
    Kannada: "ಮಳೆ ಪ್ರಮಾಣ",
    Telugu: "వర్షపాతం",
    Tamil: "மழைப்பொழிவு",
    Malayalam: "മഴ",
    Hindi: "वर्षा"
  },
  windSpeed: {
    English: "Wind Speed",
    Kannada: "ಗಾಳಿಯ ವೇಗ",
    Telugu: "గాలి వేగం",
    Tamil: "காற்றின் வேகம்",
    Malayalam: "കാറ്റിന്റെ വേഗത",
    Hindi: "हवा की गति"
  },
  lateBlightRisk: {
    English: "Tomato & Potato Late Blight Risk",
    Kannada: "ಟೊಮೇಟೊ ಮತ್ತು ಆಲೂಗಡ್ಡೆ ಲೇಟ್ ಬ್ಲೈಟ್ ಶಿಲೀಂಧ್ರ ಅಪಾಯ",
    Telugu: "టమోటా & బంగాళాదుంప లేట్ బ్లైట్ వ్యాధి ప్రమాదం",
    Tamil: "தக்காளி & உருளைக்கிழங்கு லேட் பிளைட் ஆபத்து",
    Malayalam: "തക്കാളി, ഉരുളക്കിഴങ്ങ് ലേറ്റ് ബ്ലൈറ്റ് സാധ്യത",
    Hindi: "टमाटर और आलू लेट ब्लाइट रोग जोखिम"
  },
  powderyMildewRisk: {
    English: "Powdery Mildew Risk",
    Kannada: "ಬೂದಿ ರೋಗ (ಪೌಡರಿ ಮಿಲ್ಡ್ಯೂ) ಅಪಾಯ",
    Telugu: "బూడిద తెగులు (పౌడరీ మిల్ద్యూ) ప్రమాదం",
    Tamil: "சாம்பல் நோய் ஆபத்து",
    Malayalam: "ചാര പൂപ്പൽ സാധ്യത",
    Hindi: "चूर्णिल आसिता (पाउडरी मिल्ड्यू) जोखिम"
  },

  // Assistant Page
  assistantTitle: {
    English: "AI Crop Advisory Chat",
    Kannada: "ಎಐ ಬೆಳೆ ರಕ್ಷಣೆ ಸಂವಾದ",
    Telugu: "ఏఐ పంట రక్షణ సంభాషణ",
    Tamil: "ஏஐ பயிர் ஆலோசனை அரட்டை",
    Malayalam: "എഐ വിള സംരക്ഷണ ചാറ്റ്",
    Hindi: "एआई फसल सुरक्षा परामर्श"
  },
  askAssistantPlaceholder: {
    English: "Ask about crop diseases, remedies, or fertilizers...",
    Kannada: "ಬೆಳೆ ರೋಗಗಳು, ಔಷಧಿ ಅಥವಾ ಗೊಬ್ಬರದ ಬಗ್ಗೆ ಕೇಳಿ...",
    Telugu: "పంట వ్యాధులు, మందులు లేదా ఎరువుల గురించి అడగండి...",
    Tamil: "பயிர் நோய்கள், மருந்துகள் அல்லது உரங்கள் பற்றி கேளுங்கள்...",
    Malayalam: "വിള രോഗങ്ങൾ, മരുന്നുകൾ എന്നിവയെക്കുറിച്ച് ചോദിക്കുക...",
    Hindi: "फसल के रोगों, जैविक उपचारों या खादों के बारे में पूछें..."
  },
  speakVoiceBtn: {
    English: "Voice Input",
    Kannada: "ಧ್ವನಿ ಮೂಲಕ ಮಾತನಾಡಿ",
    Telugu: "వాయిస్ ఇన్‌పుట్",
    Tamil: "குரல் உள்ளீடு",
    Malayalam: "ശബ്ദ ഇൻപുട്ട്",
    Hindi: "बोलकर पूछें"
  },
  listening: {
    English: "Listening...",
    Kannada: "ಆಲಿಸುತ್ತಿದೆ...",
    Telugu: "వింటోంది...",
    Tamil: "கேட்கிறது...",
    Malayalam: "ശ്രദ്ധിക്കുന്നു...",
    Hindi: "सुन रहे हैं..."
  }
};

export function t(key: string, language: string = "English"): string {
  const langKey: LanguageCode =
    language.toLowerCase().includes("kan") ? "Kannada" :
    language.toLowerCase().includes("tel") || language.includes("తెలు") ? "Telugu" :
    language.toLowerCase().includes("tam") || language.includes("தமி") ? "Tamil" :
    language.toLowerCase().includes("mal") || language.includes("മല") ? "Malayalam" :
    language.toLowerCase().includes("hin") ? "Hindi" :
    "English";

  const entry = translations[key];
  if (!entry) return key;
  return entry[langKey] || entry.English || key;
}
