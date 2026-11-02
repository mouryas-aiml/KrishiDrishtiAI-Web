import axios from "axios";

const configuredApiUrl =
  import.meta.env.VITE_API_URL?.trim() ||
  (import.meta.env.PROD ? "https://krishi-drishti-api-tlfo.onrender.com/api" : "http://localhost:8080/api");
export const apiBaseUrl = configuredApiUrl;

export const api = axios.create({
  baseURL: apiBaseUrl,
  timeout: 30000,
});

export type Prediction = { index: number; crop: string; disease: string; confidence: number };
export type Scan = { id: string; crop: string; disease: string; confidence: number; createdAt: string };

export function getApiConfigurationError() {
  return configuredApiUrl
    ? ""
    : "The inference API is not configured for this website. Set VITE_API_URL in the Vercel project environment.";
}

export async function checkApiHealth() {
  const response = await api.get<{ status: string }>("/health", { timeout: 10000 });
  return response.data;
}

export async function predictImage(file: File) {
  const form = new FormData();
  form.append("image", file);
  const response = await api.post<{ predictions: Prediction[] }>("/predictions", form);
  return response.data;
}

export async function getScans() {
  const response = await api.get<Scan[]>("/scans");
  return response.data;
}
