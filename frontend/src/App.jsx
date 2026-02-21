import { Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import PlaceTray from "./pages/PlaceTray";
import Running from "./pages/Running";
import Results from "./pages/Results";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/wizard/tray/:runId" element={<PlaceTray />} />
      <Route path="/wizard/run/:runId" element={<Running />} />
      <Route path="/results/:runId" element={<Results />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
