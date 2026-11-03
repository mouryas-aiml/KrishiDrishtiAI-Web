import { useEffect, useState } from "react";
import { NavLink, Navigate, Route, Routes, useLocation } from "react-router-dom";
import { BarChart3, BookOpen, CloudSun, FileScan, Leaf, Menu, Settings, Sparkles, X } from "lucide-react";
import { Analytics, Assistant, Crops, Dashboard, ScanPage, SettingsPage, Weather } from "./pages";
import { checkApiHealth, getApiConfigurationError } from "./api";

const links = [
  { to: "/", label: "Overview", icon: Leaf },
  { to: "/scan", label: "AI Scan", icon: FileScan },
  { to: "/crops", label: "Crop Library", icon: BookOpen },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/assistant", label: "Assistant", icon: Sparkles },
  { to: "/weather", label: "Weather", icon: CloudSun },
  { to: "/settings", label: "Settings", icon: Settings },
];

export default function App() {
  const [open, setOpen] = useState(false);
  const [apiStatus, setApiStatus] = useState<"checking" | "ready" | "unavailable">("checking");
  const location = useLocation();
  const current = links.find((link) => link.to === location.pathname)?.label ?? "Overview";

  useEffect(() => {
    if (getApiConfigurationError()) {
      setApiStatus("unavailable");
      return;
    }
    checkApiHealth()
      .then(() => setApiStatus("ready"))
      .catch(() => setApiStatus("unavailable"));
  }, []);

  return (
    <div className="app-shell">
      <button className="mobile-menu" aria-label="Open navigation" onClick={() => setOpen(true)}>
        <Menu size={22} />
      </button>

      <aside className={`sidebar ${open ? "sidebar-open" : ""}`}>
        <div className="brand">
          <span className="brand-mark"><Leaf size={22} /></span>
          <span>KRISHI<br /><strong>DRISHTI</strong></span>
        </div>
        <button className="close-menu" aria-label="Close navigation" onClick={() => setOpen(false)}>
          <X size={20} />
        </button>

        <p className="nav-caption">Workspace</p>
        <nav>
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setOpen(false)}
              className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-note">
          <span className="status-dot" style={{ background: apiStatus === "ready" ? "#9bd36b" : "#f59e0b" }} />
          {apiStatus === "ready" ? "TypeScript ONNX Active" : "Connecting API..."}
          <br />
          <small>{apiStatus === "ready" ? "PostgreSQL & Model Ready" : "Local Engine Starting"}</small>
        </div>
      </aside>

      {open && <button className="backdrop" aria-label="Close navigation" onClick={() => setOpen(false)} />}

      <main className="main-content">
        {apiStatus === "unavailable" && (
          <div className="api-banner">
            Inference API is initializing or offline at <code>{import.meta.env.VITE_API_URL || "http://localhost:8080/api"}</code>.
          </div>
        )}

        <header className="topbar">
          <div>
            <p className="eyebrow">Namaskara</p>
            <h1>{current}</h1>
          </div>
          <div className="profile-chip">
            <span>KD</span>
            <div>
              <strong>Krishi Drishti</strong>
              <small>Field Operations AI</small>
            </div>
          </div>
        </header>

        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/scan" element={<ScanPage />} />
          <Route path="/crops" element={<Crops />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/assistant" element={<Assistant />} />
          <Route path="/weather" element={<Weather />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}
