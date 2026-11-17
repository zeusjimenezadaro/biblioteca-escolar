// Funciones para cada recurso de la API. Las pantallas usan estas funciones, nunca fetch directamente.
import { api } from "./api";
import { API_URL } from "../config";
import type { Book, BookInput, Loan, LoanAction, LoanStatus, Page, Provider, Role, Session, Stats, User } from "../types";

type SessionResponse = Session & { ok: true };

// ----- Autenticación -----
export const authService = {
  login: (email: string, password: string) =>
    api<SessionResponse>("/auth/login", { method: "POST", body: { email, password }, auth: false }),
  register: (name: string, email: string, password: string) =>
    api<SessionResponse>("/auth/register", { method: "POST", body: { name, email, password }, auth: false }),
  logout: (refreshToken: string) => api("/auth/logout", { method: "POST", body: { refreshToken }, auth: false }),
  me: () => api<{ user: User }>("/auth/me"),
  updateMe: (data: { name: string; currentPassword?: string; newPassword?: string }) =>
    api<{ user: User; message: string }>("/auth/me", { method: "PUT", body: data }),
  providers: () => api<{ providers: Provider[] }>("/auth/oauth/providers", { auth: false }),
  exchangeCode: (code: string) => api<SessionResponse>("/auth/oauth/exchange", { method: "POST", body: { code }, auth: false }),
  // Dirección que se abre en el navegador para iniciar sesión con una red social.
  oauthStartUrl: (provider: Provider, redirect: string) =>
    `${API_URL}/api/auth/oauth/${provider}/start?redirect=${encodeURIComponent(redirect)}`,
};

// Convierte el formulario (todo texto) en los datos que espera la API.
const toBookBody = (b: BookInput) => ({
  title: b.title,
  author: b.author,
  isbn: b.isbn.trim() || null,
  category: b.category,
  year: b.year.trim() ? Number(b.year) : null,
  totalCopies: Number(b.totalCopies),
  description: b.description.trim() || null,
});

// ----- Libros -----
export const booksService = {
  list: (params: { q?: string; category?: string; page?: number }) => {
    const query = new URLSearchParams();
    if (params.q) query.set("q", params.q);
    if (params.category) query.set("category", params.category);
    query.set("page", String(params.page ?? 1));
    return api<Page<Book>>(`/books?${query}`);
  },
  categories: () => api<{ categories: string[] }>("/books/categories"),
  get: (id: number) => api<{ book: Book }>(`/books/${id}`),
  create: (b: BookInput) => api<{ book: Book; message: string }>("/books", { method: "POST", body: toBookBody(b) }),
  update: (id: number, b: BookInput) =>
    api<{ book: Book; message: string }>(`/books/${id}`, { method: "PUT", body: toBookBody(b) }),
  remove: (id: number) => api<{ message: string }>(`/books/${id}`, { method: "DELETE" }),
};

// ----- Préstamos -----
export const loansService = {
  list: (status?: LoanStatus) => api<{ items: Loan[] }>(`/loans${status ? `?status=${status}` : ""}`),
  request: (bookId: number) => api<{ loan: Loan; message: string }>("/loans", { method: "POST", body: { bookId } }),
  act: (id: number, action: LoanAction) =>
    api<{ loan: Loan; message: string }>(`/loans/${id}`, { method: "PATCH", body: { action } }),
  remove: (id: number) => api<{ message: string }>(`/loans/${id}`, { method: "DELETE" }),
};

// ----- Usuarios (administrador) -----
export const usersService = {
  list: (q = "") => api<{ items: User[] }>(`/users${q ? `?q=${encodeURIComponent(q)}` : ""}`),
  update: (id: number, data: { role?: Role; active?: boolean }) =>
    api<{ user: User; message: string }>(`/users/${id}`, { method: "PATCH", body: data }),
  remove: (id: number) => api<{ message: string }>(`/users/${id}`, { method: "DELETE" }),
};

export const statsService = { get: () => api<{ stats: Stats }>("/stats") };
