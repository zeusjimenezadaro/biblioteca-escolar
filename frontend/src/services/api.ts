// Cliente HTTP de la API. Agrega el token a cada pedido, renueva la sesión automáticamente
// cuando el token de acceso vence y convierte cualquier falla en un mensaje entendible.
import { API_URL, REQUEST_TIMEOUT_MS } from "../config";
import type { FieldErrors, Session } from "../types";

// Error con el mensaje para mostrar en pantalla y, si corresponde, los errores por campo.
export class ApiError extends Error {
  status: number; // 0 = no hubo conexión con el servidor.
  errors?: FieldErrors;
  constructor(message: string, status: number, errors?: FieldErrors) {
    super(message);
    this.status = status;
    this.errors = errors;
  }
}

// El contexto de autenticación le pasa a este módulo los tokens y qué hacer al renovar o cerrar sesión.
type Handlers = {
  getSession: () => Session | null;
  onRefreshed: (session: Session) => void;
  onExpired: () => void;
};
let handlers: Handlers = { getSession: () => null, onRefreshed: () => {}, onExpired: () => {} };
export const configureApi = (h: Handlers) => {
  handlers = h;
};

type Options = { method?: string; body?: unknown; auth?: boolean };

// Hace el pedido con límite de tiempo y devuelve la respuesta y el JSON.
async function send(path: string, { method = "GET", body }: Options, token?: string) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const response = await fetch(`${API_URL}/api${path}`, {
      method,
      headers: {
        Accept: "application/json",
        ...(body !== undefined && { "Content-Type": "application/json" }),
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });
    const data = await response.json().catch(() => null);
    return { response, data };
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new ApiError("El servidor tardó demasiado en responder. Intentá de nuevo.", 0);
    }
    throw new ApiError("No se pudo conectar con el servidor. Revisá tu conexión a internet.", 0);
  } finally {
    clearTimeout(timer);
  }
}

// Si varios pedidos vencen a la vez, se renueva una sola vez y todos esperan ese resultado.
let refreshing: Promise<Session | null> | null = null;

async function refreshSession(): Promise<Session | null> {
  const current = handlers.getSession();
  if (!current) return null;
  refreshing ??= (async () => {
    try {
      const { response, data } = await send("/auth/refresh", { method: "POST", body: { refreshToken: current.refreshToken } });
      if (!response.ok || !data?.ok) return null;
      const session: Session = { user: data.user, accessToken: data.accessToken, refreshToken: data.refreshToken };
      handlers.onRefreshed(session);
      return session;
    } finally {
      refreshing = null;
    }
  })();
  return refreshing;
}

// Función principal: api("/books"), api("/books", { method: "POST", body }), etc.
export async function api<T = any>(path: string, options: Options = {}): Promise<T> {
  const auth = options.auth ?? true;
  let { response, data } = await send(path, options, auth ? handlers.getSession()?.accessToken : undefined);

  // 401 con sesión abierta: el token de acceso venció. Se renueva y se repite el pedido una vez.
  if (response.status === 401 && auth && handlers.getSession()) {
    const renewed = await refreshSession();
    if (!renewed) {
      handlers.onExpired(); // No se pudo renovar: hay que volver a iniciar sesión.
      throw new ApiError("Tu sesión expiró. Volvé a iniciar sesión.", 401);
    }
    ({ response, data } = await send(path, options, renewed.accessToken));
  }

  if (!response.ok || data?.ok === false) {
    throw new ApiError(data?.message ?? `Error del servidor (${response.status}).`, response.status, data?.errors);
  }
  return data as T;
}
