// Consultas SQL de préstamos.
import { pool } from "../config/database.js";

// Cada préstamo se devuelve con los datos del libro y del alumno.
const SELECT = `
  SELECT l.id, l.status, l.requested_at AS requestedAt, l.decided_at AS decidedAt, l.due_date AS dueDate,
         l.returned_at AS returnedAt, l.book_id AS bookId, b.title AS bookTitle, b.author AS bookAuthor,
         l.user_id AS userId, u.name AS userName, u.email AS userEmail
  FROM loans l JOIN books b ON b.id = l.book_id JOIN users u ON u.id = l.user_id`;

// Listado con filtros opcionales por alumno y por estado; los más recientes primero.
export async function list({ userId, status }) {
  const where = [];
  const params = [];
  if (userId) {
    where.push("l.user_id = ?");
    params.push(userId);
  }
  if (status) {
    where.push("l.status = ?");
    params.push(status);
  }
  const clause = where.length ? `WHERE ${where.join(" AND ")}` : "";
  const [rows] = await pool.execute(`${SELECT} ${clause} ORDER BY l.requested_at DESC, l.id DESC`, params);
  return rows;
}

export async function findById(id, connection = pool) {
  const [rows] = await connection.execute(`${SELECT} WHERE l.id = ?`, [id]);
  return rows[0] ?? null;
}

// Préstamos pendientes o aprobados de un alumno (para limitar cuántos puede tener).
export async function countActive(userId) {
  const [[row]] = await pool.execute(
    "SELECT COUNT(*) AS total FROM loans WHERE user_id = ? AND status IN ('pendiente', 'aprobado')",
    [userId],
  );
  return row.total;
}

export async function hasActiveForBook(userId, bookId) {
  const [rows] = await pool.execute(
    "SELECT id FROM loans WHERE user_id = ? AND book_id = ? AND status IN ('pendiente', 'aprobado') LIMIT 1",
    [userId, bookId],
  );
  return rows.length > 0;
}

export async function countActiveForBook(bookId) {
  const [[row]] = await pool.execute(
    "SELECT COUNT(*) AS total FROM loans WHERE book_id = ? AND status IN ('pendiente', 'aprobado')",
    [bookId],
  );
  return row.total;
}

export async function create(userId, bookId) {
  const [result] = await pool.execute("INSERT INTO loans (user_id, book_id) VALUES (?, ?)", [userId, bookId]);
  return findById(result.insertId);
}

// Bloquea la fila del préstamo hasta terminar la transacción (evita aprobar dos veces a la vez).
export async function lock(id, connection) {
  const [rows] = await connection.execute("SELECT id, status, book_id AS bookId FROM loans WHERE id = ? FOR UPDATE", [id]);
  return rows[0] ?? null;
}

export async function setStatus(id, status, deciderId, connection) {
  if (status === "aprobado") {
    // Plazo de devolución: 14 días desde la aprobación.
    await connection.execute(
      "UPDATE loans SET status = 'aprobado', decided_at = UTC_TIMESTAMP(), decided_by = ?, due_date = UTC_DATE() + INTERVAL 14 DAY WHERE id = ?",
      [deciderId, id],
    );
  } else if (status === "rechazado") {
    await connection.execute("UPDATE loans SET status = 'rechazado', decided_at = UTC_TIMESTAMP(), decided_by = ? WHERE id = ?", [deciderId, id]);
  } else {
    await connection.execute("UPDATE loans SET status = 'devuelto', returned_at = UTC_TIMESTAMP() WHERE id = ?", [id]);
  }
}

export async function remove(id) {
  const [result] = await pool.execute("DELETE FROM loans WHERE id = ?", [id]);
  return result.affectedRows > 0;
}

// Resumen para la pantalla de inicio: cantidad de préstamos por estado.
export async function countByStatus(userId) {
  const [rows] = await pool.execute(
    `SELECT status, COUNT(*) AS total FROM loans ${userId ? "WHERE user_id = ?" : ""} GROUP BY status`,
    userId ? [userId] : [],
  );
  return Object.fromEntries(rows.map((r) => [r.status, r.total]));
}

// Préstamos aprobados cuya fecha límite ya pasó.
export async function countOverdue() {
  const [[row]] = await pool.execute("SELECT COUNT(*) AS total FROM loans WHERE status = 'aprobado' AND due_date < UTC_DATE()");
  return row.total;
}
