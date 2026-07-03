import { useState, FormEvent } from "react";
import { Participant } from "../types";
import * as torneoService from "../services/torneoService";

interface ParticipantManagerProps {
  participantes: Participant[];
  onCambio: () => void;
}

const ParticipantManager = ({ participantes, onCambio }: ParticipantManagerProps) => {
  const [nombre, setNombre] = useState("");
  const [error, setError] = useState("");
  const [creando, setCreando] = useState(false);
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [editNombre, setEditNombre] = useState("");

  const handleCrear = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    if (!nombre.trim()) {
      setError("El nombre del participante es requerido.");
      return;
    }
    try {
      setCreando(true);
      await torneoService.createParticipant(nombre.trim());
      setNombre("");
      onCambio();
    } catch {
      setError("No se pudo agregar el participante.");
    } finally {
      setCreando(false);
    }
  };

  const iniciarEdicion = (p: Participant) => {
    setEditandoId(p._id);
    setEditNombre(p.nombre);
  };

  const guardarEdicion = async (id: string) => {
    if (!editNombre.trim()) return;
    await torneoService.updateParticipant(id, { nombre: editNombre.trim() });
    setEditandoId(null);
    onCambio();
  };

  const toggleActivo = async (p: Participant) => {
    await torneoService.updateParticipant(p._id, { activo: !p.activo });
    onCambio();
  };

  const eliminar = async (id: string) => {
    if (!confirm("¿Eliminar este participante? Se perderá su historial.")) return;
    await torneoService.deleteParticipant(id);
    onCambio();
  };

  return (
    <div className="participant-manager">
      <form className="participant-form" onSubmit={handleCrear}>
        <input
          className="input"
          placeholder="Nombre del participante"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
        />
        <button className="btn btn-primary" type="submit" disabled={creando}>
          {creando ? "Agregando..." : "Agregar"}
        </button>
      </form>
      {error && <p className="error-text">{error}</p>}

      <div className="participant-list">
        {participantes.map((p) => (
          <div
            className={`participant-item ${!p.activo ? "participant-inactivo" : ""}`}
            key={p._id}
          >
            {editandoId === p._id ? (
              <>
                <input
                  className="input participant-edit-input"
                  value={editNombre}
                  onChange={(e) => setEditNombre(e.target.value)}
                  autoFocus
                />
                <button
                  className="btn btn-gold btn-small"
                  onClick={() => guardarEdicion(p._id)}
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
                <span className="participant-name">{p.nombre}</span>
                <span className="participant-points">{p.puntosTotales} pts</span>
                {!p.activo && <span className="participant-badge-inactivo">Inactivo</span>}
                <button
                  className="btn btn-outline btn-small"
                  onClick={() => iniciarEdicion(p)}
                >
                  Editar
                </button>
                <button
                  className="btn btn-outline btn-small"
                  onClick={() => toggleActivo(p)}
                >
                  {p.activo ? "Desactivar" : "Activar"}
                </button>
                <button
                  className="btn btn-danger btn-small"
                  onClick={() => eliminar(p._id)}
                >
                  Eliminar
                </button>
              </>
            )}
          </div>
        ))}

        {participantes.length === 0 && (
          <p className="participant-empty">
            No hay participantes todavía. Agrega el primero arriba.
          </p>
        )}
      </div>

      <style>{`
        .participant-form {
          display: flex;
          gap: 10px;
          margin-bottom: 18px;
          flex-wrap: wrap;
        }
        .participant-form .input {
          flex: 1;
          min-width: 160px;
        }
        .participant-edit-input {
          flex: 1;
          min-width: 160px;
        }
        .participant-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .participant-item {
          display: flex;
          align-items: center;
          gap: 10px;
          background: var(--color-card);
          border: 1px solid var(--color-border);
          border-radius: 10px;
          padding: 10px 14px;
          flex-wrap: wrap;
        }
        .participant-inactivo {
          opacity: 0.55;
        }
        .participant-name {
          font-weight: 600;
          flex: 1;
          min-width: 100px;
        }
        .participant-points {
          font-family: var(--font-display);
          font-weight: 700;
          color: var(--color-gold);
          font-size: 14px;
        }
        .participant-badge-inactivo {
          font-size: 11px;
          font-weight: 600;
          background: var(--color-danger-bg);
          color: var(--color-danger);
          padding: 2px 8px;
          border-radius: 20px;
        }
        .btn-small {
          padding: 6px 12px;
          font-size: 12px;
        }
        .participant-empty {
          color: var(--color-ink-soft);
          font-size: 14px;
          padding: 12px 0;
        }
      `}</style>
    </div>
  );
};

export default ParticipantManager;
