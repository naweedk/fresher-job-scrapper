# Ingestion Runbook — Fresher Jobs India

A guide for developers and operators to execute, monitor, and troubleshoot the data ingestion and AI classification pipeline.

---

## 1. Prerequisites

1. Ensure the PostgreSQL container is active:
   ```bash
   pnpm db:up
   ```
2. Activate the Python virtual environment:
   ```powershell
   cd ingestion
   .\venv\Scripts\Activate.ps1
   ```

---

## 2. CLI Execution Modes

### Test Database Connectivity
```bash
python main.py --stage test-db
```

### Run Full Pipeline (All Active Collectors + AI Classification)
```bash
python main.py --stage all
```

### Run Ingestion for a Single Source
```bash
# Available sources: arbeitnow, remotive, remoteok, hasjob, simplify_jobs
python main.py --stage collect --source simplify_jobs
python main.py --stage collect --source arbeitnow
python main.py --stage collect --source hasjob
```

### Run AI Classification for Pending Jobs
```bash
# Process next batch of pending jobs
python main.py --stage classify --limit 50
```

---

## 3. Database Inspection & Monitoring

### Check Ingestion Audit Logs
```sql
SELECT id, "sourceId", "startedAt", "completedAt", "fetchedCount", "insertedCount", "duplicateCount", status, "errorMessage"
FROM ingestion_logs
ORDER BY "startedAt" DESC
LIMIT 10;
```

### Check Classification Progress
```sql
SELECT status, count(*)
FROM job_classifications
GROUP BY status;
```

### View Live API Statistics
```bash
curl http://localhost:3100/api/stats
```

---

## 4. Troubleshooting

| Symptom | Cause | Remedy |
|---|---|---|
| `Database Connectivity Test: FAILED` | Docker container stopped or port conflict | Verify `docker ps`, confirm `POSTGRES_PORT=5434` in `.env` |
| `Gemini API key is not configured` | Empty `GEMINI_API_KEY` | Set valid key in `ingestion/.env` to enable LLM classification |
| `Rate limit exceeded (HTTP 429)` | External API rate limiting | Pipeline automatically applies exponential backoff |
| `Invalid JSON from Gemini` | Model returned malformed markdown | Pipeline auto-strips code fences and clamps enums to fallback |
