// Validación de los datos que llegan a la API. Cada función devuelve los datos limpios
// o lanza un error 400 con el detalle de cada campo inválido.
import { badRequest } from "../utils/http-error.js";

export const ROLES = ["admin", "bibliotecario", "alumno"];
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ISBN = /^[0-9-]{10,17}[0-9X]?$/i;

// Texto: solo strings, sin espacios sobrantes y dentro de un largo permitido.
function text(value, { min = 1, max, label, optional = false }) {
  if (value === undefined || value === null || value === "") {
    return optional ? { value: null } : { error: `${label} es obligatorio.` };
  }
  if (typeof value !== "string") return { error: `${label} debe ser texto.` };
  const clean = value.trim();
  if (clean.length < min) return { error: `${label} debe tener al menos ${min} caracteres.` };
  if (max && clean.length > max) return { error: `${label} admite hasta ${max} caracteres.` };
  return { value: clean };
}

// Número entero dentro de un rango (acepta "3" o 3).
function integer(value, { min, max, label, optional = false }) {
  if (value === undefined || value === null || value === "") {
    return optional ? { value: null } : { error: `${label} es obligatorio.` };
  }
  const n = typeof value === "string" ? Number(value) : value;
  if (!Number.isInteger(n)) return { error: `${label} debe ser un número entero.` };
  if (n < min || n > max) return { error: `${label} debe estar entre ${min} y ${max}.` };
  return { value: n };
}

// Junta los resultados: si hay errores lanza 400, si no devuelve los valores.
function collect(fields) {
  const errors = {};
  const data = {};
  for (const [key, result] of Object.entries(fields)) {
    if (result.error) errors[key] = result.error;
    else data[key] = result.value;
  }
  if (Object.keys(errors).length) throw badRequest("Revisá los datos ingresados.", errors);
  return data;
}

function email(value) {
  const r = text(value, { label: "El correo", max: 254 });
  if (r.error) return r;
  const lower = r.value.toLowerCase();
  return EMAIL.test(lower) ? { value: lower } : { error: "Ingresá un correo válido." };
}

function password(value, label = "La contraseña") {
  if (typeof value !== "string" || !value) return { error: `${label} es obligatoria.` };
  if (value.length < 8 || value.length > 128) return { error: `${label} debe tener entre 8 y 128 caracteres.` };
  if (!/[A-Za-z]/.test(value) || !/[0-9]/.test(value)) return { error: `${label} debe tener letras y números.` };
  return { value };
}

// ----- Autenticación -----
export const validateRegister = (b = {}) =>
  collect({
    name: text(b.name, { label: "El nombre", min: 2, max: 100 }),
    email: email(b.email),
    password: password(b.password),
  });

export const validateLogin = (b = {}) =>
  collect({
    email: email(b.email),
    password: typeof b.password === "string" && b.password ? { value: b.password } : { error: "Ingresá tu contraseña." },
  });

export function validateProfile(b = {}) {
  const data = collect({
    name: text(b.name, { label: "El nombre", min: 2, max: 100 }),
    newPassword: b.newPassword ? password(b.newPassword, "La nueva contraseña") : { value: null },
  });
  data.currentPassword = typeof b.currentPassword === "string" ? b.currentPassword : "";
  return data;
}

// ----- Libros -----
export function validateBook(b = {}) {
  const data = collect({
    title: text(b.title, { label: "El título", max: 200 }),
    author: text(b.author, { label: "El autor", max: 150 }),
    isbn: text(b.isbn, { label: "El ISBN", max: 17, optional: true }),
    category: text(b.category, { label: "La categoría", max: 60 }),
    year: integer(b.year, { label: "El año", min: 1000, max: new Date().getFullYear(), optional: true }),
    totalCopies: integer(b.totalCopies, { label: "La cantidad de ejemplares", min: 1, max: 999 }),
    description: text(b.description, { label: "La descripción", max: 2000, optional: true }),
  });
  if (data.isbn && !ISBN.test(data.isbn)) throw badRequest("Revisá los datos ingresados.", { isbn: "El ISBN solo admite números y guiones." });
  return data;
}

// Filtros y paginación del catálogo (?q=&category=&page=&limit=).
export function validateBookQuery(q = {}) {
  const page = integer(q.page ?? "1", { label: "La página", min: 1, max: 10000 });
  const limit = integer(q.limit ?? "20", { label: "El límite", min: 1, max: 50 });
  return collect({
    q: text(q.q, { label: "La búsqueda", max: 100, optional: true }),
    category: text(q.category, { label: "La categoría", max: 60, optional: true }),
    page,
    limit,
  });
}

// ----- Préstamos -----
export const validateLoanRequest = (b = {}) =>
  collect({ bookId: integer(b.bookId, { label: "El libro", min: 1, max: 2 ** 31 }) });

export function validateLoanAction(b = {}) {
  const actions = ["aprobar", "rechazar", "devolver"];
  if (!actions.includes(b.action)) throw badRequest("Revisá los datos ingresados.", { action: "La acción debe ser aprobar, rechazar o devolver." });
  return { action: b.action };
}

// ----- Usuarios (administrador) -----
export function validateUserUpdate(b = {}) {
  const errors = {};
  const data = {};
  if (b.role !== undefined) {
    if (ROLES.includes(b.role)) data.role = b.role;
    else errors.role = "El rol debe ser admin, bibliotecario o alumno.";
  }
  if (b.active !== undefined) {
    if (typeof b.active === "boolean") data.active = b.active;
    else errors.active = "El estado debe ser verdadero o falso.";
  }
  if (!Object.keys(errors).length && !Object.keys(data).length) errors.role = "Indicá el rol o el estado a cambiar.";
  if (Object.keys(errors).length) throw badRequest("Revisá los datos ingresados.", errors);
  return data;
}

// Id numérico de la ruta (/libros/:id).
export function parseId(value) {
  const id = Number(value);
  if (!Number.isInteger(id) || id < 1) throw badRequest("El identificador no es válido.");
  return id;
}
