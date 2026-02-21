from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from pathlib import Path
import uuid, json, time
from typing import List, Dict, Any
from ultralytics import YOLO
import cv2


APP_ROOT = Path(__file__).resolve().parent
PROJECT_ROOT = APP_ROOT.parent
SAMPLE_FRAMES_DIR = PROJECT_ROOT / "sample_data" / "frames"
RUNS_DIR = APP_ROOT / "runs"
MODEL_PATH = APP_ROOT / "models" / "best.pt"
yolo_model = None
RUNS_DIR.mkdir(exist_ok=True)

app = FastAPI(title="Proppant CV Backend (Mac Dev Mode)")
from fastapi.middleware.cors import CORSMiddleware
@app.on_event("startup")
def load_model():
    global yolo_model
    print(f"Loading YOLO model from: {MODEL_PATH}")
    yolo_model = YOLO(str(MODEL_PATH))
    print("✅ Model loaded")

app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r"^http://(localhost|127\.0\.0\.1):\d+$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class StartRunReq(BaseModel):
    batch_id: str

class StartRunRes(BaseModel):
    run_id: str
    created_at: float

class FrameRes(BaseModel):
    run_id: str
    frame_name: str
    frame_path: str

class InferReq(BaseModel):
    run_id: str
    frame_name: str

class InferRes(BaseModel):
    run_id: str
    decision: str  # PASS | NEEDS_RETEST | FAIL (optional)
    confidence: float
    psd_bins_um: List[int]
    psd_counts: List[int]
    mean_size_um: float

def list_frames() -> List[Path]:
    if not SAMPLE_FRAMES_DIR.exists():
        return []
    frames = sorted([p for p in SAMPLE_FRAMES_DIR.iterdir() if p.suffix.lower() in [".jpg", ".jpeg", ".png"]])
    return frames

def run_dir(run_id: str) -> Path:
    d = RUNS_DIR / run_id
    d.mkdir(parents=True, exist_ok=True)
    (d / "frames").mkdir(exist_ok=True)
    (d / "results").mkdir(exist_ok=True)
    return d

@app.get("/health")
def health():
    return {"ok": True}

@app.post("/run/start", response_model=StartRunRes)
def start_run(req: StartRunReq):
    run_id = str(uuid.uuid4())[:8]
    d = run_dir(run_id)

    meta = {
        "run_id": run_id,
        "batch_id": req.batch_id,
        "created_at": time.time(),
        "mode": "mac_dev_folder_frames",
    }
    (d / "run_meta.json").write_text(json.dumps(meta, indent=2))
    return StartRunRes(run_id=run_id, created_at=meta["created_at"])

@app.get("/run/{run_id}/frame", response_model=FrameRes)
def get_next_frame(run_id: str):
    """
    Dev-mode: just returns the next frame name/path from sample_data/frames
    (Later, this becomes real camera capture on Pi.)
    """
    frames = list_frames()
    if not frames:
        return FrameRes(run_id=run_id, frame_name="NONE", frame_path="No frames found in sample_data/frames")

    # Very simple: pick first frame always (or rotate if you want)
    frame = frames[0]
    return FrameRes(run_id=run_id, frame_name=frame.name, frame_path=str(frame))

@app.post("/run/infer", response_model=InferRes)
def infer(req: InferReq):
    global yolo_model
    if yolo_model is None:
        raise RuntimeError("Model not loaded")

    # Load frame image (dev-mode: from sample_data/frames)
    frame_path = SAMPLE_FRAMES_DIR / req.frame_name
    img = cv2.imread(str(frame_path))
    if img is None:
        raise RuntimeError(f"Could not read image: {frame_path}")

    # Run YOLO segmentation inference
    results = yolo_model.predict(img, verbose=False)
    r0 = results[0]

    # Count detections and compute mean confidence (basic example)
    det_count = 0 if r0.boxes is None else len(r0.boxes)
    confidence = float(r0.boxes.conf.mean().item()) if det_count > 0 else 0.0

    # Confidence gating decision (your spec)
    decision = "PASS" if confidence >= 0.90 else "NEEDS_RETEST"

    # TODO later: compute PSD from masks properly
    psd_bins_um = [10,20,30,40,50,60,70,80,90,100,110,120,130,140]
    psd_counts  = [0,1,2,3,6,10,18,24,30,26,15,6,2,1]
    mean_size_um = 100.0

    out = InferRes(
        run_id=req.run_id,
        decision=decision,
        confidence=round(confidence, 3),
        psd_bins_um=psd_bins_um,
        psd_counts=psd_counts,
        mean_size_um=mean_size_um,
    )

    # Save result JSON to backend/runs/<runId>/results/
    d = run_dir(req.run_id)
    (d / "results" / f"{req.frame_name}.json").write_text(json.dumps(out.model_dump(), indent=2))

    return out

@app.get("/model/status")
def model_status():
    return {
        "loaded": yolo_model is not None,
        "path": str(MODEL_PATH),
    }
@app.post("/run/{run_id}/export")
def export_run(run_id: str) -> Dict[str, Any]:
    """
    Dev-mode: export a summary JSON (later: CSV/PDF).
    """
    d = run_dir(run_id)
    results_dir = d / "results"
    result_files = sorted(results_dir.glob("*.json"))

    summary = {
        "run_id": run_id,
        "exported_at": time.time(),
        "results_files": [f.name for f in result_files],
    }
    (d / "export_summary.json").write_text(json.dumps(summary, indent=2))
    return {"ok": True, "export_path": str(d / "export_summary.json")}
