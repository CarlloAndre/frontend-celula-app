import { useEffect, useState } from "react";
import { Week, WeeklyRecord, Criteria } from "../types";
import * as torneoService from "../services/torneoService";

const formatFecha = (iso: string) => {
  const d = new Date(iso);
  return d.toLocaleDateString("es-ES", { day: "2-digit", month: "short" });
};

const WeeksPage = () => {
  const [weeks, setWeeks] = useState<Week[]>([]);
  const [semanaSeleccionada, setSemanaSeleccionada] = useState<string>("");
  const [records, setRecords] = useState<WeeklyRecord[]>([]);
  const [criterios, setCriterios] = useState<Criteria[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingRecords, setLoadingRecords] = useState(false);

  useEffect(() => {
    cargarSemanas();
    cargarCriterios();
  }, []);

  useEffect(() => {
    if (semanaSeleccionada) cargarRecords(semanaSeleccionada);
  }, [semanaSeleccionada]);

  const cargarCriterios = async () => {
    const data = await torneoService.getCriteria();
    setCriterios(data.filter((c) => c.activo));
  };

  const cargarSemanas = async () => {
    try {
      setLoading(true);
      const data = await torneoService.getWeeks();
      setWeeks(data);
      if (data.length > 0) setSemanaSeleccionada(data[0]._id);
    } finally {
      setLoading(false);
    }
  };

  const cargarRecords = async (weekId: string) => {
    try {
      setLoadingRecords(true);
      const data = await torneoService.getRecordsByWeek(weekId);
      const soloActivos = data.filter((r) => {
        const participante = r.participantId as any;
        return participante?.activo !== false;
      });
      setRecords(soloActivos);
    } finally {
      setLoadingRecords(false);
    }
  };

  // Columnas = todos los criterios activos, no solo los que aparecen guardados
  const criteriosColumnas = criterios;

  const semanaActual = weeks.find((w) => w._id === semanaSeleccionada);

  return (
    <div className="app-shell">
      <p className="eyebrow">Historial</p>
      <h1 className="page-title">Semanas del torneo</h1>
      <p className="page-subtitle">
        Revisa qué hizo cada participante semana por semana detalladamente.
      </p>

      {loading && <p>Cargando...</p>}

      {!loading && weeks.length === 0 && (
        <div className="card empty-state">
          <p>Aún no se ha creado ninguna semana.</p>
        </div>
      )}

      {!loading && weeks.length > 0 && (
        <>
          <div className="week-selector">
            <select
              className="input week-select"
              value={semanaSeleccionada}
              onChange={(e) => setSemanaSeleccionada(e.target.value)}
            >
              {weeks.map((w) => (
                <option key={w._id} value={w._id}>
                  {w.etiqueta}
                </option>
              ))}
            </select>
          </div>

          {semanaActual && (
            <p className="week-range">
              {formatFecha(semanaActual.fechaInicio)} – {formatFecha(semanaActual.fechaFin)}
            </p>
          )}

          {loadingRecords && <p>Cargando detalle...</p>}

          {!loadingRecords && records.length === 0 && (
            <div className="card empty-state">
              <p>Todavía no se han registrado puntos para esta semana.</p>
            </div>
          )}

          {!loadingRecords && records.length > 0 && (
            <div className="card table-wrapper">
              <table className="week-table">
                <thead>
                  <tr>
                    <th>Participante</th>
                    {criteriosColumnas.map((c) => (
                      <th key={c._id} className="th-center">
                        {c.nombre}
                      </th>
                    ))}
                    <th className="th-center">Puntos</th>
                  </tr>
                </thead>
                <tbody>
                  {records.map((r) => {
                    const participante = r.participantId as any;
                    return (
                      <tr key={r._id}>
                        <td className="td-name">{participante?.nombre}</td>
                        {criteriosColumnas.map((c) => {
                          const check = r.checks.find((chk) => {
                            const criterioChk = chk.criteriaId as Criteria | null;
                            return criterioChk && criterioChk._id === c._id;
                          });
                          return (
                            <td key={c._id} className="td-center">
                              {c.tipo === "manual" ? (
                                <span className="check-valor">{check?.valor ?? 0}</span>
                              ) : check?.marcado ? (
                                <span className="check-yes">✓</span>
                              ) : (
                                <span className="check-no">—</span>
                              )}
                            </td>
                          );
                        })}
                        <td className="td-center td-points">{r.puntosGanados}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      <style>{`
        .week-selector {
          margin-bottom: 8px;
        }
        .week-select {
          max-width: 320px;
        }
        .week-range {
          font-size: 13px;
          color: var(--color-ink-soft);
          margin-bottom: 24px;
        }
        .table-wrapper {
          overflow-x: auto;
          padding: 8px;
        }
        .week-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 14px;
        }
        .week-table th {
          text-align: left;
          padding: 12px 14px;
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          color: var(--color-ink-soft);
          border-bottom: 1.5px solid var(--color-border);
        }
        .week-table td {
          padding: 12px 14px;
          border-bottom: 1px solid var(--color-border);
        }
        .th-center, .td-center {
          text-align: center;
        }
        .td-name {
          font-weight: 600;
        }
        .check-yes {
          color: var(--color-success);
          font-weight: 700;
          font-size: 16px;
        }
        .check-no {
          color: var(--color-border);
        }
        .check-valor {
          font-weight: 700;
          color: var(--color-gold);
        }
        .td-points {
          font-family: var(--font-display);
          font-weight: 700;
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

export default WeeksPage;