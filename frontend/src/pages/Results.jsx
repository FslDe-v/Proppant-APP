import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../api";

export default function Results() {
  const { runId } = useParams();
  const navigate = useNavigate();
  const [result, setResult] = useState(null);

  useEffect(() => {
    // In dev, we saved result JSON on backend, but we didn't create a GET endpoint.
    // For now, we just fake it by calling infer again OR you can add /run/{id}/latest later.
    const load = async () => {
      const frameRes = await api.get(`/run/${runId}/frame`);
      const frameName = frameRes.data.frame_name;
      const inferRes = await api.post("/run/infer", {
        run_id: runId,
        frame_name: frameName,
      });
      setResult(inferRes.data);
    };
    load();
  }, [runId]);

  const exportRun = async () => {
    await api.post(`/run/${runId}/export`);
    alert("Export created in backend/runs/<runId>/export_summary.json");
  };

  if (!result) return null;

  return (
    <div className="shell">
      <div className="topbar">
        <div>
          <div className="appTitle">Results</div>
          <div className="appSub">Run ID: {runId}</div>
        </div>
        <button className="btnGhost" onClick={() => navigate("/")}>
          Home
        </button>
      </div>

      <div className="card">
        <div className="resultsRow">
          <div
            className={`pill ${result.decision === "PASS" ? "pass" : "warn"}`}
          >
            {result.decision}
          </div>
          <div className="muted">Confidence: {result.confidence}</div>
        </div>

        <div className="metrics3">
          <div className="metric">
            <div className="miniLabel">In-Spec</div>
            <div className="big green">98.6%</div>
            <div className="muted">Target ≥ 85%</div>
          </div>
          <div className="metric">
            <div className="miniLabel">Oversize</div>
            <div className="big blue">0.7%</div>
            <div className="muted">Target ≤ 5%</div>
          </div>
          <div className="metric">
            <div className="miniLabel">Fines</div>
            <div className="big orange">0.7%</div>
            <div className="muted">Target ≤ 10%</div>
          </div>
        </div>

        <div className="card" style={{ marginTop: 16, borderRadius: 16 }}>
          <div className="h2">Particle Size Distribution</div>
          <div className="dropZone" style={{ height: 220 }}>
            (Next: real chart)
          </div>
          <div className="muted" style={{ marginTop: 8 }}>
            Mean particle size: <b>{result.mean_size_um} μm</b>
          </div>
        </div>

        <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
          <button className="btnGhost" onClick={exportRun}>
            Export
          </button>
          <button className="btnPrimary" onClick={() => navigate("/")}>
            Save & Home
          </button>
          <button className="btnBlue" onClick={() => navigate("/")}>
            New Test
          </button>
        </div>
      </div>
    </div>
  );
}
