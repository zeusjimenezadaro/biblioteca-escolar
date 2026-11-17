// Préstamos. El alumno pide y cancela los suyos; el bibliotecario y el admin los gestionan todos.
import * as books from "../repositories/books.repository.js";
import * as loans from "../repositories/loans.repository.js";
import { transaction } from "../config/database.js";
import { parseId, validateLoanAction, validateLoanRequest } from "../validation/validators.js";
import { badRequest, conflict, forbidden, notFound } from "../utils/http-error.js";

const MAX_ACTIVE = 3; // Préstamos pendientes o aprobados que puede tener un alumno a la vez.
const STATUSES = ["pendiente", "aprobado", "rechazado", "devuelto"];
const isStaff = (user) => user.role === "admin" || user.role === "bibliotecario";

// GET /api/loans?status= — el alumno ve solo los suyos; el personal ve todos.
export async function list(req, res) {
  const status = req.query.status;
  if (status !== undefined && !STATUSES.includes(status)) throw badRequest("El estado no es válido.");
  const items = await loans.list({ status, userId: isStaff(req.user) ? undefined : req.user.id });
  res.json({ ok: true, items });
}

// POST /api/loans { bookId } — solo alumnos.
export async function create(req, res) {
  const { bookId } = validateLoanRequest(req.body);
  const book = await books.findById(bookId);
  if (!book) throw notFound("El libro no existe.");
  if (book.availableCopies < 1) throw conflict("No hay ejemplares disponibles de este libro.");
  if (await loans.hasActiveForBook(req.user.id, bookId)) throw conflict("Ya tenés un préstamo activo o pendiente de este libro.");
  if ((await loans.countActive(req.user.id)) >= MAX_ACTIVE) {
    throw conflict(`Podés tener hasta ${MAX_ACTIVE} préstamos activos o pendientes.`);
  }
  const loan = await loans.create(req.user.id, bookId);
  res.status(201).json({ ok: true, loan, message: "Préstamo solicitado. Esperá la aprobación del bibliotecario." });
}

// PATCH /api/loans/:id { action: aprobar | rechazar | devolver } — personal de la biblioteca.
export async function changeStatus(req, res) {
  const id = parseId(req.params.id);
  const { action } = validateLoanAction(req.body);

  const loan = await transaction(async (connection) => {
    const current = await loans.lock(id, connection); // Bloquea el préstamo mientras se modifica.
    if (!current) throw notFound("El préstamo no existe.");

    if (action === "aprobar" || action === "rechazar") {
      if (current.status !== "pendiente") throw conflict("Solo se pueden aprobar o rechazar préstamos pendientes.");
      if (action === "aprobar") {
        const book = await books.findById(current.bookId, connection);
        if (book.availableCopies < 1) throw conflict("No quedan ejemplares disponibles para aprobarlo.");
        await books.changeAvailable(current.bookId, -1, connection); // El ejemplar sale de la biblioteca.
      }
      await loans.setStatus(id, action === "aprobar" ? "aprobado" : "rechazado", req.user.id, connection);
    } else {
      if (current.status !== "aprobado") throw conflict("Solo se pueden devolver préstamos aprobados.");
      await books.changeAvailable(current.bookId, 1, connection); // El ejemplar vuelve.
      await loans.setStatus(id, "devuelto", req.user.id, connection);
    }
    return loans.findById(id, connection);
  });

  const messages = { aprobar: "Préstamo aprobado.", rechazar: "Préstamo rechazado.", devolver: "Devolución registrada." };
  res.json({ ok: true, loan, message: messages[action] });
}

// DELETE /api/loans/:id — el alumno cancela su pedido pendiente; el admin borra registros cerrados.
export async function remove(req, res) {
  const id = parseId(req.params.id);
  const loan = await loans.findById(id);
  if (!loan) throw notFound("El préstamo no existe.");

  if (req.user.role === "admin") {
    // Un préstamo aprobado tiene un ejemplar afuera: primero hay que registrar la devolución.
    if (loan.status === "aprobado") throw conflict("Registrá la devolución antes de eliminar este préstamo.");
  } else {
    if (loan.userId !== req.user.id) throw forbidden("Solo podés cancelar tus propios préstamos.");
    if (loan.status !== "pendiente") throw conflict("Solo podés cancelar préstamos pendientes.");
  }
  await loans.remove(id);
  res.json({ ok: true, message: req.user.role === "admin" ? "Préstamo eliminado." : "Pedido cancelado." });
}
