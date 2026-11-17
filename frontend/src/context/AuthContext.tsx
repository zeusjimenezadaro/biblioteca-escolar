// Estado global de autenticación (Context API): usuario logueado, login, registro,
// login social, cierre de sesión y persistencia de la sesión en el celular.
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import * as Linking from "expo-linking";
import * as WebBrowser from "expo-web-browser";
import { ApiError, configureApi } from "../services/api";
import { authService } from "../services";
import { clearSession, loadSession, saveSession } from "../storage/session";
import type { Provider, Session, User } from "../types";

type Status = "loading" | "signedOut" | "signedIn";

type AuthValue = {
  status: Status;
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  loginWithProvider: (provider: Provider) => Promise<void>;
  completeOAuth: (code: string) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: User) => void; // Actualiza los datos después de editar el perfil.
};

const AuthContext = createContext<AuthValue | null>(null);

// Lee un parámetro de la dirección con la que la red social vuelve a la app.
const readParam = (url: string, name: string) => Linking.parse(url).queryParams?.[name];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<Status>("loading");
  const [user, setUserState] = useState<User | null>(null);
  const session = useRef<Session | null>(null); // Tokens actuales (no se muestran, no necesitan re-render).
  const usedCodes = useRef(new Set<string>()); // Evita canjear dos veces el mismo código social.

  // Guarda la sesión en memoria y en el almacenamiento seguro.
  const applySession = useCallback(async (next: Session) => {
    session.current = next;
    setUserState(next.user);
    setStatus("signedIn");
    await saveSession(next);
  }, []);

  const signOutLocally = useCallback(async () => {
    session.current = null;
    setUserState(null);
    setStatus("signedOut");
    await clearSession();
  }, []);

  // Conecta el cliente HTTP con esta sesión (para agregar el token y renovarlo).
  useEffect(() => {
    configureApi({
      getSession: () => session.current,
      onRefreshed: (next) => {
        session.current = next;
        setUserState(next.user);
        saveSession(next).catch(() => {});
      },
      onExpired: () => {
        signOutLocally().catch(() => {});
      },
    });
  }, [signOutLocally]);

  // Al abrir la app: recupera la sesión guardada y la valida con el servidor.
  useEffect(() => {
    (async () => {
      const saved = await loadSession();
      if (!saved) return setStatus("signedOut");
      session.current = saved;
      setUserState(saved.user);
      setStatus("signedIn"); // Entra enseguida con los datos guardados.
      try {
        const { user: fresh } = await authService.me(); // Renueva el token solo si hace falta.
        session.current = { ...session.current!, user: fresh };
        setUserState(fresh);
        await saveSession(session.current);
      } catch (error) {
        // Sin internet se mantiene la sesión; si el servidor la rechaza, se cierra.
        if (error instanceof ApiError && (error.status === 401 || error.status === 403)) await signOutLocally();
      }
    })();
  }, [signOutLocally]);

  const login = useCallback(
    async (email: string, password: string) => {
      const { ok: _ok, ...next } = await authService.login(email.trim().toLowerCase(), password);
      await applySession(next);
    },
    [applySession],
  );

  const register = useCallback(
    async (name: string, email: string, password: string) => {
      const { ok: _ok, ...next } = await authService.register(name.trim(), email.trim().toLowerCase(), password);
      await applySession(next);
    },
    [applySession],
  );

  // Canjea el código de un solo uso que devuelve el login social.
  const completeOAuth = useCallback(
    async (code: string) => {
      if (usedCodes.current.has(code)) return;
      usedCodes.current.add(code);
      const { ok: _ok, ...next } = await authService.exchangeCode(code);
      await applySession(next);
    },
    [applySession],
  );

  // Abre el navegador con la red social y espera la vuelta a la app.
  const loginWithProvider = useCallback(
    async (provider: Provider) => {
      const redirect = Linking.createURL("auth"); // biblioteca://auth (o exp://.../--/auth en Expo Go)
      const result = await WebBrowser.openAuthSessionAsync(authService.oauthStartUrl(provider, redirect), redirect);
      if (result.type !== "success") throw new ApiError("Cancelaste el inicio de sesión.", 0);
      const error = readParam(result.url, "error");
      if (typeof error === "string") throw new ApiError(error, 0);
      const code = readParam(result.url, "code");
      if (typeof code !== "string") throw new ApiError("La red social no devolvió la autorización.", 0);
      await completeOAuth(code);
    },
    [completeOAuth],
  );

  const logout = useCallback(async () => {
    const refreshToken = session.current?.refreshToken;
    await signOutLocally(); // Se cierra en el celular aunque el servidor no responda.
    if (refreshToken) authService.logout(refreshToken).catch(() => {});
  }, [signOutLocally]);

  const setUser = useCallback((next: User) => {
    if (!session.current) return;
    session.current = { ...session.current, user: next };
    setUserState(next);
    saveSession(session.current).catch(() => {});
  }, []);

  const value = useMemo(
    () => ({ status, user, login, register, loginWithProvider, completeOAuth, logout, setUser }),
    [status, user, login, register, loginWithProvider, completeOAuth, logout, setUser],
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Hook para usar la autenticación en cualquier pantalla.
export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth debe usarse dentro de AuthProvider.");
  return value;
}
