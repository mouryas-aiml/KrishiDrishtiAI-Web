import { useState } from "react";
import { NavLink, Navigate, Route, Routes, useLocation } from "react-router-dom";
import { BarChart3, BookOpen, CloudSun, FileScan, Leaf, Menu, Settings, Sparkles, X } from "lucide-react";
import { Analytics, Assistant, Crops, Dashboard, ScanPage, SettingsPage } from "./pages";

const links = [
  { to: "/", label: "Overview", icon: Leaf },
  { to: "/scan", label: "AI scan", icon: FileScan },
  { to: "/crops", label: "Crop library", icon: BookOpen },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/assistant", label: "Assistant", icon: Sparkles },
  { to: "/weather", label: "Weather", icon: CloudSun },
  { to: "/settings", label: "Settings", icon: Settings },
];

export default function App() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const current = links.find((link) => link.to === location.pathname)?.label ?? "Overview";
  return (
    <div className="app-shell">
      <button className="mobile-menu" aria-label="Open navigation" onClick={() => setOpen(true)}><Menu size={22} /></button>
      <aside className={`sidebar ${open ? "sidebar-open" : ""}`}>
        <div className="brand"><span className="brand-mark"><Leaf size={22} /></span><span>KRISHI<br /><strong>DRISHTI</strong></span></div>
        <button className="close-menu" aria-label="Close navigation" onClick={() => setOpen(false)}><X size={20} /></button>
        <p className="nav-caption">Workspace</p>
        <nav>{links.map(({ to, label, icon: Icon }) => <NavLink key={to} to={to} onClick={() => setOpen(false)} className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}><Icon size={18} />{label}</NavLink>)}</nav>
        <div className="sidebar-note"><span className="status-dot" />Model ready<br /><small>On-device contract preserved</small></div>
      </aside>
      {open && <button className="backdrop" aria-label="Close navigation" onClick={() => setOpen(false)} />}
      <main className="main-content">
        <header className="topbar"><div><p className="eyebrow">Good morning</p><h1>{current}</h1></div><div className="profile-chip"><span>MK</span><div><strong>Farmer account</strong><small>Field operations</small></div></div></header>
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

function Weather() {
  return <section className="page-grid"><div className="hero-card"><div><p className="eyebrow light">Early warning</p><h2>Weather signals for healthier crops</h2><p>Connect a configured weather provider to turn humidity and temperature into field-specific disease risk alerts.</p></div><CloudSun size={62} strokeWidth={1.2} /></div><div className="card"><h3>Provider setup required</h3><p className="muted">No weather API is configured in this local build. The interface will display live alerts once the backend provider is connected.</p></div></section>;
}
