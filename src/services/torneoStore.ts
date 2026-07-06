// Guarda en memoria (NO en localStorage) el torneo actualmente seleccionado.
// Así, torneoService puede incluir el torneoId en cada request sin que cada
// componente tenga que pasarlo manualmente. Al recargar la pestaña desde cero
// (entrando por "/"), este store queda vacío y se vuelve a pedir elegir torneo.
// Si se entra por una URL /torneo/:slug ya profunda, TorneoContext lo vuelve
// a resolver contra la API usando el slug de la URL.

let currentTorneoId: string | null = null;
let currentTorneoSlug: string | null = null;

export const setCurrentTorneo = (id: string, slug: string): void => {
  currentTorneoId = id;
  currentTorneoSlug = slug;
};

export const clearCurrentTorneo = (): void => {
  currentTorneoId = null;
  currentTorneoSlug = null;
};

export const getCurrentTorneoId = (): string => {
  if (!currentTorneoId) {
    throw new Error(
      "No hay un torneo seleccionado todavía. Elige un torneo antes de continuar."
    );
  }
  return currentTorneoId;
};

export const getCurrentTorneoSlug = (): string | null => currentTorneoSlug;

// Claves de localStorage para la sesión de admin, aisladas por torneo:
// así el login de un torneo nunca se mezcla con el de otro.
export const authTokenKey = (torneoId: string): string => `celula_token_${torneoId}`;
export const authUsernameKey = (torneoId: string): string => `celula_username_${torneoId}`;
