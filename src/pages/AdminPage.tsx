import { useEffect, useState } from "react";
import { Participant, Criteria, Week, WeeklyRecord } from "../types";
import * as torneoService from "../services/torneoService";
import CheckGrid from "../components/CheckGrid";
import CriteriaManager from "../components/CriteriaManager";
import ParticipantManager from "../components/ParticipantManager";
import WeekManager from "../components/WeekManager";

type Tab = "puntos" | "participantes" | "criterios" | "semanas";

const AdminPage = () => {
  const [tab, setTab] = useState<Tab>("puntos");

  const [participantes, setParticipantes] = useState<Participant[]>([]);
  const [criterios, setCriterios] = useState<Criteria[]>([]);
  const [weeks, setWeeks] = useState<Week[]>([]);
  const [weekSeleccionada, setWeekSeleccionada] = useState<string>("");
  const [records, setRecords] = useState<WeeklyRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarTodo();
  }, []);

  useEffect(() => {
    if (weekSeleccionada) cargarRecords(weekSeleccionada);
  }, [weekSeleccionada]);

  const cargarTodo = async () => {
    try {
      setLoading(true);
      const [p, c, w] = await Promise.all([
        torneoService.getAllParticipants(),
        torneoService.getCriteria(),
        torneoService.getWeeks(),
      ]);
      setParticipantes(p);
      setCriterios(c);
      setWeeks(w);
      if (w.length > 0) setWeekSeleccionada(w[0]._id);
    } finally {
      setLoading(false);
    }
  };

  const cargarRecords = async (weekId: string) => {
    const data = await torneoService.getRecordsByWeek(weekId);
    setRecords(data);
  };

  const recargarParticipantes = async () => {
    const p = await torneoService.getAllParticipants();
    setParticipantes(p);
  };

  const recargarCriterios = async () => {
    const c = await torneoService.getCriteria();
    setCriterios(c);
  };

  const [editandoSemanaId, setEditandoSemanaId] = useState<string | null>(null);
  const [editEtiqueta, setEditEtiqueta] = useState("");

  const iniciarEdicionSemana = (w: Week) => {
    setEditandoSemanaId(w._id);
    setEditEtiqueta(w.etiqueta);
  };

  const guardarEdicionSemana = async (id: string) => {
    if (!editEtiqueta.trim()) return;
    const actualizada = await torneoService.updateWeek(id, { etiqueta: editEtiqueta.trim() });
    setWeeks((prev) => prev.map((w) => (w._id === id ? actualizada : w)));
    setEditandoSemanaId(null);
  };

  const eliminarSemana = async (id: string) => {
    if (!confirm("¿Seguro que querés eliminar esta semana? Se perderán los puntos registrados en ella.")) return;
    await torneoService.deleteWeek(id);
    const nuevas = weeks.filter((w) => w._id !== id);
    setWeeks(nuevas);
    if (weekSeleccionada === id) {
      setWeekSeleccionada(nuevas.length > 0 ? nuevas[0]._id : "");
    }
  };

  const handleWeekCreada = (nueva: Week) => {
    setWeeks((prev) => [nueva, ...prev]);
    setWeekSeleccionada(nueva._id);
    setTab("puntos");
  };

  const handleGuardadoCheck = () => {
    cargarRecords(weekSeleccionada);
    recargarParticipantes();
  };

  const criteriosActivos = criterios.filter((c) => c.activo);
  const participantesActivos = participantes.filter((p) => p.activo);

  return (
    <div className="app-shell">
      <p className="eyebrow">Panel privado</p>
      <h1 className="page-title">Panel de administración</h1>
      <p className="page-subtitle">
        Marca los puntos semanales, gestiona criterios y participantes.
      </p>

      <div className="admin-tabs">
        <button
          className={`admin-tab ${tab === "puntos" ? "admin-tab-active" : ""}`}
          onClick={() => setTab("puntos")}
        >
          Marcar puntos
        </button>
        <button
          className={`admin-tab ${tab === "semanas" ? "admin-tab-active" : ""}`}
          onClick={() => setTab("semanas")}
        >
          Semanas
        </button>
        <button
          className={`admin-tab ${tab === "participantes" ? "admin-tab-active" : ""}`}
          onClick={() => setTab("participantes")}
        >
          Participantes
        </button>
        <button
          className={`admin-tab ${tab === "criterios" ? "admin-tab-active" : ""}`}
          onClick={() => setTab("criterios")}
        >
          Criterios
        </button>
      </div>

      {loading ? (
        <p>Cargando...</p>
      ) : (
        <>
          {tab === "puntos" && (
            <div>
              {weeks.length === 0 ? (
                <div className="card empty-state">
                  <p>
                    Todavía no hay semanas creadas. Ve a la pestaña "Semanas" para
                    crear la primera.
                  </p>
                </div>
              ) : (
                <>
                  <div className="week-selector">
                    <select
                      className="input week-select"
                      value={weekSeleccionada}
                      onChange={(e) => setWeekSeleccionada(e.target.value)}
                    >
                      {weeks.map((w) => (
                        <option key={w._id} value={w._id}>
                          {w.etiqueta}
                        </option>
                      ))}
                    </select>
                  </div>
                  <CheckGrid
                    weekId={weekSeleccionada}
                    participantes={participantesActivos}
                    criterios={criteriosActivos}
                    recordsExistentes={records}
                    onGuardado={handleGuardadoCheck}
                  />
                </>
              )}
            </div>
          )}

          {tab === "semanas" && (
            <div className="card section-card">
              <h2 className="section-title">Crear nueva semana</h2>
              <WeekManager onCreada={handleWeekCreada} />
              <h3 className="section-subtitle">Semanas existentes</h3>
              <table className="weeks-table">
                <thead>
                  <tr>
                    <th>Etiqueta</th>
                    <th>Inicio</th>
                    <th>Fin</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {weeks.map((w) => (
                    <tr key={w._id}>
                      <td>
                        {editandoSemanaId === w._id ? (
                          <input
                            className="input"
                            value={editEtiqueta}
                            onChange={(e) => setEditEtiqueta(e.target.value)}
                            autoFocus
                          />
                        ) : (
                          w.etiqueta
                        )}
                      </td>
                      <td>{new Date(w.fechaInicio).toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "numeric" })}</td>
                      <td>{new Date(w.fechaFin).toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "numeric" })}</td>
                      <td style={{ display: "flex", gap: "6px" }}>
                        {editandoSemanaId === w._id ? (
                          <>
                            <button className="btn btn-gold btn-small" onClick={() => guardarEdicionSemana(w._id)}>Guardar</button>
                            <button className="btn btn-outline btn-small" onClick={() => setEditandoSemanaId(null)}>Cancelar</button>
                          </>
                        ) : (
                          <>
                            <button className="btn btn-outline btn-small" onClick={() => iniciarEdicionSemana(w)}>Editar</button>
                            <button className="btn btn-danger btn-small" onClick={() => eliminarSemana(w._id)}>Eliminar</button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {tab === "participantes" && (
            <div className="card section-card">
              <h2 className="section-title">Participantes del torneo</h2>
              <ParticipantManager
                participantes={participantes}
                onCambio={recargarParticipantes}
              />
            </div>
          )}

          {tab === "criterios" && (
            <div className="card section-card">
              <h2 className="section-title">Criterios de puntuación</h2>
              <CriteriaManager criterios={criterios} onCambio={recargarCriterios} />
            </div>
          )}
        </>
      )}

      <style>{`
        .admin-tabs {
          display: flex;
          gap: 8px;
          margin-bottom: 24px;
          flex-wrap: wrap;
        }
        .admin-tab {
          background: transparent;
          border: 1.5px solid var(--color-border);
          border-radius: 20px;
          padding: 8px 16px;
          font-size: 13px;
          font-weight: 600;
          color: var(--color-ink-soft);
        }
        .admin-tab-active {
          background: var(--color-ink);
          color: var(--color-bg);
          border-color: var(--color-ink);
        }
        .section-card {
          padding: 28px;
        }
        .section-title {
          font-family: var(--font-display);
          font-size: 20px;
          margin: 0 0 18px;
        }
        .section-subtitle {
          font-size: 14px;
          color: var(--color-ink-soft);
          margin: 28px 0 10px;
        }
        .week-select {
          max-width: 320px;
          margin-bottom: 16px;
        }
        .weeks-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 14px;
          margin-top: 8px;
        }
        .weeks-table th {
          text-align: left;
          padding: 10px 12px;
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          color: var(--color-ink-soft);
          border-bottom: 1.5px solid var(--color-border);
        }
        .weeks-table td {
          padding: 10px 12px;
          border-bottom: 1px solid var(--color-border);
        }
        .week-selector {
          margin-bottom: 18px;
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

export default AdminPage;