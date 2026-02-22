# Proppant Analyzer Web App (FastAPI + React)

This repository contains a lightweight web application that simulates the proppant classification workflow:

**Start test → capture frame → run AI inference → show results → export report**

The software is designed so the AI developer can integrate a trained model **without changing the UI**.  
Training should happen **offline** (separate step). The web app runs **inference only**.

---

## Repository Structure

proppant-app/
backend/ # FastAPI server (camera+AI+reports)
main.py
ml/ # (recommended) model integration lives here
models/ # model weights (not committed)
runs/ # run artifacts (auto-generated, not committed)
requirements.txt
frontend/ # React UI
src/
sample_data/frames/ # dev-mode images (simulates camera input)

---

## Quick Start (Mac Dev)

### Backend

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000

Check:

http://127.0.0.1:8000/health

http://127.0.0.1:8000/docs

Frontend
cd frontend
npm install
npm run dev
Dev Mode Input (Camera Simulation)

In Mac dev mode, the backend reads images from:

sample_data/frames/

Add a few images there (.jpg / .png) to test the full flow.

Run Artifacts (Outputs)

Each test creates a run folder:

backend/runs/<run_id>/run_meta.json

backend/runs/<run_id>/results/<frame_name>.json

backend/runs/<run_id>/export_summary.json

These are local artifacts and should not be committed.

AI Model Integration (Inference-Only)
Goal

Use a pre-trained model (weights file) and run inference for each test.

✅ Load model once at backend startup
✅ Run inference per request
❌ Do NOT train when the web app starts

Training is a separate offline workflow.

Where to put the model

Place weights in:

backend/models/best.pt (default)

Recommended .gitignore entries:

backend/models/*.pt

backend/runs/

backend/.venv/

frontend/node_modules/

sample_data/frames/

Environment variable (optional)

Override model path without editing code:

MODEL_PATH=backend/models/best.pt uvicorn main:app --reload --port 8000
Standard Inference Output Contract (Important)

To keep the UI stable, the backend expects inference to return a consistent JSON shape.

Minimum required fields
{
  "decision": "PASS|NEEDS_RETEST|FAIL",
  "confidence": 0.0,
  "mean_size_um": 0.0,
  "psd_bins_um": [10,20,30],
  "psd_counts": [1,5,2]
}
Recommended extra fields (for full UI metrics)
{
  "in_spec_pct": 0.0,
  "oversize_pct": 0.0,
  "fines_pct": 0.0,
  "overlay_path": null
}
Decision rule (must be enforced)

Output PASS only if confidence ≥ 0.90

Otherwise output NEEDS_RETEST

Recommended Integration Pattern (Clean Separation)

To keep backend/main.py clean, implement the model logic in:

backend/ml/model_provider.py

Suggested interface:

class ModelProvider:
    def load(self): ...
    def predict(self, image_path: str) -> dict: ...

The backend should:

load the model once at startup

call predict(image_path) inside /run/infer

This allows the AI developer to modify model logic freely without touching API routes.
```
