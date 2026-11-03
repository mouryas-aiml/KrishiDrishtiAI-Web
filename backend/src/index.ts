import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import multer from "multer";
import dotenv from "dotenv";
import { InferenceEngine } from "./inference.js";
import { db } from "./db.js";
import { CLASSES } from "./classes.js";
import { generateAdvisorResponse } from "./advisor.js";

dotenv.config();

const app = express();
const port = parseInt(process.env.PORT || "8080", 10);
const corsOrigins = (process.env.CORS_ORIGIN || "http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173")
  .split(",")
  .map(s => s.trim());

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || corsOrigins.includes(origin) || corsOrigins.includes("*") || origin.startsWith("http://localhost:") || origin.endsWith(".vercel.app")) {
      callback(null, true);
    } else {
      callback(null, true);
    }
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
    if (!req.file || !req.file.buffer) {
      res.status(400).json({ error: "Please upload an image file under the 'image' field." });
      return;
    }

    const notes = req.body.notes || "";
    const predictions = await inference.predict(req.file.buffer);

    let savedScan = null;
    if (predictions.length > 0) {
      const top = predictions[0];
      savedScan = await db.saveScan(top.crop, top.disease, top.confidence, notes);
    }

    res.json({ predictions, scan: savedScan });
  } catch (err: any) {
    res.status(400).json({ error: err.message || "Failed to process image inference." });
  }
});

// Scan History
app.get("/api/scans", async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const scans = await db.getScans();
    res.json(scans);
  } catch (err) {
    next(err);
  }
});

// Update Scan Notes (Edit Access)
app.patch("/api/scans/:id", async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const { notes = "" } = req.body;
    const updated = await db.updateScanNotes(id, notes);
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
app.delete("/api/scans/:id", async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const deleted = await db.deleteScan(id);
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
    res.json({ user, message: "Login successful." });
  } catch (err: any) {
    res.status(401).json({ error: err.message || "Login failed." });
  }
});

// Authentication: Forgot Password
app.post("/api/auth/forgot-password", async (req: Request, res: Response): Promise<void> => {
  try {
    const { contactNumber, newPassword } = req.body;
    if (!contactNumber || !newPassword) {
      res.status(400).json({ error: "Contact number and new password are required." });
      return;
    }
    await db.forgotPassword(contactNumber, newPassword);
    res.json({ success: true, message: "Password updated successfully. You can now log in." });
  } catch (err: any) {
    res.status(400).json({ error: err.message || "Password reset failed." });
  }
});

// User Profile: Edit Access
app.put("/api/auth/profile", async (req: Request, res: Response): Promise<void> => {
  try {
    const { id, name, contactNumber, preferredLanguage } = req.body;
    if (!id || !name || !contactNumber) {
      res.status(400).json({ error: "User ID, name, and contact number are required." });
      return;
    }
    const updated = await db.updateUserProfile(id, name, contactNumber, preferredLanguage);
    res.json({ user: updated, message: "Profile updated successfully." });
  } catch (err: any) {
    res.status(400).json({ error: err.message || "Failed to update profile." });
  }
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
  const reply = generateAdvisorResponse(message, language);
  res.json({ reply });
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
