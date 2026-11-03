import { ChangeEvent, lazy, Suspense, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertTriangle,
  ArrowUpRight,
  BarChart3,
  Camera,
  CheckCircle2,
  ChevronRight,
  CloudSun,
  Edit3,
  FileScan,
  FlaskConical,
  FlipHorizontal,
  HelpCircle,
  ImagePlus,
  Info,
  Leaf,
  Loader2,
  MessageCircle,
  Mic,
  MicOff,
  Pill,
  RefreshCw,
  Save,
  Search,
  Send,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Sprout,
  Trash2,
  TrendingUp,
  Volume2,
  VolumeX,
  X
} from "lucide-react";
import defaultCatalog from "./defaultCatalog.json";
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import {
  apiBaseUrl,
  askAssistant,
  checkApiHealth,
  deleteScan,
  getCrops,
  getDashboardSummary,
  getScans,
  getWeather,
  predictImage,
  updateScanNotes,
  CropCatalogItem,
  Prediction,
  Scan,
  User
} from "./api";
import { t, SUPPORTED_LANGUAGES, getLanguageLocale } from "./i18n";
import { speakText, stopSpeaking } from "./speech";

const FarmScene = lazy(() => import("./FarmScene"));

// Fallback crop catalog so the catalog works immediately
const defaultCrops = [
  "Apple", "Blueberry", "Cherry", "Corn", "Grape", "Orange",
  "Peach", "Pepper", "Potato", "Raspberry", "Soybean", "Squash",
  "Strawberry", "Tomato"
];

const sampleLeaves = [
  { name: "Tomato Late Blight", file: "/samples/tomato_late_blight.png", crop: "Tomato", hint: "Water-soaked dark lesions" },
  { name: "Apple Cedar Rust", file: "/samples/apple_cedar_rust.png", crop: "Apple", hint: "Bright orange rust pustules" },
  { name: "Corn Common Rust", file: "/samples/corn_common_rust.png", crop: "Corn", hint: "Raised powdery brown pustules" },
  { name: "Apple Healthy Leaf", file: "/samples/apple_healthy.png", crop: "Apple", hint: "Clean vigorous leaf tissue" },
];

export function Dashboard({ language = "English", user }: { language?: string; user?: User | null }) {
  const [scans, setScans] = useState<Scan[]>([]);
  const [summary, setSummary] = useState<{ totalScans: number; healthyScans: number; diseasedScans: number; lastUpdated: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getScans()
      .then((data) => setScans(Array.isArray(data) ? data : []))
      .catch((err) => console.warn("Failed to load recent scans:", err))
      .finally(() => setLoading(false));
    getDashboardSummary()
      .then((aggregate) => aggregate && setSummary(aggregate))
      .catch((err) => console.warn("Failed to load dashboard summary:", err));
  }, []);

  const scanList = Array.isArray(scans) ? scans : [];
  const totalScans = summary?.totalScans ?? scanList.length;
  const healthyCount = summary?.healthyScans ?? scanList.filter((s) => s.disease && s.disease.toLowerCase() === "healthy").length;
  const healthyRatio = totalScans > 0 ? Math.round((healthyCount / totalScans) * 100) : 100;
  const recentObservations = scanList.slice(0, 5);

  return (
    <section className="page-grid">
      <div className="hero-card">
        <div>
          <div className="hero-brand-tag">
            <img src="/logo.svg" alt="Krishi Drishti Logo" className="hero-logo-mini" />
            <span>Krishi Drishti AI Intelligence</span>
          </div>
          <p className="eyebrow light">AI Crop Health Workspace</p>
          <h2>{user ? `${t("greeting", language)}, ${user.name}` : t("heroTitle", language)}</h2>
          <p>{t("heroSubtitle", language)}</p>
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginTop: "16px" }}>
            <Link className="button button-light" to="/scan">
              {t("startScanBtn", language)} <ArrowUpRight size={17} />
            </Link>
            <Link className="button" style={{ background: "rgba(255,255,255,0.15)", color: "#fff" }} to="/assistant">
              {t("askDoctorBtn", language)} <Sparkles size={16} />
            </Link>
          </div>
        </div>
        <div className="hero-logo-showcase">
          <Suspense fallback={<img src="/logo.svg" alt="Krishi Drishti Official Logo" className="hero-main-logo" />}>
            <FarmScene />
          </Suspense>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <p>{t("totalScansRecorded", language)}</p>
          <strong>{totalScans}</strong>
          <span>{summary ? `Updated ${new Date(summary.lastUpdated).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}` : "Loading database summary..."}</span>
        </div>
        <div className="stat-card">
          <p>{t("healthyTissueRatio", language)}</p>
          <strong>{healthyRatio}%</strong>
          <span>{healthyCount} healthy scans</span>
        </div>
        <div className="stat-card">
          <p>{t("modelEngine", language)}</p>
          <strong>ONNX 224</strong>
          <span>MobileNet / ResNet</span>
        </div>
        <div className="stat-card">
          <p>{t("languageAndVoice", language)}</p>
          <strong>{language}</strong>
          <span>Speech Enabled</span>
        </div>
      </div>

      <div className="two-column">
        <div className="card">
          <div className="section-head">
            <div>
              <p className="eyebrow">Audit Stream</p>
              <h3>{t("recentDiagnoses", language)}</h3>
            </div>
            <Link to="/analytics" className="text-link">
              {t("viewAll", language)} <ArrowUpRight size={15} />
            </Link>
          </div>

          {loading ? (
            <div style={{ padding: "40px 0", textAlign: "center" }}>
              <Loader2 className="animate-spin" size={24} style={{ color: "#1e6b4d", margin: "auto" }} />
              <p className="muted" style={{ marginTop: "10px" }}>Loading scan records...</p>
            </div>
          ) : recentObservations.length === 0 ? (
            <div style={{ padding: "40px 0", textAlign: "center" }}>
              <p className="muted">No scans recorded yet. Upload a leaf photo to begin.</p>
              <Link to="/scan" className="button" style={{ marginTop: "12px", display: "inline-flex" }}>
                Scan first leaf
              </Link>
            </div>
          ) : (
            <div className="activity-list">
              {recentObservations.map((item) => (
                <div key={item.id} className="activity-item">
                  <div className="activity-main">
                    <span className={`status-dot-badge ${item.disease.toLowerCase() === "healthy" ? "healthy" : "danger"}`} />
                    <div>
                      <strong>{item.crop} — {item.disease}</strong>
                      {item.notes && <p style={{ margin: "2px 0 0", fontSize: "12px", color: "#5d786a" }}>Note: {item.notes}</p>}
                    </div>
                  </div>
                  <div className="activity-meta">
                    <strong>{(item.confidence * 100).toFixed(1)}%</strong>
                    <small>{new Date(item.createdAt).toLocaleDateString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</small>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card insight-card">
          <div className="icon-box">
            <ShieldCheck size={20} />
          </div>
          <p className="eyebrow">Agronomist Tip</p>
          <h3>High humidity alert after dew hours</h3>
          <p className="muted">
            Fungal spores such as Late Blight and Downy Mildew penetrate plant tissue when free moisture stays on leaves for more than 4 hours.
          </p>
          <div style={{ marginTop: "18px", display: "flex", gap: "10px" }}>
            <Link to="/weather" className="text-link">
              Check weather risks <ArrowUpRight size={15} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export function ScanPage({ language = "English", user }: { language?: string; user?: User | null }) {
  const [result, setResult] = useState<Prediction[] | null>(null);
  const [savedScan, setSavedScan] = useState<Scan | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [selectedSample, setSelectedSample] = useState<string | null>(null);
  const [notes, setNotes] = useState("");
  const [speaking, setSpeaking] = useState(false);

  // Direct Camera Scanner States
  const [cameraOpen, setCameraOpen] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState<"environment" | "user">("environment");
  const [cameraError, setCameraError] = useState("");
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [cameraStream]);

  async function startCamera(mode: "environment" | "user" = "environment") {
    setCameraError("");
    setCameraOpen(true);
    setFacingMode(mode);

    try {
      if (cameraStream) {
        cameraStream.getTracks().forEach((track) => track.stop());
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: mode },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });
      setCameraStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(() => {});
      }
    } catch (err: any) {
      console.error("Camera access error:", err);
      setCameraError("Camera permission denied or camera not found. Please enable camera access in browser settings.");
    }
  }

  function switchCamera() {
    const nextMode = facingMode === "environment" ? "user" : "environment";
    startCamera(nextMode);
  }

  function stopCamera() {
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop());
      setCameraStream(null);
    }
    setCameraOpen(false);
    setCameraError("");
  }

  function captureCameraPhoto() {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    canvas.toBlob((blob) => {
      if (blob) {
        stopCamera();
        handleFile(blob);
      }
    }, "image/jpeg", 0.95);
  }

  async function handleFile(file: File | Blob, previewUrl?: string) {
    setError("");
    setResult(null);
    setSavedScan(null);
    setLoading(true);
    if (previewUrl) {
      setPreview(previewUrl);
    } else if (file instanceof File || file instanceof Blob) {
      setPreview(URL.createObjectURL(file));
    }

    try {
      const response = await predictImage(file, notes);
      setResult(response.predictions);
      if (response.scan) setSavedScan(response.scan);
    } catch (err: any) {
      const msg = err.response?.data?.error || err.message || "Failed to analyze leaf image.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  function onFileInput(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedSample(null);
      handleFile(file);
    }
  }

  async function onSampleClick(sample: typeof sampleLeaves[0]) {
    setSelectedSample(sample.name);
    try {
      const res = await fetch(sample.file);
      const blob = await res.blob();
      handleFile(blob, sample.file);
    } catch (err) {
      setError("Unable to load sample image.");
    }
  }

  function toggleVoiceReadout() {
    if (speaking) {
      stopSpeaking();
      setSpeaking(false);
      return;
    }
    if (!result || result.length === 0) return;
    const top = result[0];
    const textToRead = top.isHealthy
      ? `${top.crop} leaf is healthy. High vitality detected with ${(top.confidence * 100).toFixed(0)} percent confidence.`
      : `${top.crop} plant affected by ${top.disease}. Severity is ${top.severity}. Symptoms: ${top.symptoms}. Recommended organic treatment: ${top.organicTreatment}.`;

    const started = speakText(textToRead, language, () => setSpeaking(false));
    if (!started && language !== "English") {
      setError(`No native ${getLanguageLocale(language)} voice is available in this browser. Install a ${language} system voice or use a browser with ${language} speech support.`);
    }
    if (started) setSpeaking(true);
  }

  const topPrediction = result?.[0];

  return (
    <section className="page-grid">
      {/* Live Camera Scanner Modal */}
      {cameraOpen && (
        <div className="camera-modal-backdrop" onClick={stopCamera}>
          <div className="camera-scanner-modal" onClick={(e) => e.stopPropagation()}>
            <div className="camera-modal-header">
              <h3>
                <Camera size={20} /> {t("liveCameraScanner", language)}
              </h3>
              <button className="camera-close-btn" onClick={stopCamera} title={t("closeCameraBtn", language)}>
                <X size={20} />
              </button>
            </div>

            {cameraError ? (
              <div className="form-error" style={{ margin: "20px" }}>
                <AlertTriangle size={18} />
                <span>{cameraError}</span>
              </div>
            ) : (
              <div className="camera-video-container">
                <video
                  ref={(el) => {
                    videoRef.current = el;
                    if (el && cameraStream && el.srcObject !== cameraStream) {
                      el.srcObject = cameraStream;
                      el.play().catch(() => {});
                    }
                  }}
                  autoPlay
                  playsInline
                  muted
                  className="camera-video-feed"
                />
                <div className="camera-reticle-box">
                  <div className="camera-reticle-corner tl" />
                  <div className="camera-reticle-corner tr" />
                  <div className="camera-reticle-corner bl" />
                  <div className="camera-reticle-corner br" />
                  <div className="camera-laser-line" />
                </div>
                <div className="camera-hint-overlay">
                  {t("centerLeafTarget", language)}
                </div>
              </div>
            )}

            <div className="camera-controls-row">
              <button
                type="button"
                className="camera-switch-btn"
                onClick={switchCamera}
                title={t("switchCameraBtn", language)}
              >
                <FlipHorizontal size={20} />
              </button>

              <button
                type="button"
                className="camera-shutter-btn"
                onClick={captureCameraPhoto}
                title={t("captureAnalyzeBtn", language)}
              >
                <span className="camera-shutter-inner" />
              </button>

              <div style={{ width: "44px" }} />
            </div>
          </div>
        </div>
      )}

      <div className="scan-intro">
        <div>
          <p className="eyebrow">{t("realtimeDiagnosis", language)}</p>
          <h2>{t("uploadOrChooseLeaf", language)}</h2>
          <p className="muted">{t("scanDesc", language)}</p>
        </div>
        <div className="contract-pill">
          <CheckCircle2 size={16} /> ONNX 224x224 Model Active
        </div>
      </div>

      {/* Primary Capture Action Options */}
      <div className="card" style={{ padding: "16px 20px" }}>
        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", alignItems: "center" }}>
          <button
            type="button"
            className="button"
            onClick={() => startCamera("environment")}
            disabled={loading}
            style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}
          >
            <Camera size={18} /> {t("openCameraBtn", language)}
          </button>
          <label
            className="button button-light"
            style={{ display: "inline-flex", alignItems: "center", gap: "8px", cursor: "pointer", margin: 0 }}
          >
            <ImagePlus size={18} /> {t("dragOrChooseLeaf", language)}
            <input
              type="file"
              accept="image/*,.png,.jpg,.jpeg,.webp,.avif,.bmp,.tiff,.heic,.heif,.gif"
              capture="environment"
              onChange={onFileInput}
              disabled={loading}
              style={{ display: "none" }}
            />
          </label>
        </div>
      </div>

      {/* Field Notes Input */}
      <div className="card" style={{ padding: "14px 20px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
          <Edit3 size={17} style={{ color: "#1a5e42" }} />
          <strong>{t("fieldNotesLabel", language)}</strong>
          <input
            type="text"
            className="form-input"
            style={{ flex: 1, minWidth: "220px", padding: "8px 12px" }}
            placeholder={t("fieldNotesPlaceholder", language)}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>
      </div>

      {/* Sample Leaf Quick Selector */}
      <div className="card sample-card">
        <p className="eyebrow">{t("verifiedTestLeaves", language)}</p>
        <p style={{ fontSize: "13px", color: "#5d786a", margin: "4px 0 12px" }}>
          {t("verifiedLeavesHint", language)}
        </p>
        <div className="sample-grid">
          {sampleLeaves.map((sample) => (
            <button
              key={sample.name}
              type="button"
              className={`sample-button ${selectedSample === sample.name ? "active" : ""}`}
              onClick={() => onSampleClick(sample)}
              disabled={loading}
            >
              <img src={sample.file} alt={sample.name} className="sample-thumb" />
              <div style={{ textAlign: "left" }}>
                <strong>{sample.name}</strong>
                <small>{sample.hint}</small>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Upload Zone */}
      <label className={`upload-card ${preview ? "has-preview" : ""}`}>
        {preview ? (
          <div className="preview-container">
            <img src={preview} alt="Leaf Preview" className="leaf-preview" />
            <div className="change-overlay">
              <ImagePlus size={24} />
              <span>Click or drop another image to replace</span>
            </div>
          </div>
        ) : (
          <>
            <ImagePlus size={42} />
            <strong>{loading ? t("analyzingLeaf", language) : t("dragOrChooseLeaf", language)}</strong>
            <span>{t("supportedFormats", language)}</span>
          </>
        )}
        <input
          type="file"
          accept="image/*,.png,.jpg,.jpeg,.webp,.avif,.bmp,.tiff,.heic,.heif,.gif"
          capture="environment"
          onChange={onFileInput}
          disabled={loading}
        />
      </label>

      {loading && (
        <div className="card loading-card">
          <Loader2 className="animate-spin" size={28} style={{ color: "#1e6b4d", margin: "auto" }} />
          <strong style={{ display: "block", marginTop: "12px", fontSize: "16px" }}>{t("analyzingLeaf", language)}</strong>
          <p style={{ color: "#6b8879", fontSize: "13px", margin: "4px 0 0" }}>
            Extracting features, computing disease probabilities, and querying treatment protocols.
          </p>
        </div>
      )}

      {error && (
        <div className="error-box">
          <AlertTriangle size={18} />
          <div>
            <strong>Diagnosis Issue</strong>
            <p style={{ margin: "2px 0 0" }}>{error}</p>
          </div>
        </div>
      )}

      {/* Comprehensive Prediction Results */}
      {result && topPrediction && (
        <div className="results-container">
          <div className="card highlight-result">
            <div className="result-header">
              <span className={`status-badge ${topPrediction.isHealthy ? "healthy" : topPrediction.severity}`}>
                {topPrediction.isHealthy ? t("healthyFoliage", language) : `${topPrediction.severity.toUpperCase()} SEVERITY`}
              </span>
              <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                <span className="confidence-pill">
                  {(topPrediction.confidence * 100).toFixed(1)}% Match
                </span>
                <button
                  type="button"
                  className={`audio-speaker-btn ${speaking ? "speaking" : ""}`}
                  onClick={toggleVoiceReadout}
                  title="Listen to diagnosis and advice aloud"
                >
                  {speaking ? <VolumeX size={15} /> : <Volume2 size={15} />}
                  {speaking ? t("stopAudio", language) : t("listenAdvice", language)}
                </button>
              </div>
            </div>

            <div className="disease-title-row">
              <div>
                <p className="eyebrow">{topPrediction.crop} Plant</p>
                <h2>{topPrediction.disease}</h2>
              </div>
            </div>

            <p className="symptoms-text">
              <strong>{t("observedSymptoms", language)}</strong> {topPrediction.symptoms}
            </p>

            {/* Actionable Treatment Protocols */}
            {!topPrediction.isHealthy && (
              <div className="treatment-grid">
                <div className="treatment-card organic">
                  <div className="treatment-head">
                    <Leaf size={18} />
                    <strong>{t("organicRemedy", language)}</strong>
                  </div>
                  <p>{topPrediction.organicTreatment}</p>
                </div>

                <div className="treatment-card chemical">
                  <div className="treatment-head">
                    <FlaskConical size={18} />
                    <strong>{t("chemicalSpray", language)}</strong>
                  </div>
                  <p>{topPrediction.chemicalTreatment}</p>
                </div>

                <div className="treatment-card prevention">
                  <div className="treatment-head">
                    <ShieldCheck size={18} />
                    <strong>{t("preventionPractice", language)}</strong>
                  </div>
                  <p>{topPrediction.prevention}</p>
                </div>
              </div>
            )}

            {/* Probable Secondary Classes */}
            {result.length > 1 && (
              <div className="secondary-predictions">
                <p className="eyebrow" style={{ marginTop: "20px" }}>Alternative Possibilities</p>
                {result.slice(1).map((item) => (
                  <div className="prediction" key={item.index}>
                    <div>
                      <strong>{item.crop} — {item.disease}</strong>
                      <div className="confidence-track">
                        <div
                          className="confidence-fill"
                          style={{ width: `${Math.min(100, item.confidence * 100)}%` }}
                        />
                      </div>
                    </div>
                    <span className="secondary-confidence">{(item.confidence * 100).toFixed(1)}%</span>
                  </div>
                ))}
              </div>
            )}

            <div className="result-actions">
              <Link to="/analytics" className="button button-light">
                View in Scan Analytics <ArrowUpRight size={16} />
              </Link>
              <Link to="/assistant" className="button">
                Ask AI Assistant for Advice <MessageCircle size={16} />
              </Link>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

const FRUIT_CROPS = new Set([
  "Apple", "Blueberry", "Cherry", "Grape", "Orange", "Peach", "Raspberry", "Strawberry"
]);

function isFruit(crop: string): boolean {
  return FRUIT_CROPS.has(crop);
}

function getDiseasePhoto(crop: string, disease: string): string {
  const c = crop.toLowerCase().trim();
  const d = disease.toLowerCase().trim().replace(/[^a-z0-9_]/g, '_').replace(/_+/g, '_');
  return `/diseases/${c}-${d}.jpg`;
}

function getCropCover(crop: string): string {
  return `/diseases/crop-${crop.toLowerCase().trim()}.jpg`;
}

export function Crops({ language = "English" }: { language?: string }) {
  const [catalog, setCatalog] = useState<CropCatalogItem[]>(() => {
    return (defaultCatalog as CropCatalogItem[]) || [];
  });
  const [query, setQuery] = useState("");
  const [categoryTab, setCategoryTab] = useState<"all" | "fruits" | "vegetables">("all");
  const [selectedCrop, setSelectedCrop] = useState<CropCatalogItem | null>(() => {
    return (defaultCatalog as CropCatalogItem[])?.[0] || null;
  });

  useEffect(() => {
    getCrops()
      .then((data) => {
        if (data && data.length > 0) {
          setCatalog(data);
          // Keep current selection or update to first
          setSelectedCrop((prev) => (prev ? (data.find(c => c.crop === prev.crop) || data[0]) : data[0]));
        }
      })
      .catch((err) => console.warn("Using offline complete catalog:", err));
  }, []);

  const filteredCrops = catalog.filter((c) => {
    const matchesSearch = c.crop.toLowerCase().includes(query.toLowerCase());
    if (!matchesSearch) return false;
    if (categoryTab === "fruits") return isFruit(c.crop);
    if (categoryTab === "vegetables") return !isFruit(c.crop);
    return true;
  });

  return (
    <section className="page-grid">
      <div className="crop-library-layout">
        {/* Left Options Navigation Panel */}
        <div className="crop-nav-panel">
          {/* Search Box */}
          <div className="crop-search-box">
            <Search size={16} style={{ color: "#4a6b5c", flexShrink: 0 }} />
            <input
              type="text"
              placeholder={t("searchCropPlaceholder", language)}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                style={{ background: "none", border: 0, padding: 0, cursor: "pointer", color: "#6b8879" }}
              >
                <X size={15} />
              </button>
            )}
          </div>

          {/* Category Filter Tabs */}
          <div className="crop-filter-tabs">
            <button
              type="button"
              className={`crop-filter-btn ${categoryTab === "all" ? "active" : ""}`}
              onClick={() => setCategoryTab("all")}
            >
              {t("allCrops", language)} ({catalog.length})
            </button>
            <button
              type="button"
              className={`crop-filter-btn ${categoryTab === "fruits" ? "active" : ""}`}
              onClick={() => setCategoryTab("fruits")}
            >
              {t("fruits", language)} ({catalog.filter(c => isFruit(c.crop)).length})
            </button>
            <button
              type="button"
              className={`crop-filter-btn ${categoryTab === "vegetables" ? "active" : ""}`}
              onClick={() => setCategoryTab("vegetables")}
            >
              {t("vegetables", language)} ({catalog.filter(c => !isFruit(c.crop)).length})
            </button>
          </div>

          {/* Options List */}
          <div className="crop-options-list">
            {filteredCrops.length === 0 ? (
              <div style={{ textAlign: "center", padding: "24px", color: "#6b8879", fontSize: "13px" }}>
                No crops match "{query}"
              </div>
            ) : (
              filteredCrops.map((c) => (
                <button
                  key={c.crop}
                  type="button"
                  className={`crop-option-item ${selectedCrop?.crop === c.crop ? "active" : ""}`}
                  onClick={() => setSelectedCrop(c)}
                >
                  <div className="crop-option-main">
                    <img
                      src={getCropCover(c.crop)}
                      alt={c.crop}
                      className="crop-thumb-img"
                      onError={(e) => { (e.target as HTMLImageElement).src = '/logo.svg'; }}
                    />
                    <div className="crop-option-texts">
                      <span className="crop-option-name">{c.crop}</span>
                      <span className="crop-option-type">{isFruit(c.crop) ? "Fruit" : "Vegetable / Crop"}</span>
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <span className="crop-count-badge">{c.diseases?.length || 0} Diseases</span>
                    <ChevronRight size={16} style={{ color: selectedCrop?.crop === c.crop ? "#1a5e42" : "#92b1a0" }} />
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Right Details Panel with Disease Images */}
        <div className="crop-details-panel">
          {selectedCrop ? (
            <div>
              {/* Crop Header */}
              <div className="card crop-header-card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
                <div>
                  <p className="eyebrow">{isFruit(selectedCrop.crop) ? "Fruit Plant Profile" : "Vegetable / Field Crop Profile"}</p>
                  <h2>{selectedCrop.crop} Health & Pathology Guide</h2>
                  <p className="muted" style={{ margin: "4px 0 0" }}>
                    Displaying symptoms, organic and chemical controls for {selectedCrop.diseases.length} condition(s).
                  </p>
                </div>
                <img
                  src={getCropCover(selectedCrop.crop)}
                  alt={selectedCrop.crop}
                  style={{ width: "80px", height: "80px", borderRadius: "14px", objectFit: "cover", border: "2px solid #dcece3" }}
                  onError={(e) => { (e.target as HTMLImageElement).src = '/logo.svg'; }}
                />
              </div>

              {/* Disease Cards Stack with Images */}
              <div className="disease-cards-stack">
                {selectedCrop.diseases.map((d) => (
                  <div key={d.disease} className="disease-card-with-photo">
                    {/* Disease Leaf Image Column */}
                    <div className="disease-photo-col">
                      <img
                        src={getDiseasePhoto(selectedCrop.crop, d.disease)}
                        alt={`${selectedCrop.crop} ${d.disease}`}
                        className="disease-leaf-photo"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = getCropCover(selectedCrop.crop);
                        }}
                      />
                      <span className="disease-photo-caption">Leaf Pathology Sample</span>
                      <button
                        type="button"
                        className="audio-speaker-btn"
                        style={{ width: "100%", justifyContent: "center" }}
                        onClick={() => {
                          const text = d.isHealthy
                            ? `${selectedCrop.crop} foliage is healthy. Normal leaf color and vigorous canopy detected.`
                            : `${selectedCrop.crop} disease: ${d.disease}. Symptoms: ${d.symptoms}. Organic remedy: ${d.organicTreatment}. Chemical spray: ${d.chemicalTreatment}.`;
                          speakText(text, language);
                        }}
                      >
                        <Volume2 size={13} /> {t("listenAdvice", language)}
                      </button>
                    </div>

                    {/* Disease Information Column */}
                    <div className="disease-info-col">
                      <div className="disease-header-row">
                        <h4>{d.disease}</h4>
                        <span className={`status-badge ${d.isHealthy ? "healthy" : d.severity}`}>
                          {d.isHealthy ? t("healthyFoliage", language) : `${d.severity.toUpperCase()} SEVERITY`}
                        </span>
                      </div>

                      <p className="disease-symptom-text">
                        <strong>{t("observedSymptoms", language)}</strong> {d.symptoms}
                      </p>

                      {!d.isHealthy && (
                        <div className="treatment-mini-grid">
                          <div className="mini-treatment organic">
                            <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
                              <Leaf size={15} />
                              <strong>{t("organicRemedy", language)}</strong>
                            </div>
                            <p>{d.organicTreatment}</p>
                          </div>
                          <div className="mini-treatment chemical">
                            <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
                              <FlaskConical size={15} />
                              <strong>{t("chemicalSpray", language)}</strong>
                            </div>
                            <p>{d.chemicalTreatment}</p>
                          </div>
                          <div className="mini-treatment prevention">
                            <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
                              <ShieldCheck size={15} />
                              <strong>{t("preventionPractice", language)}</strong>
                            </div>
                            <p>{d.prevention}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="card" style={{ textAlign: "center", padding: "40px" }}>
              <p className="muted">Select a crop from the list to view its supported diseases.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export function Analytics({ language = "English" }: { language?: string }) {
  const [scans, setScans] = useState<Scan[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editNoteText, setEditNoteText] = useState("");
  const [savingNote, setSavingNote] = useState(false);

  useEffect(() => {
    loadScans();
  }, []);

  function loadScans() {
    setLoading(true);
    getScans()
      .then((data) => setScans(data))
      .catch((err) => console.warn("Failed to load scans:", err))
      .finally(() => setLoading(false));
  }

  async function handleDelete(id: string) {
    if (!window.confirm("Are you sure you want to delete this scan record?")) return;
    try {
      await deleteScan(id);
      setScans((prev) => prev.filter((s) => s.id !== id));
    } catch (err) {
      alert("Failed to delete scan record.");
    }
  }

  function startEditNote(scan: Scan) {
    setEditingId(scan.id);
    setEditNoteText(scan.notes || "");
  }

  async function handleSaveNote(id: string) {
    setSavingNote(true);
    try {
      await updateScanNotes(id, editNoteText);
      setScans(prev => prev.map(s => s.id === id ? { ...s, notes: editNoteText } : s));
      setEditingId(null);
    } catch (err) {
      alert("Failed to update note.");
    } finally {
      setSavingNote(false);
    }
  }

  // Distribution calculations
  const scanList = Array.isArray(scans) ? scans : [];
  const cropCounts: Record<string, number> = {};
  scanList.forEach((s) => {
    if (s && s.crop) {
      cropCounts[s.crop] = (cropCounts[s.crop] || 0) + 1;
    }
  });

  const cropChartData = Object.entries(cropCounts).map(([name, count]) => ({
    name,
    count,
  }));

  const COLORS = ["#1e6b4d", "#2d8a63", "#43a87c", "#68c499", "#94dcba", "#bfead4"];

  return (
    <section className="page-grid">
      <div className="section-head">
        <div>
          <p className="eyebrow">Agronomic Telemetry</p>
          <h2>Field Scan Analytics & Edit Access</h2>
        </div>
        <button onClick={loadScans} className="button button-light" disabled={loading}>
          <RefreshCw size={16} /> Refresh Records
        </button>
      </div>

      <div className="two-column">
        <div className="card">
          <p className="eyebrow">Volume by Crop</p>
          <h3>Scanned Crop Breakdown</h3>
          <div style={{ height: "260px", marginTop: "16px" }}>
            {cropChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={cropChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0ece5" />
                  <XAxis dataKey="name" stroke="#5d786a" fontSize={12} />
                  <YAxis stroke="#5d786a" fontSize={12} allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#1e6b4d" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ display: "grid", placeItems: "center", height: "100%", color: "#6b8879" }}>
                No scan data recorded yet.
              </div>
            )}
          </div>
        </div>

        <div className="card">
          <p className="eyebrow">Health Distribution</p>
          <h3>Healthy vs Diseased Crops</h3>
          <div style={{ height: "260px", marginTop: "16px" }}>
            {scanList.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      { name: "Healthy", value: scanList.filter((s) => s.disease && s.disease.toLowerCase() === "healthy").length },
                      { name: "Diseased", value: scanList.filter((s) => s.disease && s.disease.toLowerCase() !== "healthy").length },
                    ]}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label
                  >
                    <Cell fill="#1e6b4d" />
                    <Cell fill="#d9534f" />
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ display: "grid", placeItems: "center", height: "100%", color: "#6b8879" }}>
                No scan data recorded yet.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Audit Log Table with Edit Access */}
      <div className="card">
        <p className="eyebrow">Complete History</p>
        <h3>All Field Observations & Edit Notes</h3>

        {loading ? (
          <div style={{ padding: "40px", textAlign: "center" }}>
            <Loader2 className="animate-spin" size={24} style={{ color: "#1e6b4d", margin: "auto" }} />
          </div>
        ) : scanList.length === 0 ? (
          <p className="muted" style={{ padding: "20px 0" }}>No scans found.</p>
        ) : (
          <div className="table-responsive" style={{ marginTop: "16px" }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Crop</th>
                  <th>Diagnosis</th>
                  <th>Confidence</th>
                  <th>Field Observation Notes</th>
                  <th>Date & Time</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {scanList.map((s) => (
                  <tr key={s.id}>
                    <td><strong>{s.crop}</strong></td>
                    <td>
                      <span className={`status-badge ${s.disease.toLowerCase() === "healthy" ? "healthy" : "danger"}`}>
                        {s.disease}
                      </span>
                    </td>
                    <td>{(s.confidence * 100).toFixed(1)}%</td>
                    <td>
                      {editingId === s.id ? (
                        <div className="notes-edit-box">
                          <input
                            type="text"
                            className="notes-edit-input"
                            value={editNoteText}
                            onChange={(e) => setEditNoteText(e.target.value)}
                            placeholder="Add notes..."
                            autoFocus
                          />
                          <button
                            type="button"
                            className="notes-edit-btn"
                            onClick={() => handleSaveNote(s.id)}
                            disabled={savingNote}
                          >
                            <Save size={13} /> Save
                          </button>
                          <button
                            type="button"
                            className="notes-edit-btn"
                            onClick={() => setEditingId(null)}
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <span>{s.notes || <em style={{ color: "#8ca89a" }}>No notes</em>}</span>
                          <button
                            type="button"
                            onClick={() => startEditNote(s)}
                            className="notes-edit-btn"
                            title="Edit field notes"
                          >
                            <Edit3 size={13} /> Edit
                          </button>
                        </div>
                      )}
                    </td>
                    <td>{new Date(s.createdAt).toLocaleString()}</td>
                    <td>
                      <button
                        onClick={() => handleDelete(s.id)}
                        className="delete-btn"
                        title="Delete scan"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}

export function Assistant({ language = "English", user }: { language?: string; user?: User | null }) {
  const [messages, setMessages] = useState<Array<{ role: "user" | "assistant"; text: string }>>([
    {
      role: "assistant",
      text: "Namaskara! I am the Krishi Drishti Agricultural Assistant. Ask me anything about crop diseases, organic remedies, bio-pesticides, or spray schedules. You can type or click the microphone to speak."
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentLang, setCurrentLang] = useState(language);
  const [isRecording, setIsRecording] = useState(false);
  const [speakingIndex, setSpeakingIndex] = useState<number | null>(null);
  const [speechError, setSpeechError] = useState("");

  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    setCurrentLang(language);
  }, [language]);

  const suggestionChips = [
    "How to treat Tomato Early Blight?",
    "Organic spray for Powdery Mildew",
    "Potato Late Blight prevention",
    "Best fertilizer schedule for vegetables",
  ];

  function toggleSpeechRecognition() {
    if (isRecording) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsRecording(false);
      return;
    }

    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRec) {
      alert("Voice speech recognition is not supported in this browser. Please use Google Chrome or Microsoft Edge.");
      return;
    }

    try {
      const recognition = new SpeechRec();
      recognition.lang = getLanguageLocale(currentLang);
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsRecording(true);
      };

      recognition.onresult = (event: any) => {
        const spoken = event.results[0][0].transcript;
        if (spoken) {
          setInput(spoken);
          // auto-send question
          handleSend(spoken);
        }
      };

      recognition.onerror = (event: any) => {
        console.warn("Speech recognition error:", event.error);
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.error("Failed to start speech recognition:", err);
      setIsRecording(false);
    }
  }

  function toggleMessageSpeech(text: string, idx: number) {
    if (speakingIndex === idx) {
      window.speechSynthesis?.cancel();
      setSpeakingIndex(null);
      return;
    }

    const started = speakText(text, currentLang, () => setSpeakingIndex(null));
    if (!started && currentLang !== "English") {
      setSpeechError(`No native ${getLanguageLocale(currentLang)} voice is available in this browser. Install a ${currentLang} system voice or use a browser with ${currentLang} speech support.`);
    }
    if (started) setSpeakingIndex(idx);
  }

  async function handleSend(queryText?: string) {
    const textToSend = (queryText || input).trim();
    if (!textToSend || loading) return;

    setInput("");
    const newMessages = [...messages, { role: "user" as const, text: textToSend }];
    setMessages(newMessages);
    setLoading(true);

    try {
      const reply = await askAssistant(textToSend, currentLang);
      setMessages([...newMessages, { role: "assistant", text: reply }]);
    } catch (err) {
      setMessages([
        ...newMessages,
        {
          role: "assistant",
          text: "I am having trouble connecting to the agronomic server. Please check your backend connection."
        }
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="assistant-layout">
      <div className="card assistant-card">
        <div className="assistant-heading">
          <span className="icon-box"><MessageCircle size={21} /></span>
          <div>
            <p className="eyebrow">Krishi Drishti Agronomist</p>
            <h2>{t("assistantTitle", currentLang)}</h2>
          </div>
          <div style={{ marginLeft: "auto", display: "flex", gap: "8px", alignItems: "center" }}>
            <select
              value={currentLang}
              onChange={(e) => setCurrentLang(e.target.value)}
              className="lang-select"
            >
              {SUPPORTED_LANGUAGES.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.nativeName} ({lang.label})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="chat-thread">
          {speechError && <div className="form-error" role="status">{speechError}</div>}
          {messages.map((m, idx) => (
            <div key={idx} className={`chat-message ${m.role === "user" ? "user-msg" : "assistant-msg"}`}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <strong>{m.role === "user" ? (user ? user.name : "You") : "Krishi Agronomist"}</strong>
                {m.role === "assistant" && (
                  <button
                    type="button"
                    className={`audio-speaker-btn ${speakingIndex === idx ? "speaking" : ""}`}
                    onClick={() => toggleMessageSpeech(m.text, idx)}
                    title="Listen response aloud"
                  >
                    {speakingIndex === idx ? <VolumeX size={13} /> : <Volume2 size={13} />}
                    {speakingIndex === idx ? "Stop" : "Listen"}
                  </button>
                )}
              </div>
              <div style={{ whiteSpace: "pre-line", marginTop: "4px" }}>{m.text}</div>
            </div>
          ))}
          {loading && (
            <div className="chat-message assistant-msg">
              <Loader2 className="animate-spin" size={16} />
              <span style={{ marginLeft: "8px", color: "#6b8879" }}>Consulting agronomy database...</span>
            </div>
          )}
        </div>

        <div className="chips-row">
          {suggestionChips.map((chip) => (
            <button
              key={chip}
              type="button"
              className="chip-button"
              onClick={() => handleSend(chip)}
              disabled={loading}
            >
              {chip}
            </button>
          ))}
        </div>

        <form
          className="chat-form"
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
        >
          <button
            type="button"
            className={`voice-mic-btn ${isRecording ? "recording" : ""}`}
            onClick={toggleSpeechRecognition}
            title={isRecording ? "Listening... Click to stop" : "Speak your question in Kannada, Hindi, or English"}
          >
            {isRecording ? <MicOff size={18} /> : <Mic size={18} />}
            {isRecording ? "Listening..." : "Voice"}
          </button>

          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`Ask in ${currentLang} (e.g. Tomato early blight treatment)...`}
            disabled={loading}
          />
          <button className="button" type="submit" disabled={loading || !input.trim()}>
            <Send size={17} />
          </button>
        </form>
      </div>

      <div className="card" style={{ height: "fit-content" }}>
        <p className="eyebrow">Field Knowledge</p>
        <h3>Farming Best Practices</h3>
        <ul className="practice-list">
          <li>
            <strong>Scout Early Morning:</strong>
            Check undersides of leaves before morning dew evaporates for early spore detection.
          </li>
          <li>
            <strong>Disinfect Equipment:</strong>
            Clean pruning shears with 70% isopropyl alcohol or bleach to avoid transferring bacterial spot.
          </li>
          <li>
            <strong>Crop Rotation:</strong>
            Never plant Solanaceous crops (Tomato, Potato, Pepper) consecutively in the same soil patch.
          </li>
          <li>
            <strong>Voice Translation Support:</strong>
            Speech-to-text recognition and text-to-speech reading are natively built-in for English, Kannada, and Hindi.
          </li>
        </ul>
      </div>
    </section>
  );
}

export function Weather({ language = "English" }: { language?: string }) {
  const [coordinates, setCoordinates] = useState({ latitude: 12.9716, longitude: 77.5946 });
  const [weather, setWeather] = useState<Awaited<ReturnType<typeof getWeather>> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function loadWeather() {
    setLoading(true);
    setError("");
    try {
      setWeather(await getWeather(coordinates.latitude, coordinates.longitude));
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || "Unable to load weather data.");
    } finally {
      setLoading(false);
    }
  }

  function useCurrentLocation() {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported. Enter farm coordinates manually.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => setCoordinates({ latitude: position.coords.latitude, longitude: position.coords.longitude }),
      () => setError("Location permission was not granted. Enter farm coordinates manually."),
      { enableHighAccuracy: false, timeout: 10000 },
    );
  }

  const current = weather?.data.current;
  const humidity = Number(current?.relative_humidity_2m);
  const temp = Number(current?.temperature_2m);
  const isBlightRisk = Number.isFinite(humidity) && Number.isFinite(temp) && humidity > 75 && temp >= 18 && temp <= 26;
  const isMildewRisk = Number.isFinite(humidity) && Number.isFinite(temp) && humidity > 60 && temp >= 22 && temp <= 30;

  return (
    <section className="page-grid">
      <div className="hero-card">
        <div>
          <p className="eyebrow light">Microclimate & Disease Early Warning</p>
          <h2>Weather-Driven Plant Health</h2>
          <p>
            Fungal and bacterial pathogenesis correlates strongly with ambient humidity and leaf moisture duration.
          </p>
        </div>
        <CloudSun size={80} strokeWidth={1.2} />
      </div>

      <div className="two-column">
        <div className="card">
          <div className="section-head">
            <div>
              <p className="eyebrow">Open-Meteo Field Data</p>
              <h3>{t("weatherHeading", language)}</h3>
            </div>
          </div>

          <div style={{ marginTop: "20px", display: "grid", gap: "12px" }}>
            <div className="coordinate-row">
              <label>{t("latitude", language)} <input type="number" step="any" value={coordinates.latitude} onChange={(e) => setCoordinates({ ...coordinates, latitude: Number(e.target.value) })} /></label>
              <label>{t("longitude", language)} <input type="number" step="any" value={coordinates.longitude} onChange={(e) => setCoordinates({ ...coordinates, longitude: Number(e.target.value) })} /></label>
            </div>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              <button type="button" className="button" onClick={loadWeather} disabled={loading}>{loading ? "..." : t("loadLiveWeather", language)}</button>
              <button type="button" className="button button-light" onClick={useCurrentLocation}>{t("useMyLocation", language)}</button>
            </div>
            {error && <div className="error-box"><AlertTriangle size={18} /><span>{error}</span></div>}
            {current ? (
              <div className="weather-metrics">
                <strong>{current.temperature_2m}°C</strong>
                <span>{t("humidity", language)} {current.relative_humidity_2m}%</span>
                <span>Dew point {current.dew_point_2m ?? Math.round(Number(current.temperature_2m) - ((100 - Number(current.relative_humidity_2m)) / 5))}°C</span>
                <span>{t("precipitation", language)} {current.precipitation} mm</span>
                <span>{t("windSpeed", language)} {current.wind_speed_10m} km/h</span>
                <small style={{ width: "100%", color: "#6b8879" }}>
                  Source: {weather?.source} · Retrieved {weather ? new Date(weather.fetchedAt).toLocaleString() : ""}
                </small>
              </div>
            ) : <p className="muted">Load weather for a selected farm coordinate. No weather values are assumed.</p>}
          </div>
        </div>

        <div className="card">
          <p className="eyebrow">Rule-based Environmental Assessment</p>
          <h3>Active Pathogen Warnings</h3>

          <div style={{ marginTop: "16px", display: "grid", gap: "12px" }}>
            <div className={`risk-banner ${isBlightRisk ? "high" : "low"}`}>
              <ShieldAlert size={20} />
              <div>
                <strong>{t("lateBlightRisk", language)}: {current ? (isBlightRisk ? "HIGH" : "LOW") : "Unavailable"}</strong>
                <p style={{ margin: "2px 0 0", fontSize: "12px" }}>
                  {isBlightRisk
                    ? "Warm temperatures combined with high humidity are environmental conditions associated with late blight risk; this is not a disease diagnosis."
                    : current ? "Current conditions are below this screening rule; continue field scouting." : "Load weather data to evaluate this screening rule."}
                </p>
              </div>
            </div>

            <div className={`risk-banner ${isMildewRisk ? "high" : "low"}`}>
              <AlertTriangle size={20} />
              <div>
                <strong>{t("powderyMildewRisk", language)}: {current ? (isMildewRisk ? "MODERATE-HIGH" : "LOW") : "Unavailable"}</strong>
                <p style={{ margin: "2px 0 0", fontSize: "12px" }}>
                  {isMildewRisk
                    ? "Moderate warmth and elevated moisture match this environmental screening rule; this is not a disease diagnosis."
                    : current ? "Current conditions are below this screening rule; continue field scouting." : "Load weather data to evaluate this screening rule."}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function SettingsPage({ language = "English", onLanguageChange }: { language?: string; onLanguageChange?: (lang: string) => void }) {
  const [healthStatus, setHealthStatus] = useState<string>("Click 'Test Connection' to check");
  const [latency, setLatency] = useState<number | null>(null);
  const [checking, setChecking] = useState(false);
  const [testAudioStatus, setTestAudioStatus] = useState<string>("");

  async function pingApi() {
    setChecking(true);
    const start = performance.now();
    try {
      const res = await checkApiHealth();
      const end = performance.now();
      setLatency(Math.round(end - start));
      setHealthStatus(`Connected: ${res.service} (${res.runtime || "Node.js TypeScript"})`);
    } catch (err: any) {
      setHealthStatus(`Failed: ${err.message}`);
      setLatency(null);
    } finally {
      setChecking(false);
    }
  }

  function handleTestAudio() {
    setTestAudioStatus("Speaking audio...");
    const phrases: Record<string, string> = {
      English: "Krishi Drishti crop vision and speech engine is operational.",
      Kannada: "ಕೃಷಿ ದೃಷ್ಟಿ ಧ್ವನಿ ಮತ್ತು ಬೆಳೆ ರೋಗ ಪತ್ತೆ ವ್ಯವಸ್ಥೆ ಸಿದ್ಧವಾಗಿದೆ.",
      Telugu: "కృషి దృష్టి వాయిస్ మరియు పంట వ్యాధి నిర్ధారణ వ్యవస్థ సిద్ధంగా ఉంది.",
      Tamil: "கிருஷி திருஷ்டி குரல் மற்றும் பயிர் நோய் கண்டறிதல் அமைப்பு தயாராக உள்ளது.",
      Malayalam: "കൃഷി ദൃഷ്ടി വോയ്‌സ്, വിള രോഗനിർണ്ണയ സംവിധാനം തയ്യാറാണ്.",
      Hindi: "कृषि दृष्टि फसल रोग पहचान और आवाज प्रणाली तैयार है।"
    };
    const phrase = phrases[language] || phrases.English;
    speakText(phrase, language, () => setTestAudioStatus("Audio playback complete."));
  }

  return (
    <section className="page-grid">
      <div className="card settings-card">
        <p className="eyebrow">Workspace Configuration</p>
        <h2>Preferences & Engine Status</h2>

        <label>
          Display & Voice Language
          <select
            value={language}
            onChange={(e) => onLanguageChange && onLanguageChange(e.target.value)}
          >
            {SUPPORTED_LANGUAGES.map((lang) => (
              <option key={lang.code} value={lang.code}>
                {lang.nativeName} ({lang.label})
              </option>
            ))}
          </select>
        </label>

        <div style={{ marginTop: "14px", display: "flex", alignItems: "center", gap: "10px" }}>
          <button type="button" onClick={handleTestAudio} className="audio-speaker-btn">
            <Volume2 size={16} /> Test Voice Audio
          </button>
          {testAudioStatus && <small style={{ color: "#1a5e42" }}>{testAudioStatus}</small>}
        </div>

        <label style={{ marginTop: "20px" }}>
          Backend API Root
          <input value={apiBaseUrl} readOnly />
        </label>

        <div style={{ marginTop: "12px", display: "flex", alignItems: "center", gap: "14px" }}>
          <button type="button" onClick={pingApi} className="button" disabled={checking}>
            {checking ? <Loader2 className="animate-spin" size={16} /> : <RefreshCw size={16} />}
            Test Connection
          </button>
          <div style={{ fontSize: "13px" }}>
            <strong>{healthStatus}</strong>
            {latency !== null && <span style={{ color: "#286b4d", marginLeft: "8px" }}>({latency} ms)</span>}
          </div>
        </div>

        <div className="info-box" style={{ marginTop: "24px" }}>
          <ShieldCheck size={18} />
          <span>
            The backend is completely powered by <strong>Node.js & TypeScript</strong> with native <strong>ONNX Runtime</strong>, PostgreSQL persistence, and browser-native Web Speech API for zero-cost multi-lingual voice translation.
          </span>
        </div>
      </div>
    </section>
  );
}
