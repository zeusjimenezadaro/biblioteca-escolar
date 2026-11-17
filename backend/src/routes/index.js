// Todas las rutas de la API y qué roles pueden usar cada una.
import { Router } from "express";
import { rateLimit } from "express-rate-limit";
import { authenticate, authorize } from "../middleware/auth.js";
import * as auth from "../controllers/auth.controller.js";
import * as oauth from "../controllers/oauth.controller.js";
import * as booksC from "../controllers/books.controller.js";
import * as loansC from "../controllers/loans.controller.js";
import * as usersC from "../controllers/users.controller.js";
import * as stats from "../controllers/stats.controller.js";
import { pool } from "../config/database.js";

export const router = Router();

// Limita los intentos de login y registro para frenar ataques de fuerza bruta.
const authLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { ok: false, message: "Demasiados intentos. Esperá unos minutos y volvé a probar." },
});

const STAFF = ["admin", "bibliotecario"];

// Estado del servidor y de la base de datos.
router.get("/health", async (_req, res) => {
  await pool.query("SELECT 1");
  res.json({ ok: true, database: "connected" });
});

// ----- Autenticación (pública) -----
router.post("/auth/register", authLimit, auth.register);
router.post("/auth/login", authLimit, auth.login);
router.post("/auth/refresh", auth.refresh);
router.post("/auth/logout", auth.logout);
router.get("/auth/oauth/providers", oauth.available);
router.get("/auth/oauth/:provider/start", oauth.start);
router.get("/auth/oauth/:provider/callback", oauth.callback);
router.post("/auth/oauth/exchange", authLimit, oauth.exchange);

// ----- Desde acá, todas las rutas requieren iniciar sesión -----
router.use(authenticate);

router.get("/auth/me", auth.me);
router.put("/auth/me", auth.updateMe);
router.get("/stats", stats.summary);

// Libros: todos leen; el personal crea, edita y elimina.
router.get("/books", booksC.list);
router.get("/books/categories", booksC.categories);
router.get("/books/:id", booksC.detail);
router.post("/books", authorize(...STAFF), booksC.create);
router.put("/books/:id", authorize(...STAFF), booksC.update);
router.delete("/books/:id", authorize(...STAFF), booksC.remove);

// Préstamos: el alumno pide; el personal aprueba, rechaza o registra devoluciones.
router.get("/loans", loansC.list);
router.post("/loans", authorize("alumno"), loansC.create);
router.patch("/loans/:id", authorize(...STAFF), loansC.changeStatus);
router.delete("/loans/:id", authorize("alumno", "admin"), loansC.remove);

// Usuarios: solo el administrador.
router.get("/users", authorize("admin"), usersC.list);
router.patch("/users/:id", authorize("admin"), usersC.update);
router.delete("/users/:id", authorize("admin"), usersC.remove);
