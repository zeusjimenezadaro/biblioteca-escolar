// Validaciones de los formularios en la app (las mismas reglas que aplica la API).
import type { BookInput, FieldErrors } from "../types";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateEmail(email: string) {
  return EMAIL.test(email.trim()) ? undefined : "Ingresá un correo válido.";
}

export function validatePassword(password: string) {
  if (password.length < 8) return "La contraseña debe tener al menos 8 caracteres.";
  if (!/[A-Za-z]/.test(password) || !/[0-9]/.test(password)) return "La contraseña debe tener letras y números.";
  return undefined;
}

// Devuelve solo los campos con error: un objeto vacío significa que todo está bien.
const clean = (errors: Record<string, string | undefined>) =>
  Object.fromEntries(Object.entries(errors).filter(([, v]) => v)) as FieldErrors;

export const validateLoginForm = (email: string, password: string) =>
  clean({ email: validateEmail(email), password: password ? undefined : "Ingresá tu contraseña." });

export const validateRegisterForm = (f: { name: string; email: string; password: string; confirm: string }) =>
  clean({
    name: f.name.trim().length >= 2 ? undefined : "Ingresá tu nombre (mínimo 2 letras).",
    email: validateEmail(f.email),
    password: validatePassword(f.password),
    confirm: f.confirm === f.password ? undefined : "Las contraseñas no coinciden.",
  });

export function validateBookForm(b: BookInput) {
  const year = b.year.trim();
  const copies = b.totalCopies.trim();
  const maxYear = new Date().getFullYear();
  return clean({
    title: b.title.trim() ? undefined : "Ingresá el título.",
    author: b.author.trim() ? undefined : "Ingresá el autor.",
    category: b.category.trim() ? undefined : "Ingresá la categoría.",
    isbn: !b.isbn.trim() || /^[0-9-]{10,17}[0-9X]?$/i.test(b.isbn.trim()) ? undefined : "El ISBN solo admite números y guiones.",
    year:
      !year || (/^\d{4}$/.test(year) && Number(year) >= 1000 && Number(year) <= maxYear)
        ? undefined
        : `El año debe ser un número entre 1000 y ${maxYear}.`,
    totalCopies:
      /^\d+$/.test(copies) && Number(copies) >= 1 && Number(copies) <= 999 ? undefined : "Ingresá un número de ejemplares entre 1 y 999.",
  });
}
