import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import multer from "multer";
import dotenv from "dotenv";
import { InferenceEngine } from "./inference.js";
import { db } from "./db.js";
import { CLASSES } from "./classes.js";
import { generateAdvisorResponse } from "./advisor.js";
import { retrieveKnowledge } from "./rag.js";

dotenv.config();

declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

const app = express();
const port = parseInt(process.env.PORT || "8080", 10);
const corsOrigins = (process.env.CORS_ORIGIN || "http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173")
  .split(",")
  .map(s => s.trim())
  .filter(Boolean);
const sessionTtlMs = 1000 * 60 * 60 * 24 * 7;

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || corsOrigins.includes(origin)) return callback(null, true);
    return callback(new Error("Origin is not allowed by CORS."));
  },
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 }, // 25 MB
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files (PNG, JPEG, WebP) are supported."));
    }
  }
});

const inference = new InferenceEngine();
const requestCounts = new Map<string, { count: number; resetAt: number }>();

app.use((req: Request, res: Response, next: NextFunction) => {
  const key = req.ip || "unknown";
  const now = Date.now();
  const current = requestCounts.get(key);
  if (!current || current.resetAt <= now) {
    requestCounts.set(key, { count: 1, resetAt: now + 60_000 });
    next();
    return;
  }
  current.count += 1;
  if (current.count > 120) {
    res.status(429).json({ error: "Too many requests. Please try again shortly." });
    return;
  }
  next();
});

async function attachSession(req: Request): Promise<void> {
  const cookies = req.headers.cookie?.split(";").map(value => value.trim()) || [];
  const sessionCookie = cookies.find(cookie => cookie.startsWith("krishi_session="));
  if (sessionCookie) {
    req.userId = (await db.getSessionUserId(sessionCookie.slice("krishi_session=".length))) || undefined;
  }
}

async function requireAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
  await attachSession(req);
  if (!req.userId) {
    res.status(401).json({ error: "Authentication is required." });
    return;
  }
  next();
}

function setSessionCookie(res: Response, sessionId: string): void {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  res.setHeader("Set-Cookie", `krishi_session=${sessionId}; Max-Age=${sessionTtlMs / 1000}; Path=/; HttpOnly; SameSite=Lax${secure}`);
}

// Health Check
app.get("/api/health", (_req: Request, res: Response) => {
  res.json({
    status: "ok",
    service: "krishi-drishti-api",
    runtime: "Node.js TypeScript",
    modelReady: inference.isReady(),
  });
});

// Image Inference
app.post("/api/predictions", upload.single("image"), async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    await attachSession(req);
    if (!req.file || !req.file.buffer) {
      res.status(400).json({ error: "Please upload an image file under the 'image' field." });
      return;
    }

    const notes = req.body.notes || "";
    const predictions = await inference.predict(req.file.buffer);

    let savedScan = null;
    if (predictions.length > 0) {
      const top = predictions[0];
      savedScan = await db.saveScan(top.crop, top.disease, top.confidence, notes, req.userId);
    }

    res.json({ predictions, scan: savedScan });
  } catch (err: any) {
    res.status(400).json({ error: err.message || "Failed to process image inference." });
  }
});

// Scan History
app.get("/api/scans", async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    await attachSession(req);
    const page = Number(req.query.page || 1);
    const pageSize = Number(req.query.pageSize || 100);
    const scans = await db.getScans(req.userId, page, pageSize);
    res.json({ ...scans, page, pageSize });
  } catch (err) {
    next(err);
  }
});

app.get("/api/dashboard/summary", async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    await attachSession(req);
    res.json(await db.getDashboardSummary(req.userId));
  } catch (err) {
    next(err);
  }
});

app.get("/api/weather", async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const latitude = Number(req.query.latitude);
    const longitude = Number(req.query.longitude);
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude) || latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
      res.status(400).json({ error: "Valid latitude and longitude are required." });
      return;
    }

    const params = new URLSearchParams({
      latitude: latitude.toString(),
      longitude: longitude.toString(),
      current: "temperature_2m,relative_humidity_2m,dew_point_2m,precipitation,wind_speed_10m",
      hourly: "temperature_2m,relative_humidity_2m,precipitation_probability,precipitation",
      daily: "temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max",
      forecast_days: "7",
      timezone: "auto",
    });
    const response = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`);
    if (!response.ok) {
      throw new Error(`Open-Meteo returned HTTP ${response.status}.`);
    }
    const data = await response.json();
    res.json({
      source: "Open-Meteo",
      fetchedAt: new Date().toISOString(),
      coordinates: { latitude, longitude },
      data,
    });
  } catch (err) {
    next(err);
  }
});

// Update Scan Notes (Edit Access)
app.patch("/api/scans/:id", requireAuth, async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const { notes = "" } = req.body;
    const updated = await db.updateScanNotes(id, notes, req.userId);
    if (!updated) {
      res.status(404).json({ error: "Scan record not found." });
      return;
    }
    res.json({ success: true, id, notes });
  } catch (err) {
    next(err);
  }
});

// Delete Scan Record
app.delete("/api/scans/:id", requireAuth, async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const deleted = await db.deleteScan(id, req.userId);
    res.json({ success: deleted });
  } catch (err) {
    next(err);
  }
});

// Authentication: Register
app.post("/api/auth/register", async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, contactNumber, password } = req.body;
    if (!name || !contactNumber || !password) {
      res.status(400).json({ error: "Name, contact number, and password are required." });
      return;
    }
    const user = await db.registerUser(name, contactNumber, password);
    setSessionCookie(res, await db.createSession(user.id, sessionTtlMs));
    res.status(201).json({ user, message: "Registration successful." });
  } catch (err: any) {
    res.status(400).json({ error: err.message || "Registration failed." });
  }
});

// Authentication: Login
app.post("/api/auth/login", async (req: Request, res: Response): Promise<void> => {
  try {
    const { contactNumber, password } = req.body;
    if (!contactNumber || !password) {
      res.status(400).json({ error: "Contact number and password are required." });
      return;
    }
    const user = await db.loginUser(contactNumber, password);
    setSessionCookie(res, await db.createSession(user.id, sessionTtlMs));
    res.json({ user, message: "Login successful." });
  } catch (err: any) {
    res.status(401).json({ error: err.message || "Login failed." });
  }
});

// Authentication: Forgot Password
app.post("/api/auth/forgot-password", async (req: Request, res: Response): Promise<void> => {
  res.status(503).json({ error: "Password reset requires verified email or SMS delivery and is not configured." });
});

// User Profile: Edit Access
app.put("/api/auth/profile", requireAuth, async (req: Request, res: Response): Promise<void> => {
  try {
    const { id, name, contactNumber, preferredLanguage } = req.body;
    if (!id || !name || !contactNumber) {
      res.status(400).json({ error: "User ID, name, and contact number are required." });
      return;
    }
    if (id !== req.userId) {
      res.status(403).json({ error: "You can only update your own profile." });
      return;
    }
    const updated = await db.updateUserProfile(id, name, contactNumber, preferredLanguage);
    res.json({ user: updated, message: "Profile updated successfully." });
  } catch (err: any) {
    res.status(400).json({ error: err.message || "Failed to update profile." });
  }
});

app.get("/api/auth/me", requireAuth, async (req: Request, res: Response): Promise<void> => {
  res.json({ userId: req.userId });
});

app.post("/api/auth/logout", async (req: Request, res: Response): Promise<void> => {
  const cookies = req.headers.cookie?.split(";").map(value => value.trim()) || [];
  const sessionCookie = cookies.find(cookie => cookie.startsWith("krishi_session="));
  if (sessionCookie) await db.deleteSession(sessionCookie.slice("krishi_session=".length));
  res.setHeader("Set-Cookie", "krishi_session=; Max-Age=0; Path=/; HttpOnly; SameSite=Lax");
  res.json({ success: true });
});

// Crop Library Metadata
app.get("/api/crops", (_req: Request, res: Response) => {
  const cropNames = Array.from(new Set(CLASSES.filter(c => c.crop !== "Background").map(c => c.crop)));
  const catalog = cropNames.map(crop => {
    const diseases = CLASSES.filter(c => c.crop === crop);
    return {
      crop,
      totalClasses: diseases.length,
      diseases: diseases.map(d => ({
        disease: d.disease,
        isHealthy: d.isHealthy,
        severity: d.severity,
        symptoms: d.symptoms,
        organicTreatment: d.organicTreatment,
        chemicalTreatment: d.chemicalTreatment,
        prevention: d.prevention,
      }))
    };
  });
  res.json(catalog);
});

// Agronomic Assistant Chat
app.post("/api/chat", (req: Request, res: Response) => {
  const { message = "", language = "English" } = req.body;
  if (!message || typeof message !== "string" || !message.trim()) {
    res.status(400).json({ error: "Message content cannot be empty." });
    return;
  }
  const sources = retrieveKnowledge(message);
  if (!sources.length) {
    res.status(422).json({
      error: "No verified agricultural knowledge matched this question. Ask about a crop or disease covered by the available model metadata.",
    });
    return;
  }
  const reply = generateAdvisorResponse(message, language);
  res.json({
    reply: `${reply}\n\nSources:\n${sources.map((source) => `- ${source.title}: ${source.source}`).join("\n")}`,
    sources,
  });
});

// Centralized error handler
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error("[ServerError]", err);
  res.status(err.status || 500).json({
    error: err.message || "An unexpected server error occurred."
  });
});

async function startServer() {
  await db.initialize();
  await inference.initialize();

  app.listen(port, "0.0.0.0", () => {
    console.log(`[Krishi Drishti] TypeScript API server listening on http://localhost:${port}`);
  });
}

startServer().catch((err) => {
  console.error("Fatal startup error:", err);
  process.exit(1);
});
