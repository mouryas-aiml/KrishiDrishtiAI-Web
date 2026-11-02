import { ChangeEvent, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, BarChart3, CheckCircle2, FileScan, ImagePlus, Leaf, MessageCircle, Search, Send, ShieldCheck, Sprout, TrendingUp } from "lucide-react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { apiBaseUrl, getApiConfigurationError, predictImage, Prediction } from "./api";

const crops = ["Apple", "Blueberry", "Cherry", "Corn", "Grape", "Orange", "Peach", "Pepper", "Potato", "Raspberry", "Soybean", "Squash", "Strawberry", "Tomato"];
const activity = [{ crop: "Tomato", disease: "Early blight", confidence: "94.2%", date: "Today, 09:42" }, { crop: "Grape", disease: "Healthy", confidence: "91.8%", date: "Yesterday, 16:20" }, { crop: "Potato", disease: "Late blight", confidence: "88.4%", date: "12 Mar, 11:05" }];
const chartData = [{ name: "Mon", scans: 4 }, { name: "Tue", scans: 7 }, { name: "Wed", scans: 5 }, { name: "Thu", scans: 9 }, { name: "Fri", scans: 6 }, { name: "Sat", scans: 11 }, { name: "Sun", scans: 8 }];

export function Dashboard() {
  return <section className="page-grid"><div className="hero-card"><div><p className="eyebrow light">AI crop health workspace</p><h2>Make every scan a better decision.</h2><p>Screen leaf health with the preserved Krishi Drishti model and keep your field observations organized.</p><Link className="button button-light" to="/scan">Start a scan <ArrowUpRight size={17} /></Link></div><div className="hero-illustration"><Sprout size={82} strokeWidth={1.1} /></div></div><div className="stats-grid"><Stat label="Total scans" value="128" note="+18% this month" /><Stat label="Healthy leaves" value="74%" note="Across recent scans" /><Stat label="Model classes" value="39" note="Verified output labels" /></div><div className="two-column"><div className="card"><div className="section-head"><div><p className="eyebrow">Recent activity</p><h3>Latest observations</h3></div><Link to="/analytics" className="text-link">View analytics <ArrowUpRight size={15} /></Link></div><div className="activity-list">{activity.map((item) => <div className="activity-row" key={`${item.crop}-${item.date}`}><span className="crop-avatar"><Leaf size={17} /></span><div><strong>{item.crop}</strong><p>{item.disease}</p></div><div className="activity-meta"><strong>{item.confidence}</strong><small>{item.date}</small></div></div>)}</div></div><div className="card insight-card"><div className="icon-box"><ShieldCheck size={20} /></div><p className="eyebrow">Field insight</p><h3>Keep checking after humid nights</h3><p className="muted">Early screening helps you spot changes before disease pressure spreads across a crop row.</p><Link to="/scan" className="text-link">Scan a leaf <ArrowUpRight size={15} /></Link></div></div></section>;
}

function Stat({ label, value, note }: { label: string; value: string; note: string }) { return <div className="stat-card"><p>{label}</p><strong>{value}</strong><small><TrendingUp size={13} /> {note}</small></div>; }

export function ScanPage() {
  const [result, setResult] = useState<Prediction[] | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  async function onFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]; if (!file) return;
    setError(""); setResult(null); setLoading(true);
    try {
      const configurationError = getApiConfigurationError();
      if (configurationError) {
        setError(configurationError);
        return;
      }
      setResult((await predictImage(file)).predictions);
    } catch (requestError) {
      if (requestError && typeof requestError === "object" && "response" in requestError) {
        const response = (requestError as { response?: { data?: { error?: string } } }).response;
        setError(response?.data?.error || "The inference API rejected this image.");
      } else {
        setError("The inference API could not be reached. Check the deployed backend URL and try again.");
      }
    } finally { setLoading(false); }
  }
  return <section className="page-grid"><div className="scan-intro"><div><p className="eyebrow">Image diagnosis</p><h2>Upload a clear leaf photo</h2><p className="muted">The image is sent to the configured Java inference API. Predictions are never fabricated in the browser.</p></div><div className="contract-pill"><CheckCircle2 size={16} /> 224 × 224 preprocessing contract</div></div><label className="upload-card"><ImagePlus size={38} /><strong>{loading ? "Analyzing image..." : "Choose a leaf image"}</strong><span>PNG or JPG · Use a well-lit, centered leaf</span><input type="file" accept="image/png,image/jpeg" onChange={onFile} disabled={loading} /></label>{error && <div className="error-box">{error}</div>}{result && <div className="card results"><div className="section-head"><div><p className="eyebrow">Prediction result</p><h3>Top supported classes</h3></div><FileScan size={22} /></div>{result.map((item) => <div className="prediction" key={item.index}><div><strong>{item.crop}</strong><span>{item.disease}</span></div><strong>{(item.confidence * 100).toFixed(1)}%</strong></div>)}</div>}</section>;
}

export function Crops() { const [query, setQuery] = useState(""); const filtered = crops.filter((crop) => crop.toLowerCase().includes(query.toLowerCase())); return <section className="page-grid"><div className="section-head"><div><p className="eyebrow">Verified model metadata</p><h2>Crop library</h2></div><span className="count-badge">{filtered.length} crops</span></div><div className="search-field"><Search size={18} /><input placeholder="Search crops..." value={query} onChange={(event) => setQuery(event.target.value)} /></div><div className="crop-grid">{filtered.map((crop) => <div className="crop-card" key={crop}><span className="crop-avatar"><Leaf size={19} /></span><div><strong>{crop}</strong><p>Supported disease classes</p></div><ArrowUpRight size={16} /></div>)}</div></section>; }

export function Analytics() { return <section className="page-grid"><div className="stats-grid"><Stat label="Weekly scans" value="50" note="+12% vs last week" /><Stat label="Average confidence" value="91.6%" note="Across classified images" /><Stat label="Healthy ratio" value="74%" note="Stable this week" /></div><div className="card chart-card"><div className="section-head"><div><p className="eyebrow">Scan volume</p><h3>Field activity</h3></div><BarChart3 size={21} /></div><div className="chart"><ResponsiveContainer width="100%" height="100%"><BarChart data={chartData}><CartesianGrid vertical={false} stroke="#e5ebe5" /><XAxis dataKey="name" axisLine={false} tickLine={false} /><YAxis axisLine={false} tickLine={false} allowDecimals={false} /><Tooltip /><Bar dataKey="scans" fill="#1e6b4d" radius={[6, 6, 0, 0]} /></BarChart></ResponsiveContainer></div></div></section>; }

export function Assistant() { const [message, setMessage] = useState(""); return <section className="assistant-layout"><div className="card assistant-card"><div className="assistant-heading"><span className="icon-box"><MessageCircle size={21} /></span><div><p className="eyebrow">Krishi guide</p><h2>Ask about your crop</h2></div></div><div className="chat-message"><strong>Assistant</strong><p>Ask a crop-care question. Connect the assistant service to receive verified, field-specific guidance.</p></div><form className="chat-form" onSubmit={(event) => { event.preventDefault(); setMessage(""); }}><input value={message} onChange={(event) => setMessage(event.target.value)} placeholder="How can I help with your crop?" /><button className="button" aria-label="Send message"><Send size={17} /></button></form></div><div className="card"><p className="eyebrow">Suggested topics</p><div className="topic-list"><span>Leaf spot prevention</span><span>Safe field scouting</span><span>When to rescan</span></div></div></section>; }

export function SettingsPage() { return <section className="page-grid"><div className="card settings-card"><p className="eyebrow">Workspace settings</p><h2>Preferences</h2><label>Display language<select><option>English</option><option>Kannada</option><option>Hindi (planned)</option><option>Marathi (planned)</option><option>Tamil (planned)</option><option>Telugu (planned)</option></select></label><label>API environment<input value={apiBaseUrl} readOnly /></label><div className="info-box"><ShieldCheck size={18} /><span>Model files are preserved outside the frontend bundle and inference is handled by the backend.</span></div></div></section>; }
