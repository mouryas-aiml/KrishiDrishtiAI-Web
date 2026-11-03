import axios from "axios";

const configuredApiUrl =
  import.meta.env.VITE_API_URL?.trim() ||
  (import.meta.env.PROD ? "https://krishi-drishti-api-tlfo.onrender.com/api" : "http://localhost:8080/api");

export const apiBaseUrl = configuredApiUrl;

export const api = axios.create({
  baseURL: apiBaseUrl,
  timeout: 30000,
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
  crop: string;
  disease: string;
  confidence: number;
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

export async function predictImage(file: File | Blob): Promise<{ predictions: Prediction[] }> {
  const form = new FormData();
  form.append("image", file, "leaf_scan.jpg");
  const response = await api.post<{ predictions: Prediction[] }>("/predictions", form, {
    headers: { "Content-Type": "multipart/form-data" }
  });
  return response.data;
}

export async function getScans(): Promise<Scan[]> {
  const response = await api.get<Scan[]>("/scans");
  return response.data;
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
