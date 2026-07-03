import { useState, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const LoginPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(username, password);
      navigate("/admin");
    } catch (err) {
      setError("Usuario o contraseña incorrectos.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-shell login-shell">
      <div className="card login-card">
        <p className="eyebrow">Acceso restringido</p>
        <h1 className="page-title login-title">Entrar como admin</h1>
        <p className="page-subtitle">
          Solo el organizador del torneo puede asignar puntos.
        </p>

        <form onSubmit={handleSubmit}>
          <label className="field-label" htmlFor="username">
            Usuario
          </label>
          <input
            id="username"
            className="input"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            autoFocus
          />

          <label className="field-label" htmlFor="password">
            Contraseña
          </label>
          <input
            id="password"
            type="password"
            className="input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {error && <p className="error-text">{error}</p>}

          <button
            type="submit"
            className="btn btn-primary login-submit"
            disabled={loading}
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>
      </div>

      <style>{`
        .login-shell {
          display: flex;
          justify-content: center;
          padding-top: 48px;
        }
        .login-card {
          padding: 36px;
          width: 100%;
          max-width: 400px;
        }
        .login-title {
          font-size: 28px;
        }
        .field-label {
          display: block;
          font-size: 13px;
          font-weight: 600;
          margin: 16px 0 6px;
          color: var(--color-ink-soft);
        }
        .login-submit {
          width: 100%;
          margin-top: 22px;
        }
      `}</style>
    </div>
  );
};

export default LoginPage;
