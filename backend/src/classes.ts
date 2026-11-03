export interface DiseaseInfo {
  index: number;
  crop: string;
  disease: string;
  isHealthy: boolean;
  severity: "low" | "moderate" | "high";
  symptoms: string;
  organicTreatment: string;
  chemicalTreatment: string;
  prevention: string;
}

export const CLASSES: DiseaseInfo[] = [
  {
    index: 0,
    crop: "Apple",
    disease: "Apple scab",
    isHealthy: false,
    severity: "moderate",
    symptoms: "Olive-green to dark brown velvety spots on upper leaf surfaces and scabby lesions on fruit.",
    organicTreatment: "Apply liquid copper, sulfur spray, or neem oil spray at bud-break and after rain.",
    chemicalTreatment: "Fungicides containing myclobutanil, captan, or mancozeb at 7-10 day intervals.",
    prevention: "Rake and destroy fallen leaves in autumn, prune canopy for airflow, plant scab-resistant cultivars."
  },
  {
    index: 1,
    crop: "Apple",
    disease: "Black rot",
    isHealthy: false,
    severity: "high",
    symptoms: "Circular brown leaf spots (frog-eye spots), sunken dark cankers on branches, and black rotting fruit.",
    organicTreatment: "Prune diseased twigs and mummified fruit, spray sulfur-based fungicide early in the season.",
    chemicalTreatment: "Captan, thiophanate-methyl, or kresoxim-methyl applied from petal fall onwards.",
    prevention: "Prune out dead wood, sanitize tools with 70% alcohol, remove infected dropped fruit."
  },
  {
    index: 2,
    crop: "Apple",
    disease: "Cedar apple rust",
    isHealthy: false,
    severity: "moderate",
    symptoms: "Bright yellow-orange circular spots on leaf upper surfaces, small tube-like structures underneath.",
    organicTreatment: "Spray sulfur or copper soaps at blossom period. Remove nearby red cedar galls.",
    chemicalTreatment: "Myclobutanil or propiconazole sprays applied during early spring rains.",
    prevention: "Remove eastern red cedar or juniper trees within 1-2 miles if possible; use rust-resistant apple varieties."
  },
  {
    index: 3,
    crop: "Apple",
    disease: "Healthy",
    isHealthy: true,
    severity: "low",
    symptoms: "Lush green foliage, normal leaf morphology, no lesions, vigorous canopy growth.",
    organicTreatment: "Maintain routine organic fertilization and balanced drip irrigation.",
    chemicalTreatment: "None needed.",
    prevention: "Regular monitoring and routine balanced nutrition (NPK 10-10-10)."
  },
  {
    index: 4,
    crop: "Background",
    disease: "Background",
    isHealthy: false,
    severity: "low",
    symptoms: "Non-crop background, soil, human hand, or unrelated object.",
    organicTreatment: "N/A",
    chemicalTreatment: "N/A",
    prevention: "Please capture a clear, centered photo of a crop leaf under good lighting."
  },
  {
    index: 5,
    crop: "Blueberry",
    disease: "Healthy",
    isHealthy: true,
    severity: "low",
    symptoms: "Glossy deep-green leaves with smooth margins and healthy vigor.",
    organicTreatment: "Maintain acidic soil pH (4.5–5.2) using elemental sulfur and organic pine bark mulch.",
    chemicalTreatment: "None needed.",
    prevention: "Acidic soil management, drip irrigation, and annual pruning."
  },
  {
    index: 6,
    crop: "Cherry",
    disease: "Powdery mildew",
    isHealthy: false,
    severity: "moderate",
    symptoms: "White powdery fungal patches on new leaf flushes, curling upward at leaf edges.",
    organicTreatment: "Spray potassium bicarbonate, diluted milk solution (1:9), or neem oil.",
    chemicalTreatment: "Triadimefon, myclobutanil, or azoxystrobin fungicides applied when first noticed.",
    prevention: "Avoid overhead watering; prune inner canopy to maximize sunlight penetration and airflow."
  },
  {
    index: 7,
    crop: "Cherry",
    disease: "Healthy",
    isHealthy: true,
    severity: "low",
    symptoms: "Vibrant, unblemished leaves with strong shoot development.",
    organicTreatment: "Ensure adequate mulch, balanced moisture, and annual winter pruning.",
    chemicalTreatment: "None needed.",
    prevention: "Proper irrigation management and clean orchard maintenance."
  },
  {
    index: 8,
    crop: "Corn",
    disease: "Cercospora leaf spot",
    isHealthy: false,
    severity: "moderate",
    symptoms: "Narrow rectangular, tan or grayish lesions running parallel between leaf veins.",
    organicTreatment: "Foliar bio-fungicide like Bacillus subtilis, compost tea sprays.",
    chemicalTreatment: "Azoxystrobin, pyraclostrobin, or propiconazole at first sign before tasseling.",
    prevention: "Rotate corn with non-grass crops, incorporate residue, plant resistant hybrid corn seeds."
  },
  {
    index: 9,
    crop: "Corn",
    disease: "Common rust",
    isHealthy: false,
    severity: "moderate",
    symptoms: "Cinnamon-brown powdery pustules scattered across both upper and lower leaf surfaces.",
    organicTreatment: "Sulfur dusts or mineral oil sprays early in morning before temperatures exceed 28°C.",
    chemicalTreatment: "Pyraclostrobin + metconazole, or azoxystrobin + propiconazole.",
    prevention: "Plant resistant hybrids; plant early in the season to evade peak airborne spore dispersal."
  },
  {
    index: 10,
    crop: "Corn",
    disease: "Northern leaf blight",
    isHealthy: false,
    severity: "high",
    symptoms: "Large, long elliptical grayish-green or cigar-shaped lesions measuring 2 to 15 cm.",
    organicTreatment: "Bio-fungicides containing Trichoderma or Bacillus amyloliquefaciens.",
    chemicalTreatment: "Mancozeb or strobilurin-triazole mixture fungicide applied at tasseling stage.",
    prevention: "Plant disease-resistant corn hybrids; practice minimum 1-year rotation away from maize."
  },
  {
    index: 11,
    crop: "Corn",
    disease: "Healthy",
    isHealthy: true,
    severity: "low",
    symptoms: "Long, vibrant green arching leaves without striping, pustules, or necrosis.",
    organicTreatment: "Ensure nitrogen availability and regular soil moisture.",
    chemicalTreatment: "None needed.",
    prevention: "Proper spacing and balanced fertilization."
  },
  {
    index: 12,
    crop: "Grape",
    disease: "Black rot",
    isHealthy: false,
    severity: "high",
    symptoms: "Small circular brown leaf spots with tiny black pycnidia; fruit shrivels into hard black mummies.",
    organicTreatment: "Copper hydroxide or liquid lime sulfur applied from bud break to veraison.",
    chemicalTreatment: "Myclobutanil, kresoxim-methyl, or tebuconazole fungicides at 10-14 day intervals.",
    prevention: "Remove all mummified berries from vine and trellis during winter pruning; maximize canopy ventilation."
  },
  {
    index: 13,
    crop: "Grape",
    disease: "Esca (Black Measles)",
    isHealthy: false,
    severity: "high",
    symptoms: "Tiger-stripe interveinal leaf chlorosis and necrosis; dark sunken speckles on berries.",
    organicTreatment: "Bio-protectant pastes on large pruning wounds (Trichoderma atroviride).",
    chemicalTreatment: "No curative fungicide; protect large cuts with pruning sealants or wound paints.",
    prevention: "Prune during dry winter weather; disinfect shears between vines; renew cordons if trunk is decaying."
  },
  {
    index: 14,
    crop: "Grape",
    disease: "Leaf blight",
    isHealthy: false,
    severity: "moderate",
    symptoms: "Irregular reddish-brown lesions with distinct dark borders, leading to premature defoliation.",
    organicTreatment: "Bordeaux mixture (copper sulfate + lime) applied post-harvest and pre-bloom.",
    chemicalTreatment: "Chlorothalonil, mancozeb, or copper oxychloride sprays.",
    prevention: "Maintain open canopy architecture; remove fallen diseased foliage before winter dormancy."
  },
  {
    index: 15,
    crop: "Grape",
    disease: "Healthy",
    isHealthy: true,
    severity: "low",
    symptoms: "Uniform green, fan-shaped lobed leaves with intact margins and vigorous shoot growth.",
    organicTreatment: "Organic seaweed extract and balanced trellis shoot positioning.",
    chemicalTreatment: "None needed.",
    prevention: "Regular shoot thinning and balanced potassium-magnesium fertility."
  },
  {
    index: 16,
    crop: "Orange",
    disease: "Citrus greening",
    isHealthy: false,
    severity: "high",
    symptoms: "Asymmetrical blotchy mottle leaf yellowing, yellow veins, hard misshapen sour fruit.",
    organicTreatment: "Control Asian citrus psyllid vector with predatory wasps (Tamarixia radiata) and neem oil.",
    chemicalTreatment: "Imidacloprid or thiamethoxam soil drenches to suppress vector populations.",
    prevention: "Use certified disease-free nursery stock; immediately remove and burn confirmed symptomatic trees."
  },
  {
    index: 17,
    crop: "Peach",
    disease: "Bacterial spot",
    isHealthy: false,
    severity: "moderate",
    symptoms: "Angular purple-brown leaf spots that drop out creating a shot-hole appearance.",
    organicTreatment: "Fixed copper bactericide sprays at leaf fall and early spring dormant stage.",
    chemicalTreatment: "Oxytetracycline or copper sprays at shuck-split and petal fall.",
    prevention: "Plant tolerant peach varieties; avoid high nitrogen fertilization that triggers lush tender shoots."
  },
  {
    index: 18,
    crop: "Peach",
    disease: "Healthy",
    isHealthy: true,
    severity: "low",
    symptoms: "Smooth lanceolate leaves, deep green color, without gummosis or shot-holes.",
    organicTreatment: "Apply organic compost and mulch around drip line.",
    chemicalTreatment: "None needed.",
    prevention: "Consistent soil moisture and seasonal dormant oil sprays."
  },
  {
    index: 19,
    crop: "Pepper",
    disease: "Bacterial spot",
    isHealthy: false,
    severity: "moderate",
    symptoms: "Small water-soaked circular spots turning dark brown with yellow halos; leaves yellow and drop.",
    organicTreatment: "Copper sulfate pentahydrate or Bacillus amyloliquefaciens foliar sprays.",
    chemicalTreatment: "Copper hydroxide tank-mixed with mancozeb for enhanced bactericidal efficacy.",
    prevention: "Use certified pathogen-free seed; avoid handling plants when foliage is wet; 2-year crop rotation."
  },
  {
    index: 20,
    crop: "Pepper",
    disease: "Healthy",
    isHealthy: true,
    severity: "low",
    symptoms: "Glossy, uniform oval leaves with clean stems and vigorous flower/fruit sets.",
    organicTreatment: "Calcium-rich soil amendments (gypsum/bone meal) to support cell wall strength.",
    chemicalTreatment: "None needed.",
    prevention: "Mulch beds and water with drip lines to prevent soil splashing."
  },
  {
    index: 21,
    crop: "Potato",
    disease: "Early blight",
    isHealthy: false,
    severity: "moderate",
    symptoms: "Dark brown to black target-like concentric ring spots on older lower leaves.",
    organicTreatment: "Copper hydroxide or copper octanoate spray; potassium silicate foliar application.",
    chemicalTreatment: "Chlorothalonil, azoxystrobin, or difenoconazole every 7-14 days.",
    prevention: "Ensure sufficient nitrogen and potassium; use drip irrigation; rotate crops with non-Solanaceae."
  },
  {
    index: 22,
    crop: "Potato",
    disease: "Late blight",
    isHealthy: false,
    severity: "high",
    symptoms: "Large, water-soaked dark lesions with pale green borders; white fuzzy growth underneath in high humidity.",
    organicTreatment: "Preventative copper fungicide before rain periods; destroy infected plant debris immediately.",
    chemicalTreatment: "Metalaxyl + mancozeb, cymoxanil, or mandipropamid fungicides applied promptly.",
    prevention: "Plant certified seed tubers; hill potatoes deeply to shield tubers; eliminate cull piles."
  },
  {
    index: 23,
    crop: "Potato",
    disease: "Healthy",
    isHealthy: true,
    severity: "low",
    symptoms: "Vigorous dense canopy, clean compound leaves, no chlorosis or edge curling.",
    organicTreatment: "Apply balanced vermicompost and maintain even tuber bulking moisture.",
    chemicalTreatment: "None needed.",
    prevention: "Proper hilling, adequate spacing, and drip irrigation."
  },
  {
    index: 24,
    crop: "Raspberry",
    disease: "Healthy",
    isHealthy: true,
    severity: "low",
    symptoms: "Compound serrated leaves, bright green, free of rust or cane blights.",
    organicTreatment: "Maintain woodchip mulch and prune out old spent canes in autumn.",
    chemicalTreatment: "None needed.",
    prevention: "Support canes on trellises to enhance air movement."
  },
  {
    index: 25,
    crop: "Soybean",
    disease: "Healthy",
    isHealthy: true,
    severity: "low",
    symptoms: "Trifoliate clean green leaves, strong nodulation, uniform canopy closure.",
    organicTreatment: "Inoculate seeds with Bradyrhizobium japonicum before planting.",
    chemicalTreatment: "None needed.",
    prevention: "Rotate with corn or small grains; plant treated seed."
  },
  {
    index: 26,
    crop: "Squash",
    disease: "Powdery mildew",
    isHealthy: false,
    severity: "moderate",
    symptoms: "Talcan-like white powdery spots across upper leaf surfaces spreading into complete white coating.",
    organicTreatment: "Baking soda (1 tbsp + 1 tsp horticultural oil in 4L water), neem oil, or sulfur spray.",
    chemicalTreatment: "Myclobutanil, triflumizole, or pyraclostrobin fungicides.",
    prevention: "Plant mildew-resistant squash varieties; water at ground level; maximize spacing."
  },
  {
    index: 27,
    crop: "Strawberry",
    disease: "Leaf scorch",
    isHealthy: false,
    severity: "moderate",
    symptoms: "Small purple to brown spots enlarging and merging, giving leaves a burned, scorched appearance.",
    organicTreatment: "Copper-based fungicides applied early spring and after renovation.",
    chemicalTreatment: "Captan, thiram, or thiophanate-methyl.",
    prevention: "Rake and remove old dead leaves after harvest; avoid overhead irrigation; renovate beds yearly."
  },
  {
    index: 28,
    crop: "Strawberry",
    disease: "Healthy",
    isHealthy: true,
    severity: "low",
    symptoms: "Deep emerald trifoliate leaves with healthy serrated edges and clean crowns.",
    organicTreatment: "Straw mulching to keep fruit and leaves off bare ground.",
    chemicalTreatment: "None needed.",
    prevention: "Keep planting rows narrow for rapid drying after dew."
  },
  {
    index: 29,
    crop: "Tomato",
    disease: "Bacterial spot",
    isHealthy: false,
    severity: "moderate",
    symptoms: "Small, dark, greasy water-soaked spots with yellow margins on leaves; brown scabs on green fruits.",
    organicTreatment: "Copper hydroxide + bacillus subtilis spray at transplanting.",
    chemicalTreatment: "Copper mixed with mancozeb to overcome copper-resistant bacterial strains.",
    prevention: "Use hot-water treated seed; clean stakes and cages; eliminate nightshade weeds."
  },
  {
    index: 30,
    crop: "Tomato",
    disease: "Early blight",
    isHealthy: false,
    severity: "moderate",
    symptoms: "Distinct brown circular spots with concentric target-board rings starting on lower leaves.",
    organicTreatment: "Copper soap spray, neem oil, and biological biofungicide (Serenade).",
    chemicalTreatment: "Chlorothalonil, azoxystrobin, or difenoconazole spray on 7-10 day cycle.",
    prevention: "Prune bottom 12 inches of foliage; mulch under plants; water strictly at base via drip."
  },
  {
    index: 31,
    crop: "Tomato",
    disease: "Late blight",
    isHealthy: false,
    severity: "high",
    symptoms: "Large, oily dark brown water-soaked blotches with white fungal fluff on undersides during wet weather.",
    organicTreatment: "Preventative copper sprays; immediately bag and discard heavily diseased vines.",
    chemicalTreatment: "Mandipropamid, chlorothalonil, or cymoxanil applied upon regional disease warnings.",
    prevention: "Avoid planting tomatoes near potatoes; ensure high air circulation; water early in day."
  },
  {
    index: 32,
    crop: "Tomato",
    disease: "Leaf mold",
    isHealthy: false,
    severity: "moderate",
    symptoms: "Pale greenish-yellow spots on leaf upper surface; olive-green velvety fungal growth underneath.",
    organicTreatment: "Potassium bicarbonate spray, copper octanoate; reduce relative humidity below 85%.",
    chemicalTreatment: "Chlorothalonil or copper hydroxide sprays.",
    prevention: "Crucial in polytunnels and greenhouses: maximize vent openings; increase plant spacing."
  },
  {
    index: 33,
    crop: "Tomato",
    disease: "Septoria leaf spot",
    isHealthy: false,
    severity: "moderate",
    symptoms: "Numerous tiny circular spots with dark brown borders and grayish-white centers containing black specks.",
    organicTreatment: "Copper soap, biological fungicides (Bacillus subtilis), remove lower diseased foliage.",
    chemicalTreatment: "Chlorothalonil, mancozeb, or azoxystrobin applied every 7-10 days.",
    prevention: "Apply thick layer of organic mulch; practice 3-year crop rotation; sanitize garden trellises."
  },
  {
    index: 34,
    crop: "Tomato",
    disease: "Spider mites",
    isHealthy: false,
    severity: "moderate",
    symptoms: "Fine yellow-white stippling on leaves, leaf bronze-yellowing, fine silky webbing on leaf undersides.",
    organicTreatment: "Insecticidal soap, cold-pressed neem oil spray, release predatory mites (Phytoseiulus persimilis).",
    chemicalTreatment: "Abamectin, bifenazate, or spiromesifen miticides.",
    prevention: "Keep plants well watered during hot dry spells; wash dust off foliage with forceful water spray."
  },
  {
    index: 35,
    crop: "Tomato",
    disease: "Target spot",
    isHealthy: false,
    severity: "moderate",
    symptoms: "Brown necrotic lesions with concentric zones resembling a bullseye; leaves turn yellow and drop.",
    organicTreatment: "Copper fungicides applied at first sign of disease onset.",
    chemicalTreatment: "Azoxystrobin + difenoconazole, or famoxadone + cymoxanil.",
    prevention: "Avoid excess nitrogen; stake plants off ground; maintain wide plant spacing."
  },
  {
    index: 36,
    crop: "Tomato",
    disease: "Yellow leaf curl virus",
    isHealthy: false,
    severity: "high",
    symptoms: "Severe upward curling and cupping of leaflets, intense interveinal chlorosis, stunted bushy plant.",
    organicTreatment: "Control silverleaf whitefly vector with yellow sticky traps, neem oil, and insecticidal soap.",
    chemicalTreatment: "Systemic neonicotinoids or cyantraniliprole targeted at whitefly nymphs.",
    prevention: "Use virus-resistant tomato hybrids (e.g., Ty-resistant); install 50-mesh insect netting in nurseries."
  },
  {
    index: 37,
    crop: "Tomato",
    disease: "Mosaic virus",
    isHealthy: false,
    severity: "high",
    symptoms: "Mottled light and dark green mosaic patterns on leaves, leaf distortion, stringy shoestring leaves.",
    organicTreatment: "No cure once infected; immediately roguel and burn infected plants.",
    chemicalTreatment: "No chemical control available for plant viruses.",
    prevention: "Wash hands thoroughly with soap before handling plants (tobacco users); disinfect pruning shears in 20% skim milk."
  },
  {
    index: 38,
    crop: "Tomato",
    disease: "Healthy",
    isHealthy: true,
    severity: "low",
    symptoms: "Strong thick stems, deep emerald green leaves, vibrant flowers and healthy fruit trusses.",
    organicTreatment: "Feed weekly with balanced organic tomato food (rich in potash) once fruit sets.",
    chemicalTreatment: "None needed.",
    prevention: "Regular sucker pruning, steady watering, and calcium supplementation to avoid blossom end rot."
  }
];

export const BACKGROUND_INDEX = 4;
export const CONFIDENCE_THRESHOLD = 0.25;

