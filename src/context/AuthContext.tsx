import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import * as authService from "../services/authService";
import { authTokenKey, authUsernameKey } from "../services/torneoStore";
import { useTorneo } from "./TorneoContext";

interface AuthContextType {
  isAuthenticated: boolean;
  username: string | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  // La sesión de admin depende del torneo activo: cada torneo tiene su
  // propio login, así que un mismo navegador puede estar "logueado" en el
  // Torneo A y "deslogueado" en el Torneo B al mismo tiempo.
  const { torneo } = useTorneo();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    if (!torneo) {
      setIsAuthenticated(false);
      setUsername(null);
      return;
    }

    const token = localStorage.getItem(authTokenKey(torneo._id));
    const storedUsername = localStorage.getItem(authUsernameKey(torneo._id));

    if (token && storedUsername) {
      setIsAuthenticated(true);
      setUsername(storedUsername);
    } else {
      setIsAuthenticated(false);
      setUsername(null);
    }
  }, [torneo]);

  const login = async (username: string, password: string): Promise<void> => {
    if (!torneo) {
      throw new Error("No hay un torneo seleccionado.");
    }
    const data = await authService.login(username, password);
    localStorage.setItem(authTokenKey(torneo._id), data.token);
    localStorage.setItem(authUsernameKey(torneo._id), data.admin.username);
    setIsAuthenticated(true);
    setUsername(data.admin.username);
  };

  const logout = (): void => {
    if (torneo) {
      localStorage.removeItem(authTokenKey(torneo._id));
      localStorage.removeItem(authUsernameKey(torneo._id));
    }
    setIsAuthenticated(false);
    setUsername(null);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, username, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe usarse dentro de un AuthProvider");
  }
  return context;
};
