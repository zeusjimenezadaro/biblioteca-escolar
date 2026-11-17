// Nombres, colores y permisos de cada rol. La API también controla los permisos:
// esto solo decide qué botones y pantallas se muestran.
import type { LoanStatus, Role, User } from "../types";

export const ROLE_LABELS: Record<Role, string> = {
  admin: "Administrador",
  bibliotecario: "Bibliotecario",
  alumno: "Alumno",
};

export const ROLE_ICONS: Record<Role, "shield-checkmark" | "library" | "school"> = {
  admin: "shield-checkmark",
  bibliotecario: "library",
  alumno: "school",
};

export const STATUS_LABELS: Record<LoanStatus, string> = {
  pendiente: "Pendiente",
  aprobado: "Prestado",
  rechazado: "Rechazado",
  devuelto: "Devuelto",
};

// ¿Qué puede hacer cada usuario?
export const can = {
  manageBooks: (u?: User | null) => u?.role === "admin" || u?.role === "bibliotecario",
  manageLoans: (u?: User | null) => u?.role === "admin" || u?.role === "bibliotecario",
  requestLoans: (u?: User | null) => u?.role === "alumno",
  manageUsers: (u?: User | null) => u?.role === "admin",
};

// Fecha legible: «17/11/2026».
export function formatDate(value: string | null) {
  if (!value) return "—";
  const [y, m, d] = value.slice(0, 10).split("-");
  return `${d}/${m}/${y}`;
}

// Iniciales para el avatar: «Zeus Jimenez» → «ZJ».
export function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join("");
}
