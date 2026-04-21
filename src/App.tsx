import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AppLayout } from "./components/layout/AppLayout";
import { Home } from "./pages/Home";
import { DoctorEditor } from "./pages/DoctorEditor";
import { AdminDashboard } from "./pages/AdminDashboard";
import { Tools } from "./pages/Tools";
import { Favorites } from "./pages/Favorites";
import { Login } from "./pages/Login";
import { Register } from "./pages/Register";
import { AuthProvider } from "./lib/auth";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<AppLayout />}>
            <Route index element={<Home />} />
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />
            <Route path="tools" element={<Tools />} />
            <Route 
              path="favorites" 
              element={
                <ProtectedRoute>
                  <Favorites />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="doctor/editor" 
              element={
                <ProtectedRoute allowedRoles={["DOCTOR", "ADMIN"]}>
                  <DoctorEditor />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="admin/dashboard" 
              element={
                <ProtectedRoute allowedRoles={["ADMIN"]}>
                  <AdminDashboard />
                </ProtectedRoute>
              } 
            />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

