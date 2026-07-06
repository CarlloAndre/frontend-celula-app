import api from "./api";
import { Participant, Criteria, Week, WeeklyRecord, Torneo } from "../types";
import { getCurrentTorneoId } from "./torneoStore";

// ---------- Torneos ----------
// Estas dos son las únicas llamadas que NO dependen de un torneo ya elegido
// (se usan justamente para elegirlo).
export const getTorneos = async (): Promise<Torneo[]> => {
  const { data } = await api.get<Torneo[]>("/torneos");
  return data;
};

export const getTorneoBySlug = async (slug: string): Promise<Torneo> => {
  const { data } = await api.get<Torneo>(`/torneos/${slug}`);
  return data;
};

// ---------- Participants ----------
export const getParticipants = async (): Promise<Participant[]> => {
  const { data } = await api.get<Participant[]>("/participants", {
    params: { torneoId: getCurrentTorneoId() },
  });
  return data;
};

export const getAllParticipants = async (): Promise<Participant[]> => {
  const { data } = await api.get<Participant[]>("/participants", {
    params: { torneoId: getCurrentTorneoId(), todos: true },
  });
  return data;
};

export const createParticipant = async (nombre: string): Promise<Participant> => {
  const { data } = await api.post<Participant>("/participants", {
    torneoId: getCurrentTorneoId(),
    nombre,
  });
  return data;
};

export const updateParticipant = async (
  id: string,
  payload: { nombre?: string; activo?: boolean }
): Promise<Participant> => {
  const { data } = await api.put<Participant>(`/participants/${id}`, payload);
  return data;
};

export const deleteParticipant = async (id: string): Promise<void> => {
  await api.delete(`/participants/${id}`);
};

// ---------- Criteria ----------
export const getCriteria = async (): Promise<Criteria[]> => {
  const { data } = await api.get<Criteria[]>("/criteria", {
    params: { torneoId: getCurrentTorneoId() },
  });
  return data;
};

export const createCriteria = async (
  nombre: string,
  tipo: "checkbox" | "manual",
  puntos: number,
  puntosMaximos?: number
): Promise<Criteria> => {
  const { data } = await api.post<Criteria>("/criteria", {
    torneoId: getCurrentTorneoId(),
    nombre,
    tipo,
    puntos,
    puntosMaximos,
  });
  return data;
};

export const updateCriteria = async (
  id: string,
  payload: Partial<Criteria>
): Promise<Criteria> => {
  const { data } = await api.put<Criteria>(`/criteria/${id}`, payload);
  return data;
};

export const deleteCriteria = async (id: string): Promise<void> => {
  await api.delete(`/criteria/${id}`);
};

// ---------- Weeks ----------
export const getWeeks = async (): Promise<Week[]> => {
  const { data } = await api.get<Week[]>("/weeks", {
    params: { torneoId: getCurrentTorneoId() },
  });
  return data;
};

export const createWeek = async (
  etiqueta: string,
  fechaInicio: string,
  fechaFin: string
): Promise<Week> => {
  const { data } = await api.post<Week>("/weeks", {
    torneoId: getCurrentTorneoId(),
    etiqueta,
    fechaInicio,
    fechaFin,
  });
  return data;
};

export const updateWeek = async (
  id: string,
  payload: { etiqueta?: string; fechaInicio?: string; fechaFin?: string }
): Promise<Week> => {
  const { data } = await api.put<Week>(`/weeks/${id}`, payload);
  return data;
};

export const deleteWeek = async (id: string): Promise<void> => {
  await api.delete(`/weeks/${id}`);
};

// ---------- Weekly Records ----------
export const getLeaderboard = async (): Promise<Participant[]> => {
  const { data } = await api.get<Participant[]>("/weekly-records/leaderboard", {
    params: { torneoId: getCurrentTorneoId() },
  });
  return data;
};

export const getRecordsByWeek = async (weekId: string): Promise<WeeklyRecord[]> => {
  const { data } = await api.get<WeeklyRecord[]>("/weekly-records", {
    params: { weekId, torneoId: getCurrentTorneoId() },
  });
  return data;
};

export const getRecordsByParticipant = async (
  participantId: string
): Promise<WeeklyRecord[]> => {
  const { data } = await api.get<WeeklyRecord[]>(
    `/weekly-records/participant/${participantId}`
  );
  return data;
};

export const saveRecord = async (
  weekId: string,
  participantId: string,
  checks: { criteriaId: string; marcado?: boolean; valor?: number }[]
): Promise<WeeklyRecord> => {
  const { data } = await api.post<WeeklyRecord>("/weekly-records", {
    torneoId: getCurrentTorneoId(),
    weekId,
    participantId,
    checks,
  });
  return data;
};
