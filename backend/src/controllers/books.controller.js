// CRUD del catálogo. Leer: cualquier usuario logueado. Crear, editar y borrar: bibliotecario o admin.
import * as books from "../repositories/books.repository.js";
import * as loans from "../repositories/loans.repository.js";
import { transaction } from "../config/database.js";
import { parseId, validateBook, validateBookQuery } from "../validation/validators.js";
import { badRequest, conflict, notFound } from "../utils/http-error.js";

// GET /api/books?q=&category=&page=&limit=
export async function list(req, res) {
  res.json({ ok: true, ...(await books.list(validateBookQuery(req.query))) });
}

// GET /api/books/categories
export async function categories(_req, res) {
  res.json({ ok: true, categories: await books.categories() });
}

// GET /api/books/:id
export async function detail(req, res) {
  const book = await books.findById(parseId(req.params.id));
  if (!book) throw notFound("El libro no existe.");
  res.json({ ok: true, book });
}

// POST /api/books
export async function create(req, res) {
  const book = await books.create(validateBook(req.body));
  res.status(201).json({ ok: true, book, message: "Libro agregado." });
}

// PUT /api/books/:id
export async function update(req, res) {
  const id = parseId(req.params.id);
  const data = validateBook(req.body);
  const book = await transaction(async (connection) => {
    const current = await books.findById(id, connection);
    if (!current) throw notFound("El libro no existe.");
    // No se puede bajar el total por debajo de los ejemplares que están prestados ahora.
    const lent = current.totalCopies - current.availableCopies;
    if (data.totalCopies < lent) {
      throw badRequest("Revisá los datos ingresados.", {
        totalCopies: `Hay ${lent} ejemplar(es) prestado(s): el total no puede ser menor.`,
      });
    }
    return books.update(id, data, connection);
  });
  res.json({ ok: true, book, message: "Libro actualizado." });
}

// DELETE /api/books/:id
export async function remove(req, res) {
  const id = parseId(req.params.id);
  if (!(await books.findById(id))) throw notFound("El libro no existe.");
  if ((await loans.countActiveForBook(id)) > 0) {
    throw conflict("No se puede eliminar: el libro tiene préstamos pendientes o sin devolver.");
  }
  await books.remove(id);
  res.json({ ok: true, message: "Libro eliminado." });
}
