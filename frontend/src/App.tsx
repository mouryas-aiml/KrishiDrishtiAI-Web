import { useEffect, useState } from "react";
import { NavLink, Navigate, Route, Routes, useLocation } from "react-router-dom";
import {
  AlertTriangle,
  BarChart3,
  BookOpen,
  CheckCircle2,
  CloudSun,
  Edit3,
  FileScan,
  Globe,
  Leaf,
  Loader2,
  LogIn,
  LogOut,
  Menu,
  Phone,
  Save,
  Settings,
  Sparkles,
  User as UserIcon,
  X
} from "lucide-react";
import { Analytics, Assistant, Crops, Dashboard, ScanPage, SettingsPage, Weather } from "./pages";
import {
  checkApiHealth,
  forgotPassword,
  getApiConfigurationError,
  loginUser,
  logoutUser,
  registerUser,
  updateUserProfile,
  User
} from "./api";

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
  const [user, setUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem("krishi_user");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [language, setLanguage] = useState<string>(() => {
    return localStorage.getItem("krishi_lang") || "English";
  });

  // Auth Modal State
  const [authOpen, setAuthOpen] = useState(false);
  const [authTab, setAuthTab] = useState<"login" | "register" | "forgot">("login");
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState("");
  const [authSuccess, setAuthSuccess] = useState("");

  // Form Fields
  const [regName, setRegName] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  // Edit Profile Modal State
  const [profileOpen, setProfileOpen] = useState(false);
  const [editName, setEditName] = useState("");
  const [editContact, setEditContact] = useState("");
  const [editLanguage, setEditLanguage] = useState("English");
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileMsg, setProfileMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

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

  function handleLanguageChange(newLang: string) {
    setLanguage(newLang);
    localStorage.setItem("krishi_lang", newLang);
  }

  function openAuth(tab: "login" | "register" | "forgot") {
    setAuthTab(tab);
    setAuthError("");
    setAuthSuccess("");
    setAuthOpen(true);
  }

  function openProfileEditor() {
    if (!user) return;
    setEditName(user.name);
    setEditContact(user.contactNumber);
    setEditLanguage(user.preferredLanguage || language);
    setProfileMsg(null);
    setProfileOpen(true);
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setAuthError("");
    setAuthSuccess("");
    setAuthLoading(true);

    try {
      const loggedUser = await loginUser(contactNumber, password);
      setUser(loggedUser);
      localStorage.setItem("krishi_user", JSON.stringify(loggedUser));
      if (loggedUser.preferredLanguage) {
        handleLanguageChange(loggedUser.preferredLanguage);
      }
      setAuthOpen(false);
      setPassword("");
    } catch (err: any) {
      setAuthError(err.response?.data?.error || err.message || "Failed to log in.");
    } finally {
      setAuthLoading(false);
    }
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setAuthError("");
    setAuthSuccess("");
    setAuthLoading(true);

    try {
      const newUser = await registerUser(regName, contactNumber, password);
      setUser(newUser);
      localStorage.setItem("krishi_user", JSON.stringify(newUser));
      setAuthOpen(false);
      setPassword("");
      setRegName("");
    } catch (err: any) {
      setAuthError(err.response?.data?.error || err.message || "Registration failed.");
    } finally {
      setAuthLoading(false);
    }
  }

  async function handleForgotPassword(e: React.FormEvent) {
    e.preventDefault();
    setAuthError("");
    setAuthSuccess("");
    setAuthLoading(true);

    try {
      await forgotPassword(contactNumber, newPassword);
      setAuthSuccess("Password has been reset successfully. Please log in with your new password.");
      setNewPassword("");
      setTimeout(() => {
        setAuthTab("login");
        setAuthSuccess("");
      }, 1500);
    } catch (err: any) {
      setAuthError(err.response?.data?.error || err.message || "Failed to reset password.");
    } finally {
      setAuthLoading(false);
    }
  }

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setProfileLoading(true);
    setProfileMsg(null);

    try {
      const updated = await updateUserProfile(user.id, editName, editContact, editLanguage);
      setUser(updated);
      localStorage.setItem("krishi_user", JSON.stringify(updated));
      handleLanguageChange(updated.preferredLanguage);
      setProfileMsg({ type: "success", text: "Profile details updated successfully." });
      setTimeout(() => setProfileOpen(false), 1200);
    } catch (err: any) {
      setProfileMsg({ type: "error", text: err.response?.data?.error || err.message || "Update failed." });
    } finally {
      setProfileLoading(false);
    }
  }

  async function handleLogout() {
    try {
      await logoutUser();
    } catch (error) {
      console.error("Failed to revoke server session:", error);
    }
    setUser(null);
    localStorage.removeItem("krishi_user");
    setProfileOpen(false);
  }

  const eyebrowGreetings: Record<string, string> = {
    English: "Namaskara",
    Kannada: "ನಮಸ್ಕಾರ",
    Hindi: "नमस्ते"
  };

  const displayName = user?.name ? user.name : (language === "Kannada" ? "ರೈತ ಮಿತ್ರ" : language === "Hindi" ? "किसान मित्र" : "Farmer Friend");
  const fullGreeting = `${eyebrowGreetings[language] || "Namaskara"}, ${displayName}`;

  return (
    <div className="app-shell">
      <button className="mobile-menu" aria-label="Open navigation" onClick={() => setOpen(true)}>
        <Menu size={22} />
      </button>

      <aside className={`sidebar ${open ? "sidebar-open" : ""}`}>
        <div className="brand">
          <img src="/logo.svg" alt="Krishi Drishti Logo" className="brand-logo-img" />
          <div className="brand-text">
            <span className="brand-title">KRISHI DRISHTI</span>
            <span className="brand-sub">Smart Crop AI</span>
          </div>
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
            <p className="eyebrow">{fullGreeting}</p>
            <h1>{current}</h1>
          </div>

          <div className="topbar-actions">
            {/* Language Selector */}
            <div className="lang-selector-pill">
              <Globe size={16} />
              <select value={language} onChange={(e) => handleLanguageChange(e.target.value)} title="Display and voice translation language">
                <option value="English">English</option>
                <option value="Kannada">ಕನ್ನಡ</option>
                <option value="Hindi">हिन्दी</option>
              </select>
            </div>

            {/* Profile or Login Button */}
            {user ? (
              <div className="profile-chip profile-chip-interactive" onClick={openProfileEditor} title="Click to view and edit profile">
                <span>{user.name.slice(0, 2).toUpperCase()}</span>
                <div>
                  <strong>{user.name}</strong>
                  <small>{user.contactNumber}</small>
                </div>
              </div>
            ) : (
              <button className="auth-trigger-btn" onClick={() => openAuth("login")}>
                <LogIn size={16} /> Login / Register
              </button>
            )}
          </div>
        </header>

        <Routes>
          <Route path="/" element={<Dashboard language={language} user={user} />} />
          <Route path="/scan" element={<ScanPage language={language} user={user} />} />
          <Route path="/crops" element={<Crops language={language} />} />
          <Route path="/analytics" element={<Analytics language={language} />} />
          <Route path="/assistant" element={<Assistant language={language} user={user} />} />
          <Route path="/weather" element={<Weather language={language} />} />
          <Route path="/settings" element={<SettingsPage language={language} onLanguageChange={handleLanguageChange} />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* Authentication Modal */}
      {authOpen && (
        <div className="modal-backdrop" onClick={() => setAuthOpen(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>
                <UserIcon size={20} />
                {authTab === "login" && "Farmer Login"}
                {authTab === "register" && "Create Farmer Account"}
                {authTab === "forgot" && "Reset Password"}
              </h3>
              <button className="modal-close-btn" onClick={() => setAuthOpen(false)} aria-label="Close">
                <X size={18} />
              </button>
            </div>

            <div className="modal-tabs">
              <button
                className={`modal-tab ${authTab === "login" ? "active" : ""}`}
                onClick={() => { setAuthTab("login"); setAuthError(""); setAuthSuccess(""); }}
              >
                Login
              </button>
              <button
                className={`modal-tab ${authTab === "register" ? "active" : ""}`}
                onClick={() => { setAuthTab("register"); setAuthError(""); setAuthSuccess(""); }}
              >
                Register
              </button>
              <button
                className={`modal-tab ${authTab === "forgot" ? "active" : ""}`}
                onClick={() => { setAuthTab("forgot"); setAuthError(""); setAuthSuccess(""); }}
              >
                Forgot Password
              </button>
            </div>

            <div className="modal-body">
              {authError && (
                <div className="form-error">
                  <AlertTriangle size={16} />
                  <span>{authError}</span>
                </div>
              )}
              {authSuccess && (
                <div className="form-success">
                  <CheckCircle2 size={16} />
                  <span>{authSuccess}</span>
                </div>
              )}

              {/* Login Form */}
              {authTab === "login" && (
                <form onSubmit={handleLogin}>
                  <div className="form-group">
                    <label className="form-label">Contact Number (Mobile)</label>
                    <input
                      type="tel"
                      className="form-input"
                      placeholder="e.g. 9876543210"
                      value={contactNumber}
                      onChange={(e) => setContactNumber(e.target.value)}
                      required
                      autoFocus
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Password</label>
                    <input
                      type="password"
                      className="form-input"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>

                  <div style={{ textAlign: "right", marginBottom: "14px" }}>
                    <button
                      type="button"
                      style={{ background: "none", border: 0, color: "#1a5e42", fontSize: "12px", cursor: "pointer", textDecoration: "underline" }}
                      onClick={() => setAuthTab("forgot")}
                    >
                      Forgot password?
                    </button>
                  </div>

                  <button type="submit" className="form-submit-btn" disabled={authLoading}>
                    {authLoading ? <Loader2 className="animate-spin" size={16} /> : <LogIn size={16} />}
                    Sign In
                  </button>
                </form>
              )}

              {/* Register Form */}
              {authTab === "register" && (
                <form onSubmit={handleRegister}>
                  <div className="form-group">
                    <label className="form-label">Farmer Full Name</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. Ramesh Patil"
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      required
                      autoFocus
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Contact Number (Mobile)</label>
                    <input
                      type="tel"
                      className="form-input"
                      placeholder="e.g. 9876543210"
                      value={contactNumber}
                      onChange={(e) => setContactNumber(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Create Password</label>
                    <input
                      type="password"
                      className="form-input"
                      placeholder="Minimum 4 characters"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>

                  <button type="submit" className="form-submit-btn" disabled={authLoading}>
                    {authLoading ? <Loader2 className="animate-spin" size={16} /> : <UserIcon size={16} />}
                    Create Account
                  </button>
                </form>
              )}

              {/* Forgot Password Form */}
              {authTab === "forgot" && (
                <form onSubmit={handleForgotPassword}>
                  <div className="form-group">
                    <label className="form-label">Registered Contact Number</label>
                    <input
                      type="tel"
                      className="form-input"
                      placeholder="e.g. 9876543210"
                      value={contactNumber}
                      onChange={(e) => setContactNumber(e.target.value)}
                      required
                      autoFocus
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">New Password</label>
                    <input
                      type="password"
                      className="form-input"
                      placeholder="Enter new password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                    />
                  </div>

                  <button type="submit" className="form-submit-btn" disabled={authLoading}>
                    {authLoading ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                    Reset & Save Password
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Edit Profile Modal */}
      {profileOpen && user && (
        <div className="modal-backdrop" onClick={() => setProfileOpen(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>
                <Edit3 size={20} />
                Farmer Profile & Edit Access
              </h3>
              <button className="modal-close-btn" onClick={() => setProfileOpen(false)} aria-label="Close">
                <X size={18} />
              </button>
            </div>

            <div className="modal-body">
              {profileMsg && (
                <div className={profileMsg.type === "success" ? "form-success" : "form-error"}>
                  {profileMsg.type === "success" ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
                  <span>{profileMsg.text}</span>
                </div>
              )}

              <form onSubmit={handleSaveProfile}>
                <div className="form-group">
                  <label className="form-label">Farmer Name</label>
                  <input
                    type="text"
                    className="form-input"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Contact Number (Mobile)</label>
                  <input
                    type="tel"
                    className="form-input"
                    value={editContact}
                    onChange={(e) => setEditContact(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Preferred Advisory Language</label>
                  <select
                    className="form-input"
                    value={editLanguage}
                    onChange={(e) => setEditLanguage(e.target.value)}
                  >
                    <option value="English">English</option>
                    <option value="Kannada">ಕನ್ನಡ (Kannada)</option>
                    <option value="Hindi">हिन्दी (Hindi)</option>
                  </select>
                </div>

                <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
                  <button type="submit" className="form-submit-btn" disabled={profileLoading} style={{ flex: 2 }}>
                    {profileLoading ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                    Save Changes
                  </button>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="button"
                    style={{ flex: 1, background: "#fee2e2", color: "#991b1b", border: "1px solid #fecaca" }}
                  >
                    <LogOut size={16} /> Log Out
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
