import { useNavigate, useParams } from "react-router-dom";
import { api } from "../api";

export default function PlaceTray() {
  const { runId } = useParams();
  const navigate = useNavigate();

  return (
    <div className="shell">
      <div className="topbar">
        <div>
          <div className="appTitle">Place Sample Tray</div>
          <div className="appSub">Run ID: {runId}</div>
        </div>
        <button className="btnGhost" onClick={() => navigate("/")}>
          ← Back
        </button>
      </div>

      <div className="card">
        <div className="h2">Insert tray and close the door</div>
        <div className="muted" style={{ marginTop: 8 }}>
          (Dev mode) Click the button below to simulate tray insertion.
        </div>

        <div className="dropZone">
          <div className="dropIcon">▢</div>
          <div className="dropTitle">Waiting for tray</div>
          <div className="muted">Insert sample tray into loading bay</div>
        </div>

        <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
          <button
            className="btnPrimary"
            onClick={() => navigate(`/wizard/run/${runId}`)}
          >
            Simulate Tray Insertion
          </button>
          <button className="btnGhost" onClick={() => navigate("/")}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
