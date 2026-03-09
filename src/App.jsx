import PhaserCanvas from "./components/PhaserCanvas";
import SocketTesting from "./components/SocketTesting";
import { Routes, Route } from "react-router-dom";

export default function App() {
  return (
    <Routes>
      {/* Default Game View at http://localhost:5173/ */}
      <Route path="/" element={<PhaserCanvas />} />

      {/*  Test View for socket debuggint at http://localhost:5173/socket */}
      <Route path="/socket" element={<SocketTesting />} />
    </Routes>
  );
}
