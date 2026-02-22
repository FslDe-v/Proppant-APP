💎 Proppant Analyzer Web App
FastAPI + React
A lightweight, high-performance web application designed to simulate and execute the proppant classification workflow. This tool bridges the gap between AI model development and end-user reporting.

🚀 The Workflow
Start Test ➔ Capture Frame ➔ Run AI Inference ➔ Visualize Results ➔ Export Report

[!NOTE]
This application is built for inference only. Model training is a separate offline process. The architecture is designed so AI developers can update models without touching the UI or API routes.

🛠️ Tech Stack
Backend: FastAPI (Python 3.10+)

Frontend: React.js

Inference: Custom AI Model Integration (via model_provider.py)

📂 Repository Structure
Plaintext
├── backend/ # FastAPI server logic
│ ├── main.py # API entry point
│ ├── ml/ # Model integration logic (Recommended)
│ ├── models/ # Model weights (.pt) - Git ignored
│ ├── runs/ # Auto-generated artifacts - Git ignored
│ └── requirements.txt # Python dependencies
├── frontend/ # React UI source code
└── sample_data/ # Dev-mode images for camera simulation
⏱️ Quick Start (Mac Development)

1. Backend Setup
   Bash
   cd backend
   python3 -m venv .venv
   source .venv/bin/activate
   pip install -r requirements.txt
   uvicorn main:app --reload --port 8000
   Health Check: http://127.0.0.1:8000/health

API Docs: http://127.0.0.1:8000/docs

2. Frontend Setup
   Bash
   cd frontend
   npm install
   npm run dev
   🧠 AI Model Integration
   Inference Contract
   To keep the UI stable, the backend expects the model to return a consistent JSON shape.

Minimum Required Fields:

JSON
{
"decision": "PASS | NEEDS_RETEST | FAIL",
"confidence": 0.92,
"mean_size_um": 650.0,
"psd_bins_um": [10, 20, 30],
"psd_counts": [1, 5, 2]
}
Recommended Implementation Pattern:
To ensure a clean separation of concerns, implement your logic in backend/ml/model_provider.py:

Python
class ModelProvider:
def load(self): # Load the model once at startup
pass

    def predict(self, image_path: str) -> dict:
        # Run inference and return the JSON contract
        pass

📊 Run Artifacts
Each test generates a local folder in backend/runs/<run_id>/ containing:

run_meta.json: Test metadata.

results/<frame_name>.json: Specific frame inference data.

export_summary.csv: Final processed report.

⚙️ Configuration
Environment Variables:
You can override the model path without editing code:
MODEL_PATH=backend/models/best.pt uvicorn main:app --reload
