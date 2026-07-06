export type TipoCriterio = "checkbox" | "manual";

export interface Torneo {
  _id: string;
  nombre: string;
  slug: string;
  activo: boolean;
}

export interface Criteria {
  _id: string;
  nombre: string;
  tipo: TipoCriterio;
  puntos: number;
  puntosMaximos?: number;
  activo: boolean;
}

export interface Participant {
  _id: string;
  nombre: string;
  foto?: string;
  puntosTotales: number;
  activo: boolean;
}

export interface Week {
  _id: string;
  numero: number;
  etiqueta: string;
  fechaInicio: string;
  fechaFin: string;
}

export interface CheckItem {
  criteriaId: Criteria | string;
  marcado: boolean;
  valor?: number;
}

export interface WeeklyRecord {
  _id: string;
  weekId: Week | string;
  participantId: Participant | string;
  checks: CheckItem[];
  puntosGanados: number;
}

export interface AdminAuth {
  token: string;
  admin: {
    id: string;
    username: string;
    torneoId: string;
  };
}
