import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Torneo } from "../types";
import * as torneoService from "../services/torneoService";
import { useTorneo } from "../context/TorneoContext";

const SeleccionarTorneoPage = () => {
  const [torneos, setTorneos] = useState<Torneo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { seleccionarTorneo } = useTorneo();
  const navigate = useNavigate();

  useEffect(() => {
    cargarTorneos();
  }, []);

  const cargarTorneos = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await torneoService.getTorneos();
      setTorneos(data);
    } catch {
      setError("No se pudo cargar la lista de torneos. Verifica que el servidor esté corriendo.");
    } finally {
      setLoading(false);
    }
  };

  const handleElegir = (torneo: Torneo) => {
    seleccionarTorneo(torneo);
    navigate(`/torneo/${torneo.slug}/top`);
  };

  return (
    <div className="app-shell selector-shell">
      <p className="eyebrow">Bienvenido</p>
      <h1 className="page-title">¿A qué torneo quieres entrar?</h1>
      <p className="page-subtitle">
        Elige uno de los torneos activos para ver su tabla de posiciones y su
        historial de semanas.
      </p>

      {loading && <p>Cargando torneos...</p>}
      {error && <p className="error-text">{error}</p>}

      {!loading && !error && torneos.length === 0 && (
        <div className="card empty-state">
          <p>Todavía no hay torneos creados.</p>
        </div>
      )}

      {!loading && !error && torneos.length > 0 && (
        <div className="torneo-grid">
          {torneos.map((t) => (
            <button
              key={t._id}
              className="card torneo-card"
              onClick={() => handleElegir(t)}
            >
              <span className="torneo-icon">🏆</span>
              <span className="torneo-nombre">{t.nombre}</span>
              <span className="torneo-cta">Entrar →</span>
            </button>
          ))}
        </div>
      )}

      <style>{`
        .selector-shell {
          max-width: 720px;
        }
        .torneo-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 16px;
          margin-top: 8px;
        }
        .torneo-card {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 10px;
          padding: 28px 24px;
          text-align: left;
          border: 1.5px solid var(--color-border);
          background: var(--color-card);
          transition: border-color 0.15s ease, transform 0.15s ease;
        }
        .torneo-card:hover {
          border-color: var(--color-gold);
          transform: translateY(-2px);
        }
        .torneo-icon {
          font-size: 28px;
        }
        .torneo-nombre {
          font-family: var(--font-display);
          font-size: 20px;
          font-weight: 600;
          color: var(--color-ink);
        }
        .torneo-cta {
          font-size: 13px;
          font-weight: 600;
          color: var(--color-gold);
        }
        .empty-state {
          padding: 32px;
          text-align: center;
          color: var(--color-ink-soft);
        }
      `}</style>
    </div>
  );
};

export default SeleccionarTorneoPage;
