import { useEffect, useState } from "react";
import { Participant } from "../types";
import * as torneoService from "../services/torneoService";
import Podium from "../components/Podium";
import RankingList from "../components/RankingList";

const HomePage = () => {
  const [participantes, setParticipantes] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    cargarTop();
  }, []);

  const cargarTop = async () => {
    try {
      setLoading(true);
      const data = await torneoService.getLeaderboard();
      setParticipantes(data);
    } catch (err) {
      setError("No se pudo cargar el top. Verifica que el servidor esté corriendo.");
    } finally {
      setLoading(false);
    }
  };

  const top3 = participantes.slice(0, 3);
  const resto = participantes.slice(3);
  const maxPuntos = participantes[0]?.puntosTotales || 1;

  return (
    <div className="app-shell">
      <p className="eyebrow">Tabla de posiciones</p>
      <h1 className="page-title">Top del Torneo</h1>
      <p className="page-subtitle">
        Así va la competencia hasta el momento. Los puntos se actualizan cada
        semana, asi que no faltes a la celula.
      </p>

      {loading && <p>Cargando...</p>}
      {error && <p className="error-text">{error}</p>}

      {!loading && !error && participantes.length === 0 && (
        <div className="card empty-state">
          <p>Todavía no hay participantes registrados.</p>
        </div>
      )}

      {!loading && !error && participantes.length > 0 && (
        <>
          <Podium top3={top3} />
          <RankingList resto={resto} maxPuntos={maxPuntos} offset={4} />
        </>
      )}

      <style>{`
        .empty-state {
          padding: 32px;
          text-align: center;
          color: var(--color-ink-soft);
        }
      `}</style>
    </div>
  );
};

export default HomePage;
