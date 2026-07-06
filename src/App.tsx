import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { TorneoProvider } from "./context/TorneoContext";
import { AuthProvider } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import TorneoResolver from "./components/TorneoResolver";
import SeleccionarTorneoPage from "./pages/SeleccionarTorneoPage";
import HomePage from "./pages/HomePage";
import WeeksPage from "./pages/WeeksPage";
import LoginPage from "./pages/LoginPage";
import AdminPage from "./pages/AdminPage";
import "./styles/global.css";

function App() {
  return (
    <TorneoProvider>
      <AuthProvider>
        <BrowserRouter>
          <Navbar />
          <Routes>
            {/* Pantalla inicial: siempre se pregunta qué torneo ver */}
            <Route path="/" element={<SeleccionarTorneoPage />} />

            {/* Todo lo que ya existía, ahora anidado bajo el torneo elegido */}
            <Route path="/torneo/:slug" element={<TorneoResolver />}>
              <Route index element={<Navigate to="top" replace />} />
              <Route path="top" element={<HomePage />} />
              <Route path="semanas" element={<WeeksPage />} />
              <Route path="login" element={<LoginPage />} />
              <Route
                path="admin"
                element={
                  <ProtectedRoute>
                    <AdminPage />
                  </ProtectedRoute>
                }
              />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TorneoProvider>
  );
}

export default App;
