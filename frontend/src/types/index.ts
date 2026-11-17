// Tipos de los datos que maneja la app (iguales a los que devuelve la API).

export type Role = "admin" | "bibliotecario" | "alumno";
export type Provider = "google" | "github" | "discord";

export type User = {
  id: number;
  name: string;
  email: string;
  role: Role;
  active: boolean;
  avatarUrl: string | null;
  hasPassword: boolean; // false si la cuenta solo entra con una red social.
  createdAt: string;
  providers?: Provider[]; // Redes sociales vinculadas.
};

export type Session = { user: User; accessToken: string; refreshToken: string };

export type Book = {
  id: number;
  title: string;
  author: string;
  isbn: string | null;
  category: string;
  year: number | null;
  totalCopies: number;
  availableCopies: number;
  description: string | null;
};

// Datos del formulario de libro (lo que se envía al crear o editar).
export type BookInput = {
  title: string;
  author: string;
  isbn: string;
  category: string;
  year: string;
  totalCopies: string;
  description: string;
};

export type Page<T> = { items: T[]; total: number; page: number; pages: number };

export type LoanStatus = "pendiente" | "aprobado" | "rechazado" | "devuelto";

export type Loan = {
  id: number;
  status: LoanStatus;
  requestedAt: string;
  decidedAt: string | null;
  dueDate: string | null;
  returnedAt: string | null;
  bookId: number;
  bookTitle: string;
  bookAuthor: string;
  userId: number;
  userName: string;
  userEmail: string;
};

export type LoanAction = "aprobar" | "rechazar" | "devolver";

export type Stats = {
  myLoans?: Partial<Record<LoanStatus, number>>;
  books?: { titles: number; copies: number; available: number };
  loans?: Partial<Record<LoanStatus, number>>;
  overdue?: number;
  users?: Partial<Record<Role, number>>;
};

// Errores por campo que devuelve la API (status 400).
export type FieldErrors = Record<string, string>;
