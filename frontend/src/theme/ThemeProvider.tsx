// Tema claro/oscuro: sigue el del celular hasta que el usuario elige uno, y recuerda la elección.
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { useColorScheme } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { dark, light } from "./colors";
import type { Colors } from "./colors";
import { makeStyles } from "./styles";
import type { Styles } from "./styles";

const KEY = "biblioteca.theme";

type Theme = { isDark: boolean; colors: Colors; s: Styles; toggle: () => void };
const ThemeContext = createContext<Theme | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const system = useColorScheme();
  const [choice, setChoice] = useState<"light" | "dark" | null>(null);

  // Lee la elección guardada al abrir la app.
  useEffect(() => {
    AsyncStorage.getItem(KEY)
      .then((v) => (v === "light" || v === "dark") && setChoice(v))
      .catch(() => {});
  }, []);

  const isDark = (choice ?? system) === "dark";
  // Los estilos se recalculan solo cuando cambia el tema.
  const value = useMemo<Theme>(() => {
    const colors = isDark ? dark : light;
    return {
      isDark,
      colors,
      s: makeStyles(colors),
      toggle: () => {
        const next = isDark ? "light" : "dark";
        setChoice(next);
        AsyncStorage.setItem(KEY, next).catch(() => {});
      },
    };
  }, [isDark]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const theme = useContext(ThemeContext);
  if (!theme) throw new Error("useTheme debe usarse dentro de ThemeProvider.");
  return theme;
}
