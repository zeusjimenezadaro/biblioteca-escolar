// Guarda la sesión en el celular para que siga abierta al cerrar y volver a abrir la app.
// En Android/iOS usa SecureStore (almacenamiento cifrado); en el navegador, AsyncStorage.
import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { Session } from "../types";

const KEY = "biblioteca.session";
const isWeb = Platform.OS === "web"; // SecureStore no existe en la web.

export async function loadSession(): Promise<Session | null> {
  try {
    const raw = isWeb ? await AsyncStorage.getItem(KEY) : await SecureStore.getItemAsync(KEY);
    return raw ? (JSON.parse(raw) as Session) : null;
  } catch {
    return null; // Si el dato está dañado, se pide iniciar sesión de nuevo.
  }
}

export async function saveSession(session: Session) {
  const raw = JSON.stringify(session);
  if (isWeb) await AsyncStorage.setItem(KEY, raw);
  else await SecureStore.setItemAsync(KEY, raw);
}

export async function clearSession() {
  if (isWeb) await AsyncStorage.removeItem(KEY);
  else await SecureStore.deleteItemAsync(KEY);
}
