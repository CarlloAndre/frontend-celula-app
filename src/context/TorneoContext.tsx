import {
  createContext,
  useContext,
  useState,
  ReactNode,
} from "react";
import { Torneo } from "../types";
import * as torneoService from "../services/torneoService";
import {
  setCurrentTorneo as guardarTorneoEnStore,
  clearCurrentTorneo,
} from "../services/torneoStore";

interface TorneoContextType {
  torneo: Torneo | null;
  loading: boolean;
  error: string;
  seleccionarTorneo: (t: Torneo) => void;
  resolverPorSlug: (slug: string) => Promise<void>;
  salirDelTorneo: () => void;
}

const TorneoContext = createContext<TorneoContextType | undefined>(undefined);

export const TorneoProvider = ({ children }: { children: ReactNode }) => {
  const [torneo, setTorneo] = useState<Torneo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Se usa desde la pantalla de selección: el usuario ya eligió, no hay
  // que volver a preguntarle a la API.
  const seleccionarTorneo = (t: Torneo): void => {
    guardarTorneoEnStore(t._id, t.slug);
    setTorneo(t);
    setError("");
  };

  // Se usa cuando se entra directamente a una URL /torneo/:slug/... (por
  // ejemplo, un enlace guardado o al recargar la página estando ahí dentro).
  // Resuelve el torneo contra la API a partir del slug de la URL.
  const resolverPorSlug = async (slug: string): Promise<void> => {
    if (torneo && torneo.slug === slug) return;
    try {
      setLoading(true);
      setError("");
      const encontrado = await torneoService.getTorneoBySlug(slug);
      guardarTorneoEnStore(encontrado._id, encontrado.slug);
      setTorneo(encontrado);
    } catch {
      setError("No encontramos ese torneo.");
    } finally {
      setLoading(false);
    }
  };

  const salirDelTorneo = (): void => {
    clearCurrentTorneo();
    setTorneo(null);
  };

  return (
    <TorneoContext.Provider
      value={{ torneo, loading, error, seleccionarTorneo, resolverPorSlug, salirDelTorneo }}
    >
      {children}
    </TorneoContext.Provider>
  );
};

export const useTorneo = (): TorneoContextType => {
  const context = useContext(TorneoContext);
  if (!context) {
    throw new Error("useTorneo debe usarse dentro de un TorneoProvider");
  }
  return context;
};
