# Krishi Drishti (ಕೃಷಿ ದೃಷ್ಟಿ)

Krishi Drishti is a website-only crop health platform. It combines a
mobile-first React/Vite interface with a Java Spring Boot API that runs the
preserved ONNX model and stores scan results in PostgreSQL.

The website opens directly in any modern browser over HTTP or HTTPS. It has no
native runtime or packaged mobile application requirement.

## Technology

- **Frontend:** React, TypeScript, Vite, React Router, CSS, Lucide React,
  Axios, and Recharts.
- **Backend:** Java 21, Spring Boot, Spring Data JPA, PostgreSQL, and ONNX
  Runtime Java.
- **Deployment:** Vercel for the frontend and Render or another Java-compatible
  provider for the backend.

## Run locally

### Backend

Start PostgreSQL first. With Docker Desktop running, use:

```powershell
cd M:\KrishiDrishtiAI-Web\backend
docker compose up -d postgres
```

The included [`backend/docker-compose.yml`](./backend/docker-compose.yml)
creates the local `krishi_drishti` database. For a native PostgreSQL
installation, start its Windows service and create the database manually.
Configure non-default values from
[`backend/.env.example`](./backend/.env.example). Then run:

```powershell
cd M:\KrishiDrishtiAI-Web\backend
mvn clean spring-boot:run
```

The backend is a Maven project. Do not run `npm` commands inside `backend`.
If Maven is not installed, install it with `winget install Apache.Maven`, open
a new terminal, and verify with `mvn -version`.

The API starts at `http://localhost:8080`. The ONNX model path defaults to
`../model/model.onnx`; override it with `MODEL_PATH` when needed.

### Production connection

Deploy the backend separately; Vercel only serves the frontend. The backend
must expose HTTPS endpoints such as:

```text
https://your-backend-host.example.com/api/health
```

Set the exact backend API root (including `/api`) as the Vercel environment
variable `VITE_API_URL`, then redeploy the frontend. The confirmed production
frontend is `https://krishidrishti-ai-beta.vercel.app/`. Set the backend
`CORS_ORIGIN` to that Vercel URL and any required preview URL, separated by
commas.
The backend database variables are `DATABASE_URL`,
`DATABASE_USERNAME`, and `DATABASE_PASSWORD`. `DATABASE_URL` must be a JDBC
PostgreSQL URL beginning with `jdbc:postgresql://`.

### Frontend

```powershell
cd M:\KrishiDrishtiAI-Web\frontend
npm install
Copy-Item .env.example .env
npm run dev -- --host 0.0.0.0
```

Open `http://localhost:5173` in Chrome, Edge, or a mobile browser. To use
another device on the same network, open
`http://<computer-lan-ip>:5173` and set `VITE_API_URL` to a backend address
reachable from that device.

## Frontend features

- Responsive overview dashboard.
- AI image upload connected to the Java prediction endpoint.
- Verified crop library based on the 39-class model mapping.
- Scan analytics with responsive Recharts visualisation.
- Assistant, weather configuration state, and settings screens.
- Touch-friendly mobile navigation without horizontal scrolling.
- Vercel SPA fallback through [`frontend/vercel.json`](./frontend/vercel.json).

## API endpoints

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `POST` | `/api/predictions` | Multipart image inference |
| `GET` | `/api/scans` | Stored scan history |
| `GET` | `/api/health` | Backend health check |

Image inference preserves the original 224x224 RGB preprocessing, ImageNet
normalization, 39 output classes, background class index 4, stable softmax,
and 0.25 display threshold. Unsupported images return an explicit error; the
frontend never fabricates predictions.

## Repository structure

```text
frontend/       React/Vite website
backend/        Spring Boot REST API and ONNX inference service
model/          Preserved training scripts and model binaries
asset/          Evaluation graphs and demonstration assets
docs/           Migration and model-preservation notes
dataset/        Reserved for reproducible dataset metadata
```

## Model preservation

The migration verified these SHA-256 values:

| File | SHA-256 |
| --- | --- |
| `assets/model.tflite` | `FCEC1F25F20D26C376E9516247443800439E14B8D1591320657D51311DE12FFC` |
| `model/model.tflite` | `B474111E96743F83427660313C1EFD05520A0B6B647FCDE5B4B4638D2A37B420` |
| `model/model.onnx` | `85EDB8E57E31560F278592B791C21B0AF8D054A6762DDF5493A5978FB5C57639` |

The original model binaries and model metadata were not modified. See
[`docs/MIGRATION.md`](./docs/MIGRATION.md) for the migration record.

## Validation

```powershell
cd M:\KrishiDrishtiAI-Web\frontend
npm run typecheck
npm run build

cd M:\KrishiDrishtiAI-Web\backend
mvn test
mvn package
```

## Dataset references

- [PlantVillage Dataset](https://github.com/spMohanty/PlantVillage-Dataset)
- [PlantVillage Complete on Kaggle](https://www.kaggle.com/datasets/nishantvalvi1504/plantvillagecomplete/data)

The model output mapping, not the complete PlantVillage catalogue, defines
which classes this application supports.

## License

Released under the [MIT License](./LICENSE).
