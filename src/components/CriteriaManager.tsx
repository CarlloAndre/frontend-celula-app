import { useState, FormEvent } from "react";
import { Criteria, TipoCriterio } from "../types";
import * as torneoService from "../services/torneoService";

interface CriteriaManagerProps {
  criterios: Criteria[];
  onCambio: () => void;
}

const CriteriaManager = ({ criterios, onCambio }: CriteriaManagerProps) => {
  const [nombre, setNombre] = useState("");
  const [tipo, setTipo] = useState<TipoCriterio>("checkbox");
  const [puntos, setPuntos] = useState("");
  const [puntosMaximos, setPuntosMaximos] = useState("");
  const [error, setError] = useState("");
  const [creando, setCreando] = useState(false);
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [editNombre, setEditNombre] = useState("");
  const [editTipo, setEditTipo] = useState<TipoCriterio>("checkbox");
  const [editPuntos, setEditPuntos] = useState("");
  const [editPuntosMaximos, setEditPuntosMaximos] = useState("");

  const handleCrear = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (!nombre.trim()) {
      setError("El nombre del criterio es requerido.");
      return;
    }

    let puntosNum = 0;
    let maxNum: number | undefined;

    if (tipo === "checkbox") {
      puntosNum = Number(puntos);
      if (isNaN(puntosNum) || puntosNum < 0) {
        setError("Los puntos deben ser un número válido (0 o más).");
        return;
      }
    } else {
      maxNum = Number(puntosMaximos);
      if (isNaN(maxNum) || maxNum <= 0) {
        setError("El puntaje máximo debe ser un número válido mayor a 0.");
        return;
      }
    }

    try {
      setCreando(true);
      await torneoService.createCriteria(nombre.trim(), tipo, puntosNum, maxNum);
      setNombre("");
      setPuntos("");
      setPuntosMaximos("");
      setTipo("checkbox");
      onCambio();
    } catch (err) {
      setError("No se pudo crear el criterio.");
    } finally {
      setCreando(false);
    }
  };

  const iniciarEdicion = (c: Criteria) => {
    setEditandoId(c._id);
    setEditNombre(c.nombre);
    setEditTipo(c.tipo);
    setEditPuntos(String(c.puntos ?? 0));
    setEditPuntosMaximos(String(c.puntosMaximos ?? ""));
  };

  const guardarEdicion = async (id: string) => {
    if (!editNombre.trim()) return;

    const payload: Partial<Criteria> = {
      nombre: editNombre.trim(),
      tipo: editTipo,
    };

    if (editTipo === "checkbox") {
      const puntosNum = Number(editPuntos);
      if (isNaN(puntosNum) || puntosNum < 0) return;
      payload.puntos = puntosNum;
    } else {
      const maxNum = Number(editPuntosMaximos);
      if (isNaN(maxNum) || maxNum <= 0) return;
      payload.puntosMaximos = maxNum;
    }

    await torneoService.updateCriteria(id, payload);
    setEditandoId(null);
    onCambio();
  };

  const toggleActivo = async (c: Criteria) => {
    await torneoService.updateCriteria(c._id, { activo: !c.activo });
    onCambio();
  };

  const eliminar = async (id: string) => {
    if (!confirm("¿Eliminar este criterio? Esta acción no se puede deshacer.")) return;
    await torneoService.deleteCriteria(id);
    onCambio();
  };

  return (
    <div className="criteria-manager">
      <form className="criteria-form" onSubmit={handleCrear}>
        <input
          className="input"
          placeholder="Ej: Trajo Biblia"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
        />
        <select
          className="input criteria-tipo-select"
          value={tipo}
          onChange={(e) => setTipo(e.target.value as TipoCriterio)}
        >
          <option value="checkbox">Tipo: Checkbox (puntaje fijo)</option>
          <option value="manual">Tipo: Puntaje manual</option>
        </select>
        {tipo === "checkbox" ? (
          <input
            className="input criteria-points-input"
            type="number"
            min={0}
            placeholder="Puntos"
            value={puntos}
            onChange={(e) => setPuntos(e.target.value)}
          />
        ) : (
          <input
            className="input criteria-points-input"
            type="number"
            min={1}
            placeholder="Puntaje máximo"
            value={puntosMaximos}
            onChange={(e) => setPuntosMaximos(e.target.value)}
          />
        )}
        <button className="btn btn-primary" type="submit" disabled={creando}>
          {creando ? "Agregando..." : "Agregar criterio"}
        </button>
      </form>
      {error && <p className="error-text">{error}</p>}

      <div className="criteria-list">
        {criterios.map((c) => (
          <div className={`criteria-item ${!c.activo ? "criteria-inactivo" : ""}`} key={c._id}>
            {editandoId === c._id ? (
              <>
                <input
                  className="input criteria-edit-input"
                  value={editNombre}
                  onChange={(e) => setEditNombre(e.target.value)}
                />
                <select
                  className="input criteria-tipo-select"
                  value={editTipo}
                  onChange={(e) => setEditTipo(e.target.value as TipoCriterio)}
                >
                  <option value="checkbox">Checkbox (puntaje fijo)</option>
                  <option value="manual">Puntaje manual</option>
                </select>
                {editTipo === "checkbox" ? (
                  <input
                    className="input criteria-points-input"
                    type="number"
                    min={0}
                    placeholder="Puntos"
                    value={editPuntos}
                    onChange={(e) => setEditPuntos(e.target.value)}
                  />
                ) : (
                  <input
                    className="input criteria-points-input"
                    type="number"
                    min={1}
                    placeholder="Puntaje máximo"
                    value={editPuntosMaximos}
                    onChange={(e) => setEditPuntosMaximos(e.target.value)}
                  />
                )}
                <button
                  className="btn btn-gold btn-small"
                  onClick={() => guardarEdicion(c._id)}
                >
                  Guardar
                </button>
                <button
                  className="btn btn-outline btn-small"
                  onClick={() => setEditandoId(null)}
                >
                  Cancelar
                </button>
              </>
            ) : (
              <>
                <span className="criteria-name">{c.nombre}</span>
                <span className="criteria-type-badge">
                  {c.tipo === "manual" ? "Puntaje manual" : "Checkbox"}
                </span>
                <span className="criteria-points-badge">
                  {c.tipo === "manual" ? `máx +${c.puntosMaximos ?? 0} pts` : `+${c.puntos} pts`}
                </span>
                <span className="criteria-status">
                  {c.activo ? "Activo" : "Inactivo"}
                </span>
                <button
                  className="btn btn-outline btn-small"
                  onClick={() => iniciarEdicion(c)}
                >
                  Editar
                </button>
                <button
                  className="btn btn-outline btn-small"
                  onClick={() => toggleActivo(c)}
                >
                  {c.activo ? "Desactivar" : "Activar"}
                </button>
                <button
                  className="btn btn-danger btn-small"
                  onClick={() => eliminar(c._id)}
                >
                  Eliminar
                </button>
              </>
            )}
          </div>
        ))}

        {criterios.length === 0 && (
          <p className="criteria-empty">
            No hay criterios todavía. Crea el primero arriba.
          </p>
        )}
      </div>

      <style>{`
        .criteria-form {
          display: flex;
          gap: 10px;
          margin-bottom: 18px;
          flex-wrap: wrap;
        }
        .criteria-points-input {
          max-width: 110px;
        }
        .criteria-tipo-select {
          max-width: 220px;
        }
        .criteria-type-badge {
          font-size: 11px;
          font-weight: 600;
          color: var(--color-ink-soft);
          background: var(--color-card);
          border: 1px solid var(--color-border);
          padding: 2px 8px;
          border-radius: 20px;
        }
        .criteria-edit-input {
          flex: 1;
          min-width: 120px;
        }
        .criteria-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .criteria-item {
          display: flex;
          align-items: center;
          gap: 10px;
          background: var(--color-card);
          border: 1px solid var(--color-border);
          border-radius: 10px;
          padding: 10px 14px;
          flex-wrap: wrap;
        }
        .criteria-inactivo {
          opacity: 0.55;
        }
        .criteria-name {
          font-weight: 600;
          flex: 1;
          min-width: 100px;
        }
        .criteria-points-badge {
          background: var(--color-success-bg);
          color: var(--color-success);
          font-size: 12px;
          font-weight: 700;
          padding: 3px 9px;
          border-radius: 20px;
        }
        .criteria-status {
          font-size: 12px;
          color: var(--color-ink-soft);
        }
        .btn-small {
          padding: 6px 12px;
          font-size: 12px;
        }
        .criteria-empty {
          color: var(--color-ink-soft);
          font-size: 14px;
          padding: 12px 0;
        }
      `}</style>
    </div>
  );
};

export default CriteriaManager;
