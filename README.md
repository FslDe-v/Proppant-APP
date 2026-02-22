# Proppant Analyzer Web App (FastAPI + React)

A lightweight web application for **proppant particle analysis** with a simple operator workflow:

**Start Test → Capture Frame → Run AI Inference → Display Results → Export Report**

This project is designed so the **AI model is integrated as inference-only** (no training when the web app starts). Training happens offline, and the app loads a pre-trained weights file at backend startup.

---

## What’s in this repo

- **Frontend (React):** Operator UI (wizard-style pages + results dashboard)
- **Backend (FastAPI):** Run orchestration, frame input (dev camera simulation), AI inference endpoint, run logging, export
- **Dev mode input:** Static images in `sample_data/frames/` to simulate camera frames on a Mac

---

## Repository structure

proppant-app/
backend/
main.py # FastAPI server
requirements.txt # backend Python dependencies
models/ # model weights (NOT committed)
runs/ # run outputs (auto-generated, NOT committed)
ml/ # (recommended) model integration module
frontend/
src/ # React pages/components
sample_data/
frames/ # dev-mode images (simulates camera input)
.gitignore
README.md

---

## Quick start (Mac dev)

### 1) Backend (FastAPI)

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

# Verify:

http://127.0.0.1:8000/health

http://127.0.0.1:8000/docs

## 2) Frontend (React)

```bash
cd frontend
npm install
npm run dev
```

---

## Dev mode camera simulation (Mac)

In development, the backend reads images from:

sample_data/frames/

Add a few .jpg / .png images there to simulate camera frames.

---

## API overview

# Health check

- \*\*GET /health

# Create a new run

- \*\*POST /run/start

```bash
{ "batch_id": "BATCH 54" }
```

# Get a frame (dev mode)

- \*\*GET /run/{run_id}/frame

# Run inference (AI model)

- \*\*POST /run/infer

```bash
{ "run_id": "abcd1234", "frame_name": "frame1.jpg" }
```

# Export (dev mode)

- \*\*POST /run/{run_id}/export

# Model status

- \*\*GET /model/status

---

## Run outputs (saved artifacts)

# Each test creates a run folder:

- \*\*backend/runs/<run_id>/run_meta.json

- \*\*backend/runs/<run_id>/results/<frame_name>.json

- \*\*backend/runs/<run_id>/export_summary.json

These are local artifacts and should not be committed.

---

## AI Model Integration (Inference-only)

# Key rule

✅ Load a pre-trained model once at backend startup
✅ Run inference per request
❌ Do not train when the web app starts

Training is done offline (separate process), and only the trained weights are used by the web app.

---

#### Where to place model weights

# Default location:

- \*\*backend/models/best.pt
  The backend should load this file at startup and keep the model in memory.

# Optional environment variable

- \*\*Override model path without editing code:

```bash
MODEL_PATH=backend/models/best.pt uvicorn main:app --reload --port 8000
```

---

## Integration contract (stable output schema)

To keep the UI stable, inference must return a consistent JSON structure.

# Minimum required fields

```bash
{
"decision": "PASS|NEEDS_RETEST|FAIL",
"confidence": 0.0,
"mean_size_um": 0.0,
"psd_bins_um": [10, 20, 30],
"psd_counts": [1, 5, 2]
}
```

# Recommended fields (for full results UI)

```bash
{
"in_spec_pct": 0.0,
"oversize_pct": 0.0,
"fines_pct": 0.0,
"overlay_path": null
}
```

# Decision rule (must be enforced)

- \*\*Output PASS only if confidence ≥ 0.90

- \*\*Otherwise output NEEDS_RETEST

- \*\*(Optional) FAIL can be used for explicit standard violations if your logic needs it

---

## Recommended code structure for easy integration

To keep backend/main.py clean, do not embed model logic directly inside endpoints.

Instead, place all model code in:

- \*\*backend/ml/model_provider.py

# Suggested interface

```python
class ModelProvider:
    def load(self) -> None:
        """Load weights into memory once."""
        ...

    def predict(self, image_path: str) -> dict:
        """Run inference and return the standardized output dict."""
        ...
```

# Backend behavior

- \*\*Load model once at startup (ModelProvider.load())

- \*\*Call ModelProvider.predict(image_path) inside /run/infer

- \*\*Save the returned dict into the run folder as JSON

This lets the AI developer update the model logic without touching routes or UI.

---

## Training workflow (offline)

Training does not happen in this web app.

Typical workflow:

-\*\* Prepare dataset + labels

-\*\* Train offline (on a development machine/GPU)

-\*\* Produce weights file (e.g., best.pt)

-\*\* Copy weights into backend/models/best.pt

-\*\* Restart backend to load the new weights
