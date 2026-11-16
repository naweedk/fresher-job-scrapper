# Scheduling — Daily Ingestion Guide

## Overview

Fresher Jobs India uses a scheduled data collection pipeline that runs daily to gather new job listings from public sources. **Classification is intentionally decoupled** from the daily collection to protect Gemini API quota.

---

## Architecture

```
Daily Collection (automatic)      →  Collects raw jobs, deduplicates, stores in PostgreSQL
AI Classification (manual/quota)  →  Classifies PENDING jobs via Gemini API (requires explicit trigger)
```

This separation ensures:
- Daily ingestion always works, even when Gemini quota is exhausted
- Classification budget is fully controllable
- No unexpected API charges

---

## GitHub Actions (Recommended for CI/CD)

The workflow file is at `.github/workflows/daily-ingestion.yml`.

### Automatic daily schedule
- Runs at **06:00 UTC (11:30 IST)** every day via cron: `0 6 * * *`
- Runs **collection only** — no Gemini API calls
- Concurrency lock prevents overlapping runs (`group: ingestion`)

### Manual trigger with classification
1. Go to **GitHub → Actions → Daily Job Ingestion → Run workflow**
2. Set `run_classify` to `true`
3. Set `classify_limit` (default: 50) — keep low on Free Tier (5 RPM)
4. Click **Run workflow**

### Required GitHub Secrets
| Secret | Value |
|--------|-------|
| `POSTGRES_PASSWORD` | Your PostgreSQL password |
| `GEMINI_API_KEY` | Your Google Gemini API key |

> [!CAUTION]
> Never hardcode secrets in workflow files. Use GitHub Secrets exclusively.

---

## Local Development (Windows Task Scheduler)

For local development without GitHub Actions:

### Step 1 — Create the wrapper script

Create `scripts/run-ingestion.bat`:
```bat
@echo off
cd /d "C:\Fresher Job Scrapper\ingestion"
call venv\Scripts\activate
python main.py --stage collect
```

### Step 2 — Create Windows Task Scheduler task

```powershell
# Run in PowerShell as Administrator
$action = New-ScheduledTaskAction -Execute 'C:\Fresher Job Scrapper\scripts\run-ingestion.bat'
$trigger = New-ScheduledTaskTrigger -Daily -At '7:00AM'
$settings = New-ScheduledTaskSettingsSet -ExecutionTimeLimit (New-TimeSpan -Hours 1) -MultipleInstances IgnoreNew
Register-ScheduledTask -TaskName 'FresherJobsIngestion' -Action $action -Trigger $trigger -Settings $settings -RunLevel Highest
```

### Step 3 — Verify the task
```powershell
Get-ScheduledTask -TaskName 'FresherJobsIngestion'
```

---

## Manual Execution (Any Environment)

```bash
cd ingestion

# Activate virtual environment
.\venv\Scripts\activate   # Windows
source venv/bin/activate  # Linux/Mac

# Test database connection
python main.py --stage test-db

# Collect new jobs (all sources)
python main.py --stage collect

# Classify pending jobs (quota-aware, manual only)
python main.py --stage classify --limit 20

# Run full pipeline (collect + classify)
python main.py --stage all --limit 20
```

---

## Gemini Quota Protection

| Concern | Protection |
|---------|-----------|
| Free Tier: 5 RPM | Pacing delay between requests + exponential backoff |
| `429 RESOURCE_EXHAUSTED` | Automatic retry with delay parsed from error response |
| Daily auto-classification | **Disabled by default** — must be explicitly triggered |
| Budget overrun | `--limit` flag caps maximum classifications per run |
| Quota exhausted mid-run | Pipeline continues; failed jobs marked `FAILED` and retried next run |

> [!IMPORTANT]
> Classification always uses `--limit` to cap Gemini API calls. Never run `--stage all` without `--limit` on the Free Tier.

---

## Failure Handling

| Failure | Behaviour |
|---------|-----------|
| Source unreachable | Logged as `FAILED` in `ingestion_logs`; other sources continue |
| Duplicate job | Silently skipped (content hash deduplication) |
| Gemini API error | Job marked `FAILED` classification; collection continues |
| Gemini 429 quota | Backoff + retry with parsed delay; fails gracefully after max retries |
| Database unreachable | Pipeline fails early with clear error message |

---

## Monitoring

Check ingestion logs via:

```sql
-- Latest ingestion runs
SELECT source_id, started_at, completed_at, fetched_count, inserted_count, 
       duplicate_count, failed_count, status, error_message
FROM ingestion_logs
ORDER BY started_at DESC
LIMIT 20;

-- Classification status
SELECT status, COUNT(*) FROM job_classifications GROUP BY status;

-- Jobs by source
SELECT s.name, COUNT(j.id) FROM jobs j JOIN sources s ON j.source_id = s.id GROUP BY s.name;
```

---

## Configuration Reference

| Variable | Default | Purpose |
|----------|---------|---------|
| `INGESTION_BATCH_SIZE` | 50 | Records processed per batch |
| `INGESTION_MAX_PAGES` | 5 | Maximum pages fetched per source |
| `CLASSIFICATION_BATCH_SIZE` | 20 | Jobs classified per session |
| `CLASSIFICATION_MAX_RETRIES` | 3 | Retries on Gemini errors |
| `GEMINI_MODEL` | `gemini-2.5-flash` | Gemini model for classification |
