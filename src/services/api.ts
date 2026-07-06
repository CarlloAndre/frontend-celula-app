import axios from "axios";
import { getCurrentTorneoId, authTokenKey } from "./torneoStore";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

const api = axios.create({
  baseURL: API_URL,
});

// Agrega el token JWT automáticamente a cada request, usando la sesión
// guardada para el torneo actualmente seleccionado (cada torneo tiene su
// propio admin/token, por eso no usamos una única clave global "token").
api.interceptors.request.use((config) => {
  try {
    const torneoId = getCurrentTorneoId();
    const token = localStorage.getItem(authTokenKey(torneoId));
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch {
    // Todavía no hay torneo seleccionado (ej: pantalla de selección inicial).
  }
  return config;
});

export default api;
