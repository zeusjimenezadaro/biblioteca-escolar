// Consultas SQL del catálogo de libros.
import { pool } from "../config/database.js";

const COLUMNS =
  "id, title, author, isbn, category, year, total_copies AS totalCopies, available_copies AS availableCopies, description, created_at AS createdAt, updated_at AS updatedAt";

// Lista con búsqueda (título, autor o ISBN), filtro por categoría y paginación.
export async function list({ q, category, page, limit }) {
  const where = [];
  const params = [];
  if (q) {
    where.push("(title LIKE ? OR author LIKE ? OR isbn LIKE ?)");
    params.push(`%${q}%`, `%${q}%`, `%${q}%`);
  }
  if (category) {
    where.push("category = ?");
    params.push(category);
  }
  const clause = where.length ? `WHERE ${where.join(" AND ")}` : "";
  const offset = (page - 1) * limit;
  // LIMIT y OFFSET ya son enteros validados; se insertan directo porque execute no los acepta como ?.
  const [rows] = await pool.execute(`SELECT ${COLUMNS} FROM books ${clause} ORDER BY title LIMIT ${limit} OFFSET ${offset}`, params);
  const [[{ total }]] = await pool.execute(`SELECT COUNT(*) AS total FROM books ${clause}`, params);
  return { items: rows, total, page, pages: Math.max(1, Math.ceil(total / limit)) };
}

export async function findById(id, connection = pool) {
  const [rows] = await connection.execute(`SELECT ${COLUMNS} FROM books WHERE id = ?`, [id]);
  return rows[0] ?? null;
}

export async function categories() {
  const [rows] = await pool.execute("SELECT DISTINCT category FROM books ORDER BY category");
  return rows.map((r) => r.category);
}

export async function create(b) {
  const [result] = await pool.execute(
    "INSERT INTO books (title, author, isbn, category, year, total_copies, available_copies, description) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
    [b.title, b.author, b.isbn, b.category, b.year, b.totalCopies, b.totalCopies, b.description],
  );
  return findById(result.insertId);
}

// Al cambiar el total, los disponibles se ajustan en la misma diferencia.
export async function update(id, b, connection) {
  await connection.execute(
    `UPDATE books SET title = ?, author = ?, isbn = ?, category = ?, year = ?, description = ?,
       available_copies = available_copies + (? - total_copies), total_copies = ? WHERE id = ?`,
    [b.title, b.author, b.isbn, b.category, b.year, b.description, b.totalCopies, b.totalCopies, id],
  );
  return findById(id, connection);
}

export async function remove(id) {
  const [result] = await pool.execute("DELETE FROM books WHERE id = ?", [id]);
  return result.affectedRows > 0;
}

// Cambia los disponibles (+1 al devolver, -1 al aprobar) dentro de una transacción.
export async function changeAvailable(id, delta, connection) {
  await connection.execute("UPDATE books SET available_copies = available_copies + ? WHERE id = ?", [delta, id]);
}
