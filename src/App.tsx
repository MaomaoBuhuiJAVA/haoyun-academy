import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AppLayout } from "./components/layout/AppLayout";
import { Home } from "./pages/Home";
import { DoctorEditor } from "./pages/DoctorEditor";
import { AdminDashboard } from "./pages/AdminDashboard";
import { Tools } from "./pages/Tools";
import { Favorites } from "./pages/Favorites";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<AppLayout />}>
          <Route index element={<Home />} />
          <Route path="tools" element={<Tools />} />
          <Route path="favorites" element={<Favorites />} />
          <Route path="doctor/editor" element={<DoctorEditor />} />
          <Route path="admin/dashboard" element={<AdminDashboard />} />
        </Route>
      </Routes>
    </Router>
  );
}

