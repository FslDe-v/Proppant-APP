import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../api";

export default function Running() {
  const { runId } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("Capturing frame...");
  const [progress, setProgress] = useState(10);

  useEffect(() => {
    const run = async () => {
      try {
        setStatus("Capturing frame...");
        setProgress(25);
        const frameRes = await api.get(`/run/${runId}/frame`);
        const frameName = frameRes.data.frame_name;

        setStatus("Running inference...");
        setProgress(60);
        await api.post("/run/infer", { run_id: runId, frame_name: frameName });

        setStatus("Finalizing report...");
        setProgress(85);
        setTimeout(() => navigate(`/results/${runId}`), 500);
      } catch (e) {
        console.error(e);
        setStatus("Error during run (check backend).");
        setProgress(0);
      }
    };
    run();
  }, [runId, navigate]);

  return (
    <div className="shell">
      <div className="topbar">
        <div>
          <div className="appTitle">Processing</div>
          <div className="appSub">Run ID: {runId}</div>
        </div>
      </div>

      <div className="card">
        <div className="h2">{status}</div>
        <div className="muted" style={{ marginTop: 8 }}>
          Please wait while the system completes image capture and analysis.
        </div>

        <div className="progressWrap">
          <div className="progressBar" style={{ width: `${progress}%` }} />
        </div>

        <div className="muted" style={{ marginTop: 10 }}>
          {progress}%
        </div>
      </div>
    </div>
  );
}
