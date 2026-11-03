import { ChangeEvent, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertTriangle,
  ArrowUpRight,
  BarChart3,
  CheckCircle2,
  CloudSun,
  Edit3,
  FileScan,
  FlaskConical,
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
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import {
  apiBaseUrl,
  askAssistant,
  checkApiHealth,
  deleteScan,
  getCrops,
  getScans,
  predictImage,
  updateScanNotes,
  CropCatalogItem,
  Prediction,
  Scan,
  User
} from "./api";

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

// Speech Helper Utilities
function getLanguageLocale(language: string): string {
  if (language.toLowerCase().includes("kan")) return "kn-IN";
  if (language.toLowerCase().includes("hin")) return "hi-IN";
  return "en-IN";
}

function speakText(text: string, language: string = "English", onEnd?: () => void): boolean {
  if (!("speechSynthesis" in window)) {
    alert("Speech synthesis is not supported on this browser.");
    return false;
  }
  window.speechSynthesis.cancel();
  const clean = text.replace(/[#*`_\[\]]/g, " ").trim();
  const utterance = new SpeechSynthesisUtterance(clean);
  utterance.lang = getLanguageLocale(language);
  utterance.rate = 0.95;
  if (onEnd) utterance.onend = onEnd;
  window.speechSynthesis.speak(utterance);
  return true;
}

export function Dashboard({ language = "English", user }: { language?: string; user?: User | null }) {
  const [scans, setScans] = useState<Scan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getScans()
      .then((data) => setScans(data))
      .catch((err) => console.warn("Failed to load recent scans:", err))
      .finally(() => setLoading(false));
  }, []);

  const totalScans = scans.length;
  const healthyCount = scans.filter((s) => s.disease.toLowerCase() === "healthy").length;
  const healthyRatio = totalScans > 0 ? Math.round((healthyCount / totalScans) * 100) : 100;
  const recentObservations = scans.slice(0, 5);

  return (
    <section className="page-grid">
      <div className="hero-card">
        <div>
          <p className="eyebrow light">AI Crop Health Workspace</p>
          <h2>{user ? `Welcome back, ${user.name}` : "Make every scan a better decision."}</h2>
          <p>
            Screen leaf health in real-time with the Krishi Drishti deep learning model.
            Get instant organic treatment protocols, chemical dosages, and voice assistance.
          </p>
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            <Link className="button button-light" to="/scan">
              Start a leaf scan <ArrowUpRight size={17} />
            </Link>
            <Link className="button" style={{ background: "rgba(255,255,255,0.15)", color: "#fff" }} to="/assistant">
              Ask AI Doctor <Sparkles size={16} />
            </Link>
          </div>
        </div>
        <div className="hero-illustration">
          <Sprout size={88} strokeWidth={1.2} />
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <p>Total Scans Recorded</p>
          <strong>{totalScans}</strong>
          <span>PostgreSQL Active</span>
        </div>
        <div className="stat-card">
          <p>Healthy Tissue Ratio</p>
          <strong>{healthyRatio}%</strong>
          <span>{healthyCount} healthy scans</span>
        </div>
        <div className="stat-card">
          <p>Model Engine</p>
          <strong>ONNX 224</strong>
          <span>MobileNet / ResNet</span>
        </div>
        <div className="stat-card">
          <p>Language & Voice</p>
          <strong>{language}</strong>
          <span>Speech Enabled</span>
        </div>
      </div>

      <div className="two-column">
        <div className="card">
          <div className="section-head">
            <div>
              <p className="eyebrow">Audit Stream</p>
              <h3>Recent Field Diagnoses</h3>
            </div>
            <Link to="/analytics" className="text-link">
              View all <ArrowUpRight size={15} />
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

  async function handleFile(file: File | Blob, previewUrl?: string) {
    setError("");
    setResult(null);
    setSavedScan(null);
    setLoading(true);
    if (previewUrl) {
      setPreview(previewUrl);
    } else if (file instanceof File) {
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
      window.speechSynthesis?.cancel();
      setSpeaking(false);
      return;
    }
    if (!result || result.length === 0) return;
    const top = result[0];
    const textToRead = top.isHealthy
      ? `${top.crop} leaf is healthy. High vitality detected with ${(top.confidence * 100).toFixed(0)} percent confidence.`
      : `${top.crop} plant affected by ${top.disease}. Severity is ${top.severity}. Symptoms: ${top.symptoms}. Recommended organic treatment: ${top.organicTreatment}.`;

    const started = speakText(textToRead, language, () => setSpeaking(false));
    if (started) setSpeaking(true);
  }

  const topPrediction = result?.[0];

  return (
    <section className="page-grid">
      <div className="scan-intro">
        <div>
          <p className="eyebrow">Real-time Image Diagnosis</p>
          <h2>Upload or Choose a Crop Leaf</h2>
          <p className="muted">
            The image is normalized to 224x224 RGB and evaluated by our ONNX 39-class crop vision model.
          </p>
        </div>
        <div className="contract-pill">
          <CheckCircle2 size={16} /> ONNX 224x224 Model Active
        </div>
      </div>

      {/* Field Notes Input */}
      <div className="card" style={{ padding: "14px 20px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
          <Edit3 size={17} style={{ color: "#1a5e42" }} />
          <strong>Field Notes / Observation:</strong>
          <input
            type="text"
            className="form-input"
            style={{ flex: 1, minWidth: "220px", padding: "8px 12px" }}
            placeholder="e.g. Plot North-B, row 3, 20% leaf coverage affected"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>
      </div>

      {/* Sample Leaf Quick Selector */}
      <div className="card sample-card">
        <p className="eyebrow">Verified Test Leaves</p>
        <p style={{ fontSize: "13px", color: "#5d786a", margin: "4px 0 12px" }}>
          Click any verified field sample below to run an instant diagnosis:
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
            <strong>{loading ? "Analyzing leaf tissue..." : "Choose or drag a leaf photograph"}</strong>
            <span>Supports PNG, JPG, JPEG · Clear, centered single leaf</span>
          </>
        )}
        <input type="file" accept="image/png,image/jpeg,image/webp" onChange={onFileInput} disabled={loading} />
      </label>

      {loading && (
        <div className="card loading-card">
          <Loader2 className="animate-spin" size={28} style={{ color: "#1e6b4d", margin: "auto" }} />
          <strong style={{ display: "block", marginTop: "12px", fontSize: "16px" }}>Evaluating with Crop Vision AI...</strong>
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
                {topPrediction.isHealthy ? "Healthy Foliage" : `${topPrediction.severity.toUpperCase()} SEVERITY`}
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
                  {speaking ? "Stop Audio" : "Listen Advice"}
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
              <strong>Observed Symptoms:</strong> {topPrediction.symptoms}
            </p>

            {/* Actionable Treatment Protocols */}
            {!topPrediction.isHealthy && (
              <div className="treatment-grid">
                <div className="treatment-card organic">
                  <div className="treatment-head">
                    <Leaf size={18} />
                    <strong>Organic & Bio-Control</strong>
                  </div>
                  <p>{topPrediction.organicTreatment}</p>
                </div>

                <div className="treatment-card chemical">
                  <div className="treatment-head">
                    <FlaskConical size={18} />
                    <strong>Chemical Treatment</strong>
                  </div>
                  <p>{topPrediction.chemicalTreatment}</p>
                </div>

                <div className="treatment-card prevention">
                  <div className="treatment-head">
                    <ShieldCheck size={18} />
                    <strong>Prevention Practice</strong>
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

export function Crops({ language = "English" }: { language?: string }) {
  const [catalog, setCatalog] = useState<CropCatalogItem[]>([]);
  const [query, setQuery] = useState("");
  const [selectedCrop, setSelectedCrop] = useState<CropCatalogItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCrops()
      .then((data) => {
        setCatalog(data);
        if (data.length > 0) setSelectedCrop(data[0]);
      })
      .catch(() => {
        const dummy: CropCatalogItem[] = defaultCrops.map(name => ({
          crop: name,
          totalClasses: 3,
          diseases: [
            {
              disease: "Healthy",
              isHealthy: true,
              severity: "low",
              symptoms: "Normal color and vigor.",
              organicTreatment: "Regular watering.",
              chemicalTreatment: "None.",
              prevention: "Standard fertilization."
            }
          ]
        }));
        setCatalog(dummy);
        setSelectedCrop(dummy[0]);
      })
      .finally(() => setLoading(false));
  }, []);

  const filteredCrops = catalog.filter((c) =>
    c.crop.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <section className="page-grid">
      <div className="crop-library-layout">
        <div className="crop-nav-panel">
          <div className="search-bar">
            <Search size={16} />
            <input
              type="text"
              placeholder="Search crop (e.g. Tomato)..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>

          <div className="crop-grid-vertical">
            {filteredCrops.map((c) => (
              <button
                key={c.crop}
                className={`crop-nav-item ${selectedCrop?.crop === c.crop ? "active" : ""}`}
                onClick={() => setSelectedCrop(c)}
              >
                <div>
                  <strong>{c.crop}</strong>
                  <small>{c.diseases?.length || 0} classes</small>
                </div>
                <ArrowUpRight size={15} />
              </button>
            ))}
          </div>
        </div>

        <div className="crop-details-panel">
          {selectedCrop ? (
            <div>
              <div className="card crop-header-card">
                <div>
                  <p className="eyebrow">Species Profile</p>
                  <h2>{selectedCrop.crop} Health Guide</h2>
                  <p className="muted">
                    Displaying symptoms, organic and chemical controls for {selectedCrop.diseases.length} condition(s).
                  </p>
                </div>
              </div>

              <div className="disease-cards-stack">
                {selectedCrop.diseases.map((d) => (
                  <div key={d.disease} className="card disease-detail-card">
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <h4>{d.disease}</h4>
                      <span className={`status-badge ${d.isHealthy ? "healthy" : d.severity}`}>
                        {d.isHealthy ? "Healthy" : `${d.severity.toUpperCase()}`}
                      </span>
                    </div>

                    <p className="disease-symptom-text">
                      <strong>Symptoms:</strong> {d.symptoms}
                    </p>

                    {!d.isHealthy && (
                      <div className="treatment-mini-grid">
                        <div className="mini-treatment organic">
                          <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
                            <Leaf size={15} />
                            <strong>Organic Remedy:</strong>
                          </div>
                          <p>{d.organicTreatment}</p>
                        </div>
                        <div className="mini-treatment chemical">
                          <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
                            <FlaskConical size={15} />
                            <strong>Chemical Spray:</strong>
                          </div>
                          <p>{d.chemicalTreatment}</p>
                        </div>
                        <div className="mini-treatment prevention">
                          <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
                            <ShieldCheck size={15} />
                            <strong>Prevention:</strong>
                          </div>
                          <p>{d.prevention}</p>
                        </div>
                      </div>
                    )}
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
  const cropCounts: Record<string, number> = {};
  scans.forEach((s) => {
    cropCounts[s.crop] = (cropCounts[s.crop] || 0) + 1;
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
            {scans.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      { name: "Healthy", value: scans.filter((s) => s.disease.toLowerCase() === "healthy").length },
                      { name: "Diseased", value: scans.filter((s) => s.disease.toLowerCase() !== "healthy").length },
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
        ) : scans.length === 0 ? (
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
                {scans.map((s) => (
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
            <h2>AI Crop Advisory Chat</h2>
          </div>
          <div style={{ marginLeft: "auto", display: "flex", gap: "8px", alignItems: "center" }}>
            <select
              value={currentLang}
              onChange={(e) => setCurrentLang(e.target.value)}
              className="lang-select"
            >
              <option value="English">English</option>
              <option value="Kannada">ಕನ್ನಡ</option>
              <option value="Hindi">हिन्दी</option>
            </select>
          </div>
        </div>

        <div className="chat-thread">
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
  const [humidity, setHumidity] = useState(82);
  const [temp, setTemp] = useState(24);

  const isBlightRisk = humidity > 75 && temp >= 18 && temp <= 26;
  const isMildewRisk = humidity > 60 && temp >= 22 && temp <= 30;

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
              <p className="eyebrow">Interactive Simulation</p>
              <h3>Current Field Weather Conditions</h3>
            </div>
          </div>

          <div style={{ marginTop: "20px", display: "grid", gap: "20px" }}>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                <strong>Relative Humidity: {humidity}%</strong>
                <span>{humidity > 75 ? "High (Fungal Risk)" : "Moderate"}</span>
              </div>
              <input
                type="range"
                min="30"
                max="100"
                value={humidity}
                onChange={(e) => setHumidity(Number(e.target.value))}
                style={{ width: "100%" }}
              />
            </div>

            <div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                <strong>Field Temperature: {temp}°C</strong>
                <span>{temp >= 20 && temp <= 28 ? "Optimal for Crop & Spores" : "Cool / Hot"}</span>
              </div>
              <input
                type="range"
                min="10"
                max="40"
                value={temp}
                onChange={(e) => setTemp(Number(e.target.value))}
                style={{ width: "100%" }}
              />
            </div>
          </div>
        </div>

        <div className="card">
          <p className="eyebrow">Calculated Disease Risk</p>
          <h3>Active Pathogen Warnings</h3>

          <div style={{ marginTop: "16px", display: "grid", gap: "12px" }}>
            <div className={`risk-banner ${isBlightRisk ? "high" : "low"}`}>
              <ShieldAlert size={20} />
              <div>
                <strong>Tomato & Potato Late Blight Risk: {isBlightRisk ? "HIGH" : "LOW"}</strong>
                <p style={{ margin: "2px 0 0", fontSize: "12px" }}>
                  {isBlightRisk
                    ? "Warm temperatures combined with high humidity create peak conditions for Phytophthora infestans."
                    : "Conditions are suboptimal for late blight spore formation."}
                </p>
              </div>
            </div>

            <div className={`risk-banner ${isMildewRisk ? "high" : "low"}`}>
              <AlertTriangle size={20} />
              <div>
                <strong>Powdery Mildew Risk: {isMildewRisk ? "MODERATE-HIGH" : "LOW"}</strong>
                <p style={{ margin: "2px 0 0", fontSize: "12px" }}>
                  {isMildewRisk
                    ? "Moderate warmth and elevated moisture favor conidial sporulation across squash, grape, and cherry."
                    : "Low risk of powdery mildew transmission."}
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
            <option value="English">English</option>
            <option value="Kannada">ಕನ್ನಡ (Kannada)</option>
            <option value="Hindi">हिन्दी (Hindi)</option>
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
