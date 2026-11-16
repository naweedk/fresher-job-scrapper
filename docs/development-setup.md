# Development Setup Guide — Fresher Jobs India

Follow these instructions to set up, run, and verify the local development environment.

---

## 1. Environment Preparation

### Clone the Repository
```bash
git clone <repo-url>
cd "Fresher Job Scrapper"
```

### Configure Environment Variables
Copy all template `.env.example` files to `.env`:

```bash
# Workspace root configuration
copy .env.example .env

# NestJS API configuration
copy apps\api\.env.example apps\api\.env

# Python Ingestion configuration
copy ingestion\.env.example ingestion\.env
```

---

## 2. Database Setup

### Start PostgreSQL with Docker Compose
```bash
pnpm db:up
```

Verify that the container is healthy:
```bash
docker ps --filter "name=fresher_jobs_postgres"
```

*Default development connection details:*
- Host: `localhost`
- Port: `5434`
- User: `postgres`
- Password: `local_dev_password`
- Database: `fresher_jobs`

---

## 3. Node.js & Monorepo Setup

### Install Dependencies
```bash
pnpm install
```

### Apply Database Migrations
Run the initial Prisma migration against the PostgreSQL instance:
```bash
pnpm db:migrate
```

### Generate Prisma Client
```bash
pnpm db:generate
```

---

## 4. Python Ingestion Setup

Set up the isolated Python virtual environment:

```bash
cd ingestion

# Create virtual environment
python -m venv venv

# Activate virtual environment (Windows PowerShell)
.\venv\Scripts\Activate.ps1

# Install requirements
pip install -r requirements.txt

# Verify environment and settings
python main.py

# Run test suite
pytest tests/ -v

cd ..
```

---

## 5. Running the Application

### Option A: Run Full Stack Concurrently
To start both the Next.js frontend and NestJS API together:
```bash
pnpm dev
```

### Option B: Run Services Individually
```bash
# Terminal 1 - Frontend (Next.js on port 3000)
pnpm dev:web

# Terminal 2 - Backend (NestJS on port 3100)
pnpm dev:api
```

---

## 6. Verification Checklist

1. **Verify Backend Health**:
   Visit `http://localhost:3100/api/health` in your browser or run:
   ```powershell
   Invoke-RestMethod http://localhost:3100/api/health
   ```
   Expected response:
   ```json
   {
     "status": "ok",
     "service": "fresher-jobs-api",
     "database": "connected"
   }
   ```

2. **Verify Frontend**:
   Navigate to `http://localhost:3000` to see the "Fresher Jobs India" Phase 1 landing page.

3. **Verify Database Structure**:
   Open Prisma Studio to inspect the schema visually:
   ```bash
   pnpm db:studio
   ```

4. **Verify Linting**:
   ```bash
   pnpm lint
   ```

5. **Verify Production Build**:
   ```bash
   pnpm build
   ```
