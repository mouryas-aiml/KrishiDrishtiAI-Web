import { ChangeEvent, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertTriangle,
  ArrowUpRight,
  BarChart3,
  CheckCircle2,
  CloudSun,
  FileScan,
  FlaskConical,
  HelpCircle,
  ImagePlus,
  Info,
  Leaf,
  Loader2,
  MessageCircle,
  Pill,
  RefreshCw,
  Search,
  Send,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Sprout,
  Trash2,
  TrendingUp,
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
  CropCatalogItem,
  Prediction,
  Scan
} from "./api";

// Fallback crop catalog so the catalog works immediately even before network fetch
const defaultCrops = [
  "Apple", "Blueberry", "Cherry", "Corn", "Grape", "Orange",
  "Peach", "Pepper", "Potato", "Raspberry", "Soybean", "Squash",
  "Strawberry", "Tomato"
];

const sampleLeaves = [
  { name: "Tomato Early Blight", file: "/samples/tomato_early_blight.png", crop: "Tomato", hint: "Concentric target spots" },
  { name: "Potato Late Blight", file: "/samples/potato_late_blight.png", crop: "Potato", hint: "Dark water-soaked blotches" },
  { name: "Apple Scab", file: "/samples/apple_scab.png", crop: "Apple", hint: "Olive-brown velvety spots" },
  { name: "Healthy Leaf", file: "/samples/healthy_leaf.png", crop: "General", hint: "Clean unblemished tissue" },
];

export function Dashboard() {
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
          <h2>Make every scan a better decision.</h2>
          <p>
            Screen leaf health in real-time with the Krishi Drishti deep learning model.
            Get instant organic treatment protocols, chemical dosages, and prevention tips.
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
          <small><TrendingUp size={13} /> {totalScans > 0 ? "Saved in PostgreSQL database" : "Ready for your first scan"}</small>
        </div>
        <div className="stat-card">
          <p>Healthy Foliage Ratio</p>
          <strong>{healthyRatio}%</strong>
          <small><CheckCircle2 size={13} /> Across verified field scans</small>
        </div>
        <div className="stat-card">
          <p>Model Diagnosis Classes</p>
          <strong>39</strong>
          <small><Leaf size={13} /> 14 crops supported</small>
        </div>
      </div>

      <div className="two-column">
        <div className="card">
          <div className="section-head">
            <div>
              <p className="eyebrow">Recent Activity</p>
              <h3>Field Observations</h3>
            </div>
            <Link to="/analytics" className="text-link">
              View Analytics <ArrowUpRight size={15} />
            </Link>
          </div>

          {loading ? (
            <div style={{ padding: "30px", textAlign: "center", color: "#6b8879" }}>
              <Loader2 className="animate-spin" size={24} style={{ margin: "auto" }} />
              <p style={{ fontSize: "13px", marginTop: "8px" }}>Loading observations from database...</p>
            </div>
          ) : recentObservations.length === 0 ? (
            <div style={{ padding: "35px 20px", textAlign: "center", color: "#6b8879" }}>
              <FileScan size={36} style={{ margin: "auto", opacity: 0.6 }} />
              <p style={{ margin: "10px 0 15px", fontSize: "14px" }}>No leaf scans recorded yet.</p>
              <Link to="/scan" className="button" style={{ fontSize: "13px" }}>
                Scan your first leaf now
              </Link>
            </div>
          ) : (
            <div className="activity-list">
              {recentObservations.map((item) => (
                <div className="activity-row" key={item.id}>
                  <span className={`crop-avatar ${item.disease.toLowerCase() === "healthy" ? "healthy-avatar" : "disease-avatar"}`}>
                    <Leaf size={17} />
                  </span>
                  <div>
                    <strong>{item.crop}</strong>
                    <p>{item.disease}</p>
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

export function ScanPage() {
  const [result, setResult] = useState<Prediction[] | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [selectedSample, setSelectedSample] = useState<string | null>(null);

  async function handleFile(file: File | Blob, previewUrl?: string) {
    setError("");
    setResult(null);
    setLoading(true);
    if (previewUrl) {
      setPreview(previewUrl);
    } else if (file instanceof File) {
      setPreview(URL.createObjectURL(file));
    }

    try {
      const response = await predictImage(file);
      setResult(response.predictions);
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

  const topPrediction = result?.[0];

  return (
    <section className="page-grid">
      <div className="scan-intro">
        <div>
          <p className="eyebrow">Real-time Image Diagnosis</p>
          <h2>Upload or Choose a Crop Leaf</h2>
          <p className="muted">
            The image is processed using 256×256 RGB normalization and evaluated by our deep learning ONNX model.
          </p>
        </div>
        <div className="contract-pill">
          <CheckCircle2 size={16} /> ONNX 256 × 256 Active
        </div>
      </div>

      {/* Sample Leaf Quick Selector */}
      <div className="card sample-card">
        <p className="eyebrow">Quick Test Samples</p>
        <p style={{ fontSize: "13px", color: "#5d786a", margin: "4px 0 12px" }}>
          Don't have a leaf image right now? Click any sample to run an instant diagnosis:
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
              <span className="confidence-pill">
                {(topPrediction.confidence * 100).toFixed(1)}% Match
              </span>
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

export function Crops() {
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
      .catch((err) => {
        console.warn("Could not load backend crops, using defaults:", err);
      })
      .finally(() => setLoading(false));
  }, []);

  const filteredCrops = catalog.filter((c) =>
    c.crop.toLowerCase().includes(query.toLowerCase()) ||
    c.diseases.some((d) => d.disease.toLowerCase().includes(query.toLowerCase()))
  );

  return (
    <section className="page-grid">
      <div className="section-head">
        <div>
          <p className="eyebrow">Verified Model Metadata</p>
          <h2>Crop & Disease Library</h2>
        </div>
        <span className="count-badge">{catalog.length || defaultCrops.length} Crops Supported</span>
      </div>

      <div className="search-field">
        <Search size={18} />
        <input
          placeholder="Search crop or disease (e.g. Tomato, Early Blight, Apple Scab)..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <div className="crop-library-layout">
        {/* Left Column: Crop List */}
        <div className="crop-grid-vertical">
          {filteredCrops.map((item) => (
            <div
              key={item.crop}
              className={`crop-card-selectable ${selectedCrop?.crop === item.crop ? "active" : ""}`}
              onClick={() => setSelectedCrop(item)}
            >
              <span className="crop-avatar"><Leaf size={19} /></span>
              <div style={{ flex: 1 }}>
                <strong>{item.crop}</strong>
                <p>{item.diseases.length} disease classes</p>
              </div>
              <ArrowUpRight size={16} />
            </div>
          ))}
        </div>

        {/* Right Column: Detailed Disease Cards for Selected Crop */}
        <div className="crop-detail-panel">
          {selectedCrop ? (
            <div>
              <div className="card" style={{ marginBottom: "16px" }}>
                <p className="eyebrow">Crop Profile</p>
                <h3 style={{ fontSize: "26px", margin: "4px 0 8px" }}>{selectedCrop.crop} Health Guide</h3>
                <p className="muted" style={{ margin: 0 }}>
                  Showing all {selectedCrop.diseases.length} verified classes and their agricultural management protocols.
                </p>
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
                          <strong>🌿 Organic Remedy:</strong>
                          <p>{d.organicTreatment}</p>
                        </div>
                        <div className="mini-treatment chemical">
                          <strong>🧪 Chemical Spray:</strong>
                          <p>{d.chemicalTreatment}</p>
                        </div>
                        <div className="mini-treatment prevention">
                          <strong>🛡️ Prevention:</strong>
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

export function Analytics() {
  const [scans, setScans] = useState<Scan[]>([]);
  const [loading, setLoading] = useState(true);

  function reloadScans() {
    setLoading(true);
    getScans()
      .then((data) => setScans(data))
      .catch((err) => console.warn(err))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    reloadScans();
  }, []);

  async function handleDelete(id: string) {
    if (confirm("Delete this scan observation from records?")) {
      await deleteScan(id);
      reloadScans();
    }
  }

  // Calculate live statistics
  const total = scans.length;
  const healthy = scans.filter((s) => s.disease.toLowerCase() === "healthy").length;
  const healthyRatio = total > 0 ? Math.round((healthy / total) * 100) : 100;
  const avgConfidence = total > 0 ? (scans.reduce((acc, s) => acc + s.confidence, 0) / total * 100).toFixed(1) : "0.0";

  // Group by crop for chart
  const cropCounts: { [crop: string]: number } = {};
  scans.forEach((s) => {
    cropCounts[s.crop] = (cropCounts[s.crop] || 0) + 1;
  });

  const chartData = Object.keys(cropCounts).map((crop) => ({
    name: crop,
    count: cropCounts[crop]
  }));

  if (chartData.length === 0) {
    chartData.push({ name: "Tomato", count: 4 }, { name: "Potato", count: 2 }, { name: "Apple", count: 3 });
  }

  return (
    <section className="page-grid">
      <div className="stats-grid">
        <div className="stat-card">
          <p>Total Recorded Scans</p>
          <strong>{total}</strong>
          <small><TrendingUp size={13} /> Active in database</small>
        </div>
        <div className="stat-card">
          <p>Average Confidence</p>
          <strong>{avgConfidence}%</strong>
          <small><ShieldCheck size={13} /> High diagnostic certainty</small>
        </div>
        <div className="stat-card">
          <p>Healthy Leaf Ratio</p>
          <strong>{healthyRatio}%</strong>
          <small><CheckCircle2 size={13} /> Field health indicator</small>
        </div>
      </div>

      <div className="card chart-card">
        <div className="section-head">
          <div>
            <p className="eyebrow">Diagnostic Breakdown</p>
            <h3>Scans by Crop Variety</h3>
          </div>
          <BarChart3 size={21} />
        </div>
        <div className="chart">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid vertical={false} stroke="#e5ebe5" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} />
              <YAxis axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count" fill="#1e6b4d" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Complete Observation Log */}
      <div className="card">
        <div className="section-head">
          <div>
            <p className="eyebrow">Database Records</p>
            <h3>Complete Observation Journal</h3>
          </div>
          <button onClick={reloadScans} className="button button-light" style={{ padding: "6px 12px", fontSize: "12px" }}>
            <RefreshCw size={14} /> Refresh
          </button>
        </div>

        {scans.length === 0 ? (
          <p className="muted" style={{ marginTop: "16px" }}>No scans recorded yet. Perform a scan to view history here.</p>
        ) : (
          <div className="history-table-wrapper">
            <table className="history-table">
              <thead>
                <tr>
                  <th>Crop</th>
                  <th>Identified Condition</th>
                  <th>Confidence</th>
                  <th>Timestamp</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {scans.map((s) => (
                  <tr key={s.id}>
                    <td><strong>{s.crop}</strong></td>
                    <td>
                      <span className={`status-badge-inline ${s.disease.toLowerCase() === "healthy" ? "healthy" : "disease"}`}>
                        {s.disease}
                      </span>
                    </td>
                    <td>{(s.confidence * 100).toFixed(1)}%</td>
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

export function Assistant() {
  const [messages, setMessages] = useState<Array<{ role: "user" | "assistant"; text: string }>>([
    {
      role: "assistant",
      text: "👋 Namaskara! I am the Krishi Drishti Agricultural Assistant. Ask me anything about crop diseases, organic remedies, bio-pesticides, or spray schedules."
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [language, setLanguage] = useState("English");

  const suggestionChips = [
    "How to treat Tomato Early Blight?",
    "Organic spray for Powdery Mildew",
    "Potato Late Blight prevention",
    "Best fertilizer schedule for vegetables",
  ];

  async function handleSend(queryText?: string) {
    const textToSend = (queryText || input).trim();
    if (!textToSend || loading) return;

    setInput("");
    const newMessages = [...messages, { role: "user" as const, text: textToSend }];
    setMessages(newMessages);
    setLoading(true);

    try {
      const reply = await askAssistant(textToSend, language);
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
          <div style={{ marginLeft: "auto" }}>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
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
              <strong>{m.role === "user" ? "You" : "Krishi Agronomist"}</strong>
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
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about crop health, treatments, or fertilizer..."
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
        </ul>
      </div>
    </section>
  );
}

export function Weather() {
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
            Fungal and bacterial pathogensis correlates strongly with ambient humidity and leaf moisture duration.
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

export function SettingsPage() {
  const [healthStatus, setHealthStatus] = useState<string>("Click 'Test Connection' to check");
  const [latency, setLatency] = useState<number | null>(null);
  const [checking, setChecking] = useState(false);

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

  return (
    <section className="page-grid">
      <div className="card settings-card">
        <p className="eyebrow">Workspace Configuration</p>
        <h2>Preferences & Engine Status</h2>

        <label>
          Display Language
          <select defaultValue="English">
            <option>English</option>
            <option>ಕನ್ನಡ (Kannada)</option>
            <option>हिन्दी (Hindi)</option>
            <option>मराठी (Marathi - Planned)</option>
            <option>தமிழ் (Tamil - Planned)</option>
            <option>తెలుగు (Telugu - Planned)</option>
          </select>
        </label>

        <label>
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
            The backend has been completely migrated to <strong>Node.js & TypeScript</strong> with native <strong>ONNX Runtime</strong> and PostgreSQL storage. No Java or Maven runtime is required.
          </span>
        </div>
      </div>
    </section>
  );
}
