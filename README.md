# SIH 26165 · Safety Report Analysis Prototype

A local demonstration of synthetic safety-report intake, transparent NLP/rule analysis, possible SIF precursor flags, Life-Saving Rule matches, and corrective-action tracking. This is a prototype, not an operational safety system. It contains synthetic records only and is not affiliated with or based on data from any real company.

## Requirements

- Node.js 20 or newer and npm
- Python 3.11 or newer
- PostgreSQL 15+ only if database persistence is wanted; the JSON demo store works without it
- Docker Desktop is an easy way to start PostgreSQL on Windows

## Install

Run these commands in a VS Code PowerShell terminal from the project root:

```powershell
npm install
Copy-Item .env.example .env
```

The `.env` file is optional for JSON mode. To use PostgreSQL, set `DATABASE_URL` in it as shown below. Do not commit `.env` or use the demo credentials outside this local prototype.

## Start PostgreSQL (optional)

With Docker Desktop running:

```powershell
docker run --name sih26165-postgres -e POSTGRES_DB=sih26165 -e POSTGRES_USER=sihdemo -e POSTGRES_PASSWORD=sihdemo-local -p 5432:5432 -d postgres:16
```

Set this line in the root `.env` file to enable it:

```text
DATABASE_URL=postgresql://sihdemo:sihdemo-local@localhost:5432/sih26165
```

On first connection the API creates the tables and seeds the demo user, eight rules, ten synthetic reports, predictions, and corrective actions. If PostgreSQL is not running or `DATABASE_URL` is blank, the API uses `backend/data/demo-store.json` and writes changes there instead. The SQL definitions and rule seed are in `database/schema.sql` and `database/seed.sql`.

To stop the optional container:

```powershell
docker stop sih26165-postgres
```

## Start the NLP service (optional)

Open a VS Code terminal:

```powershell
cd nlp-service
python -m venv .venv
.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
python -m pip install -r requirements.txt
python -m uvicorn main:app --reload --port 8000
```

The API remains functional if this service is stopped: Express uses its matching local rule fallback. The default Python install does not download a model. If a compatible DistilBERT checkpoint is already cached and `transformers`/PyTorch are installed, the service attempts to use it. To opt into Hugging Face downloads, install a PyTorch build appropriate to your Python version and hardware, install `requirements-model.txt`, and set `SIH_ALLOW_MODEL_DOWNLOAD=true` in the environment before starting Uvicorn. Results identify their provider; rule-based output is labeled **Prototype NLP / Rule-based Analysis** and is never represented as a trained model result. No paid APIs or API keys are used.

## Start the application

Open two more PowerShell terminals from the project root.

Backend:

```powershell
npm run dev --workspace backend
```

Frontend:

```powershell
npm run dev --workspace frontend
```

Or start both JavaScript processes in one terminal:

```powershell
npm run dev
```

Open **http://localhost:5173**. The API health check is at **http://localhost:4000/api/health** and the NLP health check is at **http://localhost:8000/health** when that service is running.

## Demo login

- Email: `demo@sih26165.in`
- Password: `SafetyDemo26165!`

The login returns a short-lived JWT. Demo credentials are intentionally fixed for this local presentation prototype.

## What to demonstrate

1. Sign in and review the pre-populated dashboard, alerts, severity chart, and report trends.
2. Open report history and search/filter the ten synthetic reports.
3. Submit a report or use **Analyze report** to preview a rule-based signal before submitting.
4. Open a report to review classification, possible SIF precursor status, risk, confidence estimate, detected hazards/entities, explanation, and matched Life-Saving Rule.
5. Change an action status in the corrective-action register and view the analytics charts.

Analysis is prototype decision support. A keyword/rule match is not a verified hazard, incident classification, or safety determination. A qualified person must review reports and follow applicable site procedures.

## Data flow

```text
Report form (React)
  → Express API (JWT-protected)
  → FastAPI /analyze when available; Express rule fallback otherwise
  → prototype classification, SIF signal, hazards, entities, explanation, and rule match
  → PostgreSQL when configured, local JSON otherwise
  → dashboard and analytics; reviewer updates corrective-action status
```

## Project layout

```text
sih26165/
├── frontend/
│   ├── src/
│   │   ├── charts/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   └── package.json
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── data/                  # Created at runtime for JSON persistence
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── services/
│   └── server.js
├── nlp-service/
│   ├── analyzer.py
│   ├── main.py
│   ├── rules.py
│   └── requirements*.txt
├── database/
│   ├── schema.sql
│   └── seed.sql
├── .env.example
├── package.json
└── README.md
```

## API routes

- `POST /api/auth/login`
- `GET /api/reports` and `GET /api/reports/:id`
- `POST /api/reports` and `POST /api/reports/:id/analyze`
- `POST /api/reports/analyze-draft`
- `GET /api/dashboard` and `GET /api/analytics`
- `GET /api/actions` and `PUT /api/actions/:id`

All routes except login and health require `Authorization: Bearer <token>`.
