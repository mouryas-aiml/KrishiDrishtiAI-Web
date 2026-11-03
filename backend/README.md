# Krishi Drishti Backend API (TypeScript / Node.js)

High-performance, lightweight TypeScript backend for Krishi Drishti crop disease diagnosis and agronomist guidance.

## Architecture

- **Runtime:** Node.js (v20+ or v24+) with TypeScript
- **Inference Engine:** ONNX Runtime (`onnxruntime-node`) running the preserved `model/model.onnx` (256x256 RGB ImageNet normalized)
- **Image Processing:** `jimp` (100% pure JavaScript, zero native compilation required)
- **Database:** PostgreSQL with automatic table provisioning and user-scoped scan ownership
- **Framework:** Express + CORS + Multer

## API Endpoints

| Method | Route | Description |
|---|---|---|
| `GET` | `/api/health` | Health status and ONNX model readiness |
| `POST` | `/api/predictions` | Multipart leaf image upload and inference |
| `GET` | `/api/scans` | Historical scan journal |
| `GET` | `/api/dashboard/summary` | Database-backed scan aggregates |
| `DELETE` | `/api/scans/:id` | Remove a scan record |
| `POST` | `/api/auth/logout` | Revoke the current HTTP-only session |
| `GET` | `/api/auth/me` | Validate the current session |
| `GET` | `/api/crops` | Full 14-crop and 39-condition disease library with treatments |
| `POST` | `/api/chat` | AI Agronomist advisory in English, Kannada, and Hindi |

## Local Development

```powershell
cd backend
npm install
npm run dev
```

To build and run production:

```powershell
npm run build
npm start
```

Authentication uses an HTTP-only `krishi_session` cookie. In production,
PostgreSQL is mandatory; the development fallback store is disabled.
