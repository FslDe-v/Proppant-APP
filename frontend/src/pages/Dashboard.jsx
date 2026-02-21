import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";

export default function Dashboard() {
  const [batchId, setBatchId] = useState("BATCH 54");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const startNewTest = async () => {
    setLoading(true);
    try {
      const res = await api.post("/run/start", { batch_id: batchId });
      const runId = res.data.run_id;
      navigate(`/wizard/tray/${runId}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="shell">
      <div className="topbar">
        <div>
          <div className="appTitle">Proppant Analyzer</div>
          <div className="appSub">System Dashboard</div>
        </div>
        <div className="pill ok">Online</div>
      </div>

      <div className="grid2">
        <div className="card">
          <div className="cardHeader">
            <div className="dot" />
            <div>
              <div className="h2">System Ready</div>
              <div className="muted">Particle Size Analyzer</div>
            </div>
          </div>

          <div className="field">
            <label className="label">Batch ID</label>
            <input
              className="input"
              value={batchId}
              onChange={(e) => setBatchId(e.target.value)}
            />
          </div>

          <button
            className="btnPrimary"
            onClick={startNewTest}
            disabled={loading}
          >
            {loading ? "Starting..." : "Start New Test"}
          </button>

          <button
            className="btnGhost"
            onClick={() => alert("History page later")}
          >
            Test History (0)
          </button>

          <div className="miniStats">
            <div>
              <div className="miniLabel">Last Test</div>
              <div className="miniValue">No tests yet</div>
            </div>
            <div>
              <div className="miniLabel">Storage</div>
              <div className="miniValue">Local</div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="h2">Quick Guide</div>
          <div className="muted" style={{ marginTop: 8 }}>
            Workflow: Start → Insert Tray → Run → Results → Export
          </div>

          <div className="infoBox" style={{ marginTop: 16 }}>
            <b>Tip:</b> Keep the tray single-layer to maximize detection
            accuracy.
          </div>

          <div className="infoBox" style={{ marginTop: 12 }}>
            <b>QC Gate:</b> If blur/saturation/occlusion exceed thresholds, the
            run is rejected.
          </div>
        </div>
      </div>
    </div>
  );
}
