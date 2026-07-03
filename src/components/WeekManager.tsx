import { useState, FormEvent } from "react";
import { Week } from "../types";
import * as torneoService from "../services/torneoService";

interface WeekManagerProps {
  onCreada: (week: Week) => void;
}

// Sugiere automáticamente la próxima etiqueta y rango de fechas (lunes a domingo)
const sugerirRango = (): { inicio: string; fin: string } => {
  const hoy = new Date();
  const dia = hoy.getDay(); // 0 = domingo
  const diffLunes = dia === 0 ? -6 : 1 - dia;
  const lunes = new Date(hoy);
  lunes.setDate(hoy.getDate() + diffLunes);
  const domingo = new Date(lunes);
  domingo.setDate(lunes.getDate() + 6);

  const toISO = (d: Date) => d.toISOString().split("T")[0];
  return { inicio: toISO(lunes), fin: toISO(domingo) };
};

const WeekManager = ({ onCreada }: WeekManagerProps) => {
  const sugerido = sugerirRango();
  const [etiqueta, setEtiqueta] = useState("");
  const [fechaInicio, setFechaInicio] = useState(sugerido.inicio);
  const [fechaFin, setFechaFin] = useState(sugerido.fin);
  const [error, setError] = useState("");
  const [creando, setCreando] = useState(false);

  const handleCrear = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (!etiqueta.trim() || !fechaInicio || !fechaFin) {
      setError("Completa la etiqueta y ambas fechas.");
      return;
    }

    try {
      setCreando(true);
      const nueva = await torneoService.createWeek(etiqueta.trim(), fechaInicio, fechaFin);
      setEtiqueta("");
      onCreada(nueva);
    } catch (err) {
      setError("No se pudo crear la semana.");
    } finally {
      setCreando(false);
    }
  };

  return (
    <div className="week-manager">
      <form className="week-form" onSubmit={handleCrear}>
        <input
          className="input week-label-input"
          placeholder='Ej: "Semana 1" o "22 jun - 28 jun"'
          value={etiqueta}
          onChange={(e) => setEtiqueta(e.target.value)}
        />
        <input
          className="input"
          type="date"
          value={fechaInicio}
          onChange={(e) => setFechaInicio(e.target.value)}
        />
        <input
          className="input"
          type="date"
          value={fechaFin}
          onChange={(e) => setFechaFin(e.target.value)}
        />
        <button className="btn btn-primary" type="submit" disabled={creando}>
          {creando ? "Creando..." : "Crear semana"}
        </button>
      </form>
      {error && <p className="error-text">{error}</p>}

      <style>{`
        .week-form {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }
        .week-label-input {
          flex: 1;
          min-width: 180px;
        }
      `}</style>
    </div>
  );
};

export default WeekManager;
