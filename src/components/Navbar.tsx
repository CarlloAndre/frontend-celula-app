import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTorneo } from "../context/TorneoContext";

const Navbar = () => {
  const { isAuthenticated, username, logout } = useAuth();
  const { torneo, salirDelTorneo } = useTorneo();
  const navigate = useNavigate();
  const location = useLocation();

  // En la pantalla de selección de torneo ("/") todavía no hay torneo
  // activo: mostramos una barra mínima, sin links que dependan de un slug.
  if (!torneo) {
    return (
      <nav className="navbar">
        <Link to="/" className="navbar-brand">
          <span className="navbar-icon">🏆</span> Torneos Célula
        </Link>
        <style>{navbarStyles}</style>
      </nav>
    );
  }

  const base = `/torneo/${torneo.slug}`;

  const handleLogout = () => {
    logout();
    navigate(`${base}/top`);
  };

  const handleCambiarTorneo = () => {
    salirDelTorneo();
    navigate("/");
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="navbar">
      <Link to={`${base}/top`} className="navbar-brand">
        <span className="navbar-icon">🏆</span> {torneo.nombre}
      </Link>

      <div className="navbar-links">
        <Link
          to={`${base}/top`}
          className={`navbar-link ${isActive(`${base}/top`) ? "navbar-link-active" : ""}`}
        >
          Top
        </Link>
        <Link
          to={`${base}/semanas`}
          className={`navbar-link ${isActive(`${base}/semanas`) ? "navbar-link-active" : ""}`}
        >
          Semanas
        </Link>

        {isAuthenticated ? (
          <>
            <Link
              to={`${base}/admin`}
              className={`navbar-link ${isActive(`${base}/admin`) ? "navbar-link-active" : ""}`}
            >
              Panel admin
            </Link>
            <span className="navbar-user">👤 {username}</span>
            <button className="btn btn-outline navbar-logout" onClick={handleLogout}>
              Salir
            </button>
          </>
        ) : (
          <Link to={`${base}/login`} className="btn btn-gold navbar-login">
            Acceso admin
          </Link>
        )}

        <button className="navbar-link navbar-cambiar" onClick={handleCambiarTorneo}>
          Cambiar torneo
        </button>
      </div>

      <style>{navbarStyles}</style>
    </nav>
  );
};

const navbarStyles = `
  .navbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    max-width: 960px;
    margin: 0 auto;
    padding: 22px 20px 18px;
    flex-wrap: wrap;
    gap: 12px;
  }
  .navbar-brand {
    font-family: var(--font-display);
    font-size: 20px;
    font-weight: 600;
    color: var(--color-ink);
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .navbar-icon {
    font-size: 20px;
  }
  .navbar-links {
    display: flex;
    align-items: center;
    gap: 18px;
    flex-wrap: wrap;
  }
  .navbar-link {
    font-size: 14px;
    font-weight: 600;
    color: var(--color-ink);
    padding: 8px 16px;
    border-radius: 20px;
    background: rgba(255, 255, 255, 0.75);
    border: 1px solid var(--color-border);
    transition: background 0.15s ease, color 0.15s ease, border-color 0.15s ease;
    cursor: pointer;
    font-family: inherit;
  }
  .navbar-link:hover {
    background: rgba(255, 255, 255, 0.95);
    border-color: var(--color-ink);
  }
  .navbar-link-active {
    color: var(--color-bg);
    background: var(--color-ink);
    border-color: var(--color-ink);
  }
  .navbar-cambiar {
    background: transparent;
    border-style: dashed;
    color: var(--color-ink);
    font-weight: 700;
  }
  .navbar-user {
    font-size: 13px;
    font-weight: 700;
    color: var(--color-ink);
  } 
  @media (max-width: 600px) {
    .navbar-links {
      gap: 12px;
    }
  }
`;

export default Navbar;