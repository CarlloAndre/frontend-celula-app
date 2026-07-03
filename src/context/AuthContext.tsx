import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import * as authService from "../services/authService";

interface AuthContextType {
  isAuthenticated: boolean;
  username: string | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUsername = localStorage.getItem("username");
    if (token && storedUsername) {
      setIsAuthenticated(true);
      setUsername(storedUsername);
    }
  }, []);

  const login = async (username: string, password: string): Promise<void> => {
    const data = await authService.login(username, password);
    localStorage.setItem("token", data.token);
    localStorage.setItem("username", data.admin.username);
    setIsAuthenticated(true);
    setUsername(data.admin.username);
  };

  const logout = (): void => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
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
