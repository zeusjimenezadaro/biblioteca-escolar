// Configuración general de la app.

// Dirección de la API. Se toma de EXPO_PUBLIC_API_URL (archivo .env); si falta, se usa la publicada.
export const API_URL = (process.env.EXPO_PUBLIC_API_URL || "https://biblioteca-escolar-api.vercel.app").replace(/\/$/, "");

// Tiempo máximo de espera de cada pedido al servidor.
export const REQUEST_TIMEOUT_MS = 15000;
