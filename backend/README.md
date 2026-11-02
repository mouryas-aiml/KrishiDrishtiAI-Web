# Krishi Drishti API

This directory is a **Java Spring Boot Maven project**. Do not run `npm start`
or `npm run dev` here; there is intentionally no `package.json` in `backend`.

## Windows setup

Install Maven once, then open a new terminal so `mvn` is added to `PATH`:

```powershell
winget install Apache.Maven
```

If `winget` does not provide Maven and an administrator terminal is not
available, use the user-local Maven executable downloaded for this workspace:

```powershell
& "$env:USERPROFILE\tools\apache-maven-3.9.9\bin\mvn.cmd" clean spring-boot:run
```

Verify the tools:

```powershell
java -version
mvn -version
```

## Start the API

From the repository root:

```powershell
cd M:\KrishiDrishtiAI-Web\backend
mvn clean spring-boot:run
```

If the prompt already shows `M:\KrishiDrishtiAI-Web\backend>`, run only:

```powershell
mvn clean spring-boot:run
```

Before starting the API, start PostgreSQL. If Docker Desktop is installed,
start Docker Desktop, then use this second terminal from `backend`:

```powershell
docker compose up -d postgres
docker compose ps
```

The included [`docker-compose.yml`](./docker-compose.yml) creates the
`krishi_drishti` database with the default local credentials. If PostgreSQL is
installed natively instead, start its Windows service and create the database:

```powershell
Get-Service -Name 'postgresql*'
Start-Service -Name 'postgresql-x64-16'
createdb -U postgres krishi_drishti
```

Adjust the service name and credentials for the installed PostgreSQL version.
The API listens on `http://localhost:8080`; configure non-default values using
the environment variables documented in [`.env.example`](./.env.example).

For production, set `DATABASE_HOST`, `DATABASE_PORT`, `DATABASE_NAME`,
`DATABASE_USERNAME`, and `DATABASE_PASSWORD`. The Render Blueprint injects
these values from the managed database automatically. Set `CORS_ORIGIN` to
the exact Vercel origin. The health check is `GET /api/health`.

## Start the website

Use a second terminal:

```powershell
cd M:\KrishiDrishtiAI-Web\frontend
npm install
Copy-Item .env.example .env
npm run dev -- --host 0.0.0.0
```

Open `http://localhost:5173` or the alternate port printed by Vite if 5173 is
already in use.
