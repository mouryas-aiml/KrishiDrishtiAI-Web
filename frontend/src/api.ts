import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8080/api",
  timeout: 30000,
});

export type Prediction = { index: number; crop: string; disease: string; confidence: number };
export type Scan = { id: string; crop: string; disease: string; confidence: number; createdAt: string };

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
