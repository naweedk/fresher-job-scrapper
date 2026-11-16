# AI Classification & Cost Tracking — Fresher Jobs India

## 1. Selected LLM Architecture

- **Provider**: Google Gemini
- **Model**: `gemini-2.5-flash`
- **SDK**: Official Google Gen AI SDK (`google-genai` v3+)
- **Selection Rationale**:
  - `gemini-2.5-flash` provides sub-second latency, structured JSON schema validation, and high fidelity extraction at cost-effective economics.
  - Native support for `response_mime_type="application/json"` and `system_instruction` guarantees deterministic JSON compliance.

---

## 2. Prompt Engineering & Versioning

- **Version Identifier**: `job-classification-v1`
- **System Instruction**: Standardizes roles strictly into canonical taxonomy (`Frontend Developer`, `Backend Developer`, `Full Stack Developer`, `Software Engineer`, `Data Analyst`, etc.) and aligns enum values directly with Prisma models (`INTERNSHIP`, `FULL_TIME`, `FRESHER`, `ONSITE`, `REMOTE`, `HYBRID`).
- **User Prompt**: Supplies normalized title, company, location, and sanitized job description (up to 1,500 characters to optimize token spend).

---

## 3. Output Schema & Prisma Mapping

```json
{
  "role": "Frontend Developer",
  "city": "Bengaluru",
  "jobType": "FULL_TIME",
  "experienceLevel": "FRESHER",
  "workMode": "HYBRID",
  "skills": ["React", "TypeScript", "Next.js"],
  "confidence": 0.95
}
```

- `role`: Canonical role name matching UI filtering options.
- `city`: Standardized Indian city (e.g. Bengaluru, Mumbai, Hyderabad, Pune, Gurugram) or `Remote`.
- `jobType`: `JobType` Prisma enum (`INTERNSHIP`, `FULL_TIME`, `CONTRACT`, `OTHER`).
- `experienceLevel`: `ExperienceLevel` Prisma enum (`FRESHER`, `ZERO_TO_ONE_YEAR`, `ONE_TO_TWO_YEARS`, `OTHER`).
- `workMode`: `WorkMode` Prisma enum (`ONSITE`, `REMOTE`, `HYBRID`, `UNKNOWN`).
- `skills`: String array representing up to 8 core technical requirements.
- `confidence`: Float between `0.0` and `1.0`.

---

## 4. Cost and Usage Calculation Model

### Gemini 2.5 Flash Pricing (Standard Tier)
- **Input Tokens**: $0.15 per 1,000,000 tokens
- **Output Tokens**: $0.60 per 1,000,000 tokens

### Cost Formulas
$$\text{Estimated Cost} = \left(\frac{\text{Input Tokens}}{1,000,000} \times 0.15\right) + \left(\frac{\text{Output Tokens}}{1,000,000} \times 0.60\right)$$

$$\text{Cost Per 1,000 Jobs} = \left(\frac{\text{Total Classification Cost}}{\text{Successfully Classified Jobs}}\right) \times 1,000$$

### Benchmark Metrics (Estimated per 1,000 jobs)
- Average input tokens per job: ~400 tokens
- Average output tokens per job: ~75 tokens
- Input cost for 1,000 jobs: $400,000 / 1,000,000 \times 0.15 = \$0.060$
- Output cost for 1,000 jobs: $75,000 / 1,000,000 \times 0.60 = \$0.045$
- **Total Projected Cost per 1,000 Jobs**: **~$0.105 USD (approx. ₹8.80 INR)**
