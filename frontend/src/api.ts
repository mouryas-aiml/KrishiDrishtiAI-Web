import axios from "axios";

const configuredApiUrl =
  import.meta.env.VITE_API_URL?.trim() ||
  (import.meta.env.PROD ? "https://krishi-drishti-api-tlfo.onrender.com/api" : "http://localhost:8080/api");

export const apiBaseUrl = configuredApiUrl;

export const api = axios.create({
  baseURL: apiBaseUrl,
  timeout: 30000,
  withCredentials: true,
});

export interface Prediction {
  index: number;
  crop: string;
  disease: string;
  confidence: number;
  isHealthy: boolean;
  severity: "low" | "moderate" | "high";
  symptoms: string;
  organicTreatment: string;
  chemicalTreatment: string;
  prevention: string;
}

export interface Scan {
  id: string;
  userId?: string;
  crop: string;
  disease: string;
  confidence: number;
  notes?: string;
  createdAt: string;
}

export interface DashboardSummary {
  totalScans: number;
  healthyScans: number;
  diseasedScans: number;
  lastUpdated: string;
}

export interface WeatherResponse {
  source: string;
  fetchedAt: string;
  coordinates: { latitude: number; longitude: number };
  data: {
    current?: Record<string, number | string>;
    daily?: Record<string, Array<number | string>>;
  };
}

export interface User {
  id: string;
  name: string;
  contactNumber: string;
  preferredLanguage: string;
  createdAt: string;
}

export interface CropDisease {
  disease: string;
  isHealthy: boolean;
  severity: "low" | "moderate" | "high";
  symptoms: string;
  organicTreatment: string;
  chemicalTreatment: string;
  prevention: string;
}

export interface CropCatalogItem {
  crop: string;
  totalClasses: number;
  diseases: CropDisease[];
}

export function getApiConfigurationError(): string {
  return configuredApiUrl
    ? ""
    : "The inference API is not configured. Set VITE_API_URL in your environment.";
}

export async function checkApiHealth(): Promise<{ status: string; service: string; modelReady?: boolean; runtime?: string }> {
  const response = await api.get("/health", { timeout: 10000 });
  return response.data;
}

export async function predictImage(file: File | Blob, notes?: string): Promise<{ predictions: Prediction[]; scan?: Scan }> {
  const form = new FormData();
  form.append("image", file, "leaf_scan.jpg");
  if (notes) form.append("notes", notes);

  const response = await api.post<{ predictions: Prediction[]; scan?: Scan }>("/predictions", form, {
    headers: { "Content-Type": "multipart/form-data" }
  });
  return response.data;
}

export async function getScans(): Promise<Scan[]> {
  try {
    const response = await api.get("/scans");
    if (Array.isArray(response.data)) {
      return response.data;
    }
    if (response.data && Array.isArray(response.data.items)) {
      return response.data.items;
    }
    return [];
  } catch (err) {
    console.warn("Failed to get scans:", err);
    return [];
  }
}

export async function getDashboardSummary(): Promise<DashboardSummary | null> {
  try {
    const response = await api.get<DashboardSummary>("/dashboard/summary");
    return response.data || null;
  } catch (err) {
    return null;
  }
}

export async function getWeather(latitude: number, longitude: number): Promise<WeatherResponse> {
  const response = await api.get<WeatherResponse>("/weather", { params: { latitude, longitude } });
  return response.data;
}

export async function updateScanNotes(id: string, notes: string): Promise<boolean> {
  const response = await api.patch<{ success: boolean }>(`/scans/${id}`, { notes });
  return response.data.success;
}

export async function deleteScan(id: string): Promise<boolean> {
  const response = await api.delete<{ success: boolean }>(`/scans/${id}`);
  return response.data.success;
}

export async function getCrops(): Promise<CropCatalogItem[]> {
  const response = await api.get<CropCatalogItem[]>("/crops");
  return response.data;
}

export async function askAssistant(message: string, language: string = "English"): Promise<string> {
  const response = await api.post<{ reply: string }>("/chat", { message, language });
  return response.data.reply;
}

// Authentication APIs
export async function registerUser(name: string, contactNumber: string, password: string): Promise<User> {
  const response = await api.post<{ user: User; message: string }>("/auth/register", {
    name,
    contactNumber,
    password,
  });
  return response.data.user;
}

export async function loginUser(contactNumber: string, password: string): Promise<User> {
  const response = await api.post<{ user: User; message: string }>("/auth/login", {
    contactNumber,
    password,
  });
  return response.data.user;
}

export async function forgotPassword(contactNumber: string, newPassword: string): Promise<boolean> {
  const response = await api.post<{ success: boolean; message: string }>("/auth/forgot-password", {
    contactNumber,
    newPassword,
  });
  return response.data.success;
}

export async function logoutUser(): Promise<void> {
  await api.post("/auth/logout");
}

export async function updateUserProfile(id: string, name: string, contactNumber: string, preferredLanguage?: string): Promise<User> {
  const response = await api.put<{ user: User; message: string }>("/auth/profile", {
    id,
    name,
    contactNumber,
    preferredLanguage,
  });
  return response.data.user;
}
