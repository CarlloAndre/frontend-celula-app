import { useState, useEffect } from "react";
import { Participant, Criteria, WeeklyRecord } from "../types";
import * as torneoService from "../services/torneoService";

interface CheckGridProps {
  weekId: string;
  participantes: Participant[];
  criterios: Criteria[];
  recordsExistentes: WeeklyRecord[];
  onGuardado: () => void;
}

// Estado local: { participantId: { criteriaId: { marcado, valor } } }
type EstadoCelda = { marcado: boolean; valor: number };
type EstadoChecks = Record<string, Record<string, EstadoCelda>>;

const construirEstadoInicial = (
  participantes: Participant[],
  criterios: Criteria[],
  records: WeeklyRecord[]
): EstadoChecks => {
  const estado: EstadoChecks = {};

  participantes.forEach((p) => {
    estado[p._id] = {};
    criterios.forEach((c) => {
      estado[p._id][c._id] = { marcado: false, valor: 0 };
    });
  });

  records.forEach((r) => {
    const participantId =
      typeof r.participantId === "string" ? r.participantId : r.participantId?._id;
    if (!participantId) return;

    r.checks.forEach((chk) => {
      if (!chk.criteriaId) return; // criterio eliminado, ignoramos este check
      const criteriaId =
        typeof chk.criteriaId === "string" ? chk.criteriaId : chk.criteriaId._id;
      if (!criteriaId) return;
      if (estado[participantId]) {
        estado[participantId][criteriaId] = {
          marcado: chk.marcado,
          valor: chk.valor || 0,
        };
      }
    });
  });

  return estado;
};

const CheckGrid = ({
  weekId,
  participantes,
  criterios,
  recordsExistentes,
  onGuardado,
}: CheckGridProps) => {
  const [estado, setEstado] = useState<EstadoChecks>({});
  const [guardandoId, setGuardandoId] = useState<string | null>(null);
  const [guardadoOkId, setGuardadoOkId] = useState<string | null>(null);
  const [guardandoTodos, setGuardandoTodos] = useState(false);
  const [guardadoTodosOk, setGuardadoTodosOk] = useState(false);

  useEffect(() => {
    setEstado(construirEstadoInicial(participantes, criterios, recordsExistentes));
  }, [participantes, criterios, recordsExistentes, weekId]);

  const toggleCheck = (participantId: string, criteriaId: string) => {
    setEstado((prev) => ({
      ...prev,
      [participantId]: {
        ...prev[participantId],
        [criteriaId]: {
          ...prev[participantId]?.[criteriaId],
          marcado: !prev[participantId]?.[criteriaId]?.marcado,
        },
      },
    }));
  };

  const setValor = (
    participantId: string,
    criteriaId: string,
    valor: number,
    max: number
  ) => {
    let limpio = isNaN(valor) ? 0 : valor;
    if (limpio < 0) limpio = 0;
    if (limpio > max) limpio = max;
    setEstado((prev) => ({
      ...prev,
      [participantId]: {
        ...prev[participantId],
        [criteriaId]: { marcado: limpio > 0, valor: limpio },
      },
    }));
  };

  const calcularPuntos = (participantId: string): number => {
    const celdasParticipante = estado[participantId] || {};
    return criterios.reduce((total, c) => {
      const celda = celdasParticipante[c._id];
      if (!celda) return total;
      if (c.tipo === "manual") return total + celda.valor;
      return celda.marcado ? total + c.puntos : total;
    }, 0);
  };

  const guardarParticipante = async (participantId: string) => {
    try {
      setGuardandoId(participantId);
      const checks = criterios.map((c) => {
        const celda = estado[participantId]?.[c._id];
        return {
          criteriaId: c._id,
          marcado: celda?.marcado || false,
          valor: celda?.valor || 0,
        };
      });
      await torneoService.saveRecord(weekId, participantId, checks);
      setGuardadoOkId(participantId);
      setTimeout(() => setGuardadoOkId(null), 1800);
      onGuardado();
    } catch (err) {
      alert("No se pudo guardar. Intenta de nuevo.");
    } finally {
      setGuardandoId(null);
    }
  };

  const guardarTodos = async () => {
    try {
      setGuardandoTodos(true);
      await Promise.all(
        participantes.map((p) => {
          const checks = criterios.map((c) => {
            const celda = estado[p._id]?.[c._id];
            return {
              criteriaId: c._id,
              marcado: celda?.marcado || false,
              valor: celda?.valor || 0,
            };
          });
          return torneoService.saveRecord(weekId, p._id, checks);
        })
      );
      setGuardadoTodosOk(true);
      setTimeout(() => setGuardadoTodosOk(false), 2200);
      onGuardado();
    } catch (err) {
      alert("No se pudo guardar todo. Revisa tu conexión e intenta de nuevo.");
    } finally {
      setGuardandoTodos(false);
    }
  };

  if (criterios.length === 0) {
    return (
      <div className="card empty-state">
        <p>
          Primero crea al menos un criterio (ej. "Trajo Biblia") en la sección de
          criterios para poder marcar puntos.
        </p>
      </div>
    );
  }

  if (participantes.length === 0) {
    return (
      <div className="card empty-state">
        <p>Primero agrega participantes para poder asignarles puntos.</p>
      </div>
    );
  }

  return (
    <div className="card check-grid-wrapper">
      <div className="guardar-todos-bar">
        <button
          className="btn btn-gold"
          onClick={guardarTodos}
          disabled={guardandoTodos}
        >
          {guardandoTodos
            ? "Guardando todos..."
            : guardadoTodosOk
            ? "Todos guardados ✓"
            : "Guardar todos"}
        </button>
      </div>
      <table className="check-grid-table">
        <thead>
          <tr>
            <th>Participante</th>
            {criterios.map((c) => (
              <th key={c._id} className="th-center">
                {c.nombre}
                <span className="th-points">
                  {c.tipo === "manual" ? `máx +${c.puntosMaximos ?? 0}` : `+${c.puntos}`}
                </span>
              </th>
            ))}
            <th className="th-center">Puntos semana</th>
            <th className="th-center">Acción</th>
          </tr>
        </thead>
        <tbody>
          {participantes.map((p) => (
            <tr key={p._id}>
              <td className="td-name">{p.nombre}</td>
              {criterios.map((c) => (
                <td key={c._id} className="td-center">
                  {c.tipo === "manual" ? (
                    <input
                      type="number"
                      className="valor-input"
                      min={0}
                      max={c.puntosMaximos ?? 0}
                      value={estado[p._id]?.[c._id]?.valor ?? 0}
                      onChange={(e) =>
                        setValor(
                          p._id,
                          c._id,
                          Number(e.target.value),
                          c.puntosMaximos ?? 0
                        )
                      }
                      aria-label={`${c.nombre} - ${p.nombre}`}
                    />
                  ) : (
                    <input
                      type="checkbox"
                      className="checkbox-input"
                      checked={estado[p._id]?.[c._id]?.marcado || false}
                      onChange={() => toggleCheck(p._id, c._id)}
                      aria-label={`${c.nombre} - ${p.nombre}`}
                    />
                  )}
                </td>
              ))}
              <td className="td-center td-points">{calcularPuntos(p._id)}</td>
              <td className="td-center">
                <button
                  className="btn btn-gold btn-small"
                  onClick={() => guardarParticipante(p._id)}
                  disabled={guardandoId === p._id}
                >
                  {guardandoId === p._id
                    ? "Guardando..."
                    : guardadoOkId === p._id
                    ? "Guardado ✓"
                    : "Guardar"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <style>{`
        .check-grid-wrapper {
          overflow-x: auto;
          padding: 8px;
        }
        .guardar-todos-bar {
          display: flex;
          justify-content: flex-end;
          padding: 8px 6px 16px;
        }
        .check-grid-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 14px;
        }
        .check-grid-table th {
          text-align: left;
          padding: 12px 14px;
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          color: var(--color-ink-soft);
          border-bottom: 1.5px solid var(--color-border);
          white-space: nowrap;
        }
        .th-points {
          display: block;
          font-size: 11px;
          color: var(--color-gold);
          font-weight: 700;
          text-transform: none;
        }
        .check-grid-table td {
          padding: 12px 14px;
          border-bottom: 1px solid var(--color-border);
        }
        .th-center, .td-center {
          text-align: center;
        }
        .td-name {
          font-weight: 600;
          white-space: nowrap;
        }
        .checkbox-input {
          width: 20px;
          height: 20px;
          accent-color: var(--color-success);
          cursor: pointer;
        }
        .valor-input {
          width: 64px;
          padding: 6px 8px;
          border: 1px solid var(--color-border);
          border-radius: 8px;
          text-align: center;
          font-size: 14px;
          background: var(--color-bg);
        }
        .td-points {
          font-family: var(--font-display);
          font-weight: 700;
          color: var(--color-gold);
        }
        .btn-small {
          padding: 6px 14px;
          font-size: 13px;
          white-space: nowrap;
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

export default CheckGrid;