import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const { isAuthenticated, username, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">
        <span className="navbar-icon">🏆</span> Torneo Semanal
      </Link>

      <div className="navbar-links">
        <Link
          to="/"
          className={`navbar-link ${isActive("/") ? "navbar-link-active" : ""}`}
        >
          Top
        </Link>
        <Link
          to="/semanas"
          className={`navbar-link ${
            isActive("/semanas") ? "navbar-link-active" : ""
          }`}
        >
          Semanas
        </Link>

        {isAuthenticated ? (
          <>
            <Link
              to="/admin"
              className={`navbar-link ${
                isActive("/admin") ? "navbar-link-active" : ""
              }`}
            >
              Panel admin
            </Link>
            <span className="navbar-user">👤 {username}</span>
            <button className="btn btn-outline navbar-logout" onClick={handleLogout}>
              Salir
            </button>
          </>
        ) : (
          <Link to="/login" className="btn btn-gold navbar-login">
            Acceso admin
          </Link>
        )}
      </div>

      <style>{`
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
          font-weight: 500;
          color: var(--color-ink-soft);
          padding-bottom: 4px;
          border-bottom: 2px solid transparent;
        }
        .navbar-link-active {
          color: var(--color-ink);
          border-bottom-color: var(--color-gold);
        }
        .navbar-user {
          font-size: 13px;
          color: var(--color-ink-soft);
        }
        @media (max-width: 600px) {
          .navbar-links {
            gap: 12px;
          }
        }
      `}</style>
    </nav>
  );
};

export default Navbar;
