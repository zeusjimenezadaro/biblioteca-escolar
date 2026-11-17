// Paletas de colores del modo claro y del modo oscuro.
export type Colors = {
  bg: string; // Fondo de la pantalla.
  card: string; // Fondo de las tarjetas.
  ink: string; // Texto principal.
  muted: string; // Texto secundario.
  line: string; // Bordes y separadores.
  accent: string; // Color principal de la app.
  accentSoft: string; // Fondo suave del color principal.
  onAccent: string; // Texto sobre el color principal.
  header: string; // Barra superior y tarjeta de bienvenida.
  error: string;
  errorSoft: string;
  success: string;
  successSoft: string;
  warning: string;
  warningSoft: string;
  input: string; // Fondo de los campos de texto.
};

export const light: Colors = {
  bg: "#f4f2ee",
  card: "#ffffff",
  ink: "#1f2433",
  muted: "#626b7d",
  line: "#e2ded6",
  accent: "#3b4fd8",
  accentSoft: "#e5e8fd",
  onAccent: "#ffffff",
  header: "#1e2347",
  error: "#b4232f",
  errorSoft: "#fdecee",
  success: "#1d7048",
  successSoft: "#e1f4ea",
  warning: "#9a5b00",
  warningSoft: "#fdf1dc",
  input: "#fbfaf8",
};

export const dark: Colors = {
  bg: "#0f1222",
  card: "#181c33",
  ink: "#eceef8",
  muted: "#a2a8bf",
  line: "#2a2f4d",
  accent: "#8b9cff",
  accentSoft: "#232a55",
  onAccent: "#0f1222",
  header: "#151937",
  error: "#ff9aa3",
  errorSoft: "#3c1820",
  success: "#7fe0ad",
  successSoft: "#12301f",
  warning: "#ffc86b",
  warningSoft: "#3a2a10",
  input: "#141830",
};
