import { CLASSES } from "./classes.js";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export function generateAdvisorResponse(query: string, language: string = "English"): string {
  const clean = query.toLowerCase().trim();

  // Find if any specific crop or disease is mentioned in query
  const matchedDisease = CLASSES.find(c =>
    !c.isHealthy && (
      clean.includes(c.disease.toLowerCase()) ||
      clean.includes(`${c.crop.toLowerCase()} ${c.disease.toLowerCase()}`)
    )
  );

  const matchedCrop = Array.from(new Set(CLASSES.map(c => c.crop))).find(crop =>
    clean.includes(crop.toLowerCase())
  );

  if (language.toLowerCase().includes("kannada") || language.toLowerCase().includes("kan")) {
    if (matchedDisease) {
      return `🌱 **${matchedDisease.crop} - ${matchedDisease.disease} ನಿರ್ವಹಣಾ ಮಾರ್ಗದರ್ಶಿ:**\n\n` +
        `• **ಲಕ್ಷಣಗಳು:** ${matchedDisease.symptoms}\n` +
        `• **ಸಾವಯವ ಪರಿಹಾರ:** ${matchedDisease.organicTreatment}\n` +
        `• **ರಾಸಾಯನಿಕ ನಿಯಂತ್ರಣ:** ${matchedDisease.chemicalTreatment}\n` +
        `• **ಮುಂಜಾಗ್ರತಾ ಕ್ರಮಗಳು:** ${matchedDisease.prevention}\n\n` +
        `ನೀರಿನ ಹರಿವನ್ನು ಸರಿಯಾಗಿ ನಿರ್ವಹಿಸಿ ಮತ್ತು ತೇವಾಂಶ ಹೆಚ್ಚಿರುವಾಗ ಎಲೆಗಳ ಮೇಲೆ ನೀರು ಬೀಳದಂತೆ ನೋಡಿಕೊಳ್ಳಿ.`;
    }
    if (matchedCrop) {
      return `🌾 **${matchedCrop} ಬೆಳೆ ರಕ್ಷಣೆ ಸಲಹೆಗಳು:**\n\n` +
        `1. ನಿಯಮಿತವಾಗಿ ಎಲೆಗಳ ಕೆಳಭಾಗವನ್ನು ಪರಿಶೀಲಿಸಿ ಕೀಟ ಮತ್ತು ಶಿಲೀಂಧ್ರ ಬಾಧೆಗಳನ್ನು ಮೊದಲೇ ಪತ್ತೆಹಚ್ಚಿ.\n` +
        `2. ಬೇವಿನ ಎಣ್ಣೆ (5 ಮಿಲಿ / ಲೀಟರ್ ನೀರಿಗೆ) ಸಿಂಪಡಿಸುವುದರಿಂದ ಕೀಟಗಳನ್ನು ನಿಯಂತ್ರಿಸಬಹುದು.\n` +
        `3. ಹನಿ ನೀರಾವರಿ ಪದ್ಧತಿಯನ್ನು ಬಳಸಿ ಮತ್ತು ಸಾರಜನಕ ಗೊಬ್ಬರವನ್ನು ಅತಿಯಾಗಿ ಬಳಸಬೇಡಿ.\n` +
        `ಹೆಚ್ಚಿನ ಮಾಹಿತಿಗಾಗಿ ನಿರ್ದಿಷ್ಟ ರೋಗದ ಬಗ್ಗೆ ಕೇಳಿ (ಉದಾ: ಟೊಮೇಟೊ ಮುದುರು ರೋಗ, ಆಲೂಗಡ್ಡೆ ಲೇಟ್ ಬ್ಲೈಟ್).`;
    }
    return `ನಮಸ್ಕಾರ! ನಾನು ಕೃಷಿ ದೃಷ್ಟಿ ಕೃಷಿ ಸಲಹೆಗಾರ. ನಿಮ್ಮ ಬೆಳೆಗಳ ರೋಗಗಳು, ಸಾವಯವ ಪರಿಹಾರಗಳು, ರಸಗೊಬ್ಬರ ನಿರ್ವಹಣೆ ಅಥವಾ ಕೀಟ ನಿಯಂತ್ರಣದ ಬಗ್ಗೆ ನೀವು ಪ್ರಶ್ನೆಗಳನ್ನು ಕೇಳಬಹುದು. ಯಾವ ಬೆಳೆಯ ಬಗ್ಗೆ ಮಾಹಿತಿ ಬೇಕು?`;
  }

  if (language.toLowerCase().includes("hindi") || language.toLowerCase().includes("hin")) {
    if (matchedDisease) {
      return `🌱 **${matchedDisease.crop} - ${matchedDisease.disease} उपचार गाइड:**\n\n` +
        `• **लक्षण:** ${matchedDisease.symptoms}\n` +
        `• **जैविक उपचार:** ${matchedDisease.organicTreatment}\n` +
        `• **रासायनिक नियंत्रण:** ${matchedDisease.chemicalTreatment}\n` +
        `• **रोकथाम:** ${matchedDisease.prevention}\n\n` +
        `फसल में उचित जल निकासी बनाए रखें और ड्रिप सिंचाई का प्रयोग करें।`;
    }
    if (matchedCrop) {
      return `🌾 **${matchedCrop} फसल सुरक्षा सुझाव:**\n\n` +
        `1. पत्तियों के निचले हिस्से की नियमित जांच करें।\n` +
        `2. नीम का तेल (5ml प्रति लीटर पानी) प्राथमिक कीट नियंत्रण के लिए बहुत प्रभावी है।\n` +
        `3. संतुलित NPK उर्वरक का प्रयोग करें और अत्यधिक नाइट्रोजन से बचें।\n` +
        `किसी विशेष रोग की जानकारी के लिए उसका नाम लिखकर पूछें।`;
    }
    return `नमस्ते! मैं कृषि दृष्टि डिजिटल कृषि सलाहकार हूँ। आप फसलों की बीमारियों, जैविक उपचारों, उर्वरक या मौसम संबंधी सुरक्षा के बारे में सवाल पूछ सकते हैं।`;
  }

  // English response
  if (matchedDisease) {
    return `### 🌱 Diagnostic & Treatment Protocol: ${matchedDisease.crop} — ${matchedDisease.disease}\n\n` +
      `**1. Observed Symptoms:**\n${matchedDisease.symptoms}\n\n` +
      `**2. Organic & Cultural Remedies:**\n${matchedDisease.organicTreatment}\n\n` +
      `**3. Chemical Control (If threshold exceeded):**\n${matchedDisease.chemicalTreatment}\n\n` +
      `**4. Long-term Prevention:**\n${matchedDisease.prevention}\n\n` +
      `*Field Tip:* Apply foliar treatments early in the morning or late evening to prevent phototoxicity and maximize absorption.`;
  }

  if (matchedCrop) {
    const diseasesForCrop = CLASSES.filter(c => c.crop.toLowerCase() === matchedCrop.toLowerCase() && !c.isHealthy);
    return `### 🌾 Agronomic Advisory for ${matchedCrop}\n\n` +
      `**Common Pathogens to Watch For:**\n` +
      diseasesForCrop.map(d => `• **${d.disease}**: ${d.severity.toUpperCase()} severity. ${d.organicTreatment}`).join("\n") +
      `\n\n**Standard Field Practice:**\n` +
      `- Avoid overhead watering; wet leaves favor fungal spore germination.\n` +
      `- Mulch with organic matter to prevent soil-borne pathogens from splashing onto lower leaves.\n` +
      `- Maintain balanced potassium and calcium nutrition for thick cell walls resistant to penetration.`;
  }

  if (clean.includes("blight") || clean.includes("early blight") || clean.includes("late blight")) {
    return `### 🦠 Managing Plant Blight (Early & Late Blight)\n\n` +
      `- **Early Blight:** Characterized by concentric target rings on older foliage. Treat with copper fungicides, neem oil, or chlorothalonil. Prune lower foliage within 12 inches of ground.\n` +
      `- **Late Blight:** Water-soaked black lesions with white sporulation underneath during cold/humid spells. Treat promptly with copper hydroxide, cymoxanil, or metalaxyl.\n` +
      `- **Immediate Action:** Remove infected leaves, destroy debris away from the field, and mulch beds immediately.`;
  }

  if (clean.includes("organic") || clean.includes("neem") || clean.includes("natural")) {
    return `### 🌿 Organic Plant Health Toolkit\n\n` +
      `1. **Cold-Pressed Neem Oil (3-5 ml/L):** Broad-spectrum action against aphids, mites, whiteflies, and powdery mildew.\n` +
      `2. **Liquid Copper Hydroxide:** Organic-approved protectant against bacterial spot, scab, and downy/late blights.\n` +
      `3. **Bacillus subtilis & Trichoderma:** Beneficial soil and foliar microbes that outcompete pathogenic fungi.\n` +
      `4. **Potassium Bicarbonate (4g/L):** Rapid eradication of powdery mildew by altering surface pH.`;
  }

  if (clean.includes("fertilizer") || clean.includes("npk") || clean.includes("nutrient")) {
    return `### 🧪 Balanced Nutrient Management\n\n` +
      `- **Nitrogen (N):** Vital for vegetative growth. Avoid excess nitrogen during flowering or fruit set as it attracts sucking pests and causes soft, disease-prone tissue.\n` +
      `- **Phosphorus (P):** Root development and early vigor. Apply at root zone during transplanting.\n` +
      `- **Potassium (K):** Disease resistance, stem strength, and fruit quality. Crucial during bulking/flowering.\n` +
      `- **Calcium & Boron:** Prevents blossom end rot and fruit splitting.`;
  }

  return `### 👋 Welcome to Krishi Drishti Field Assistant\n\n` +
    `I can assist you with:\n` +
    `• **Disease Diagnosis & Treatment:** Ask about any crop disease (e.g., *Tomato Early blight*, *Apple Scab*, *Potato Late blight*).\n` +
    `• **Organic Pest & Fungus Control:** Inquire about bio-pesticides, neem sprays, and copper solutions.\n` +
    `• **Crop Maintenance:** Learn preventative care for tomato, potato, apple, corn, grape, peppers, and more.\n\n` +
    `*What crop or symptom would you like help with today?*`;
}

