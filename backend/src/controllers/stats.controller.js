// Resumen para la pantalla de inicio: cada rol recibe los datos que le corresponden.
import { pool } from "../config/database.js";
import * as loans from "../repositories/loans.repository.js";

// GET /api/stats
export async function summary(req, res) {
  // El alumno solo ve el estado de sus propios préstamos.
  if (req.user.role === "alumno") {
    return res.json({ ok: true, stats: { myLoans: await loans.countByStatus(req.user.id) } });
  }
  const [[books]] = await pool.execute(
    "SELECT COUNT(*) AS titles, COALESCE(SUM(total_copies), 0) AS copies, COALESCE(SUM(available_copies), 0) AS available FROM books",
  );
  const stats = {
    books: { titles: books.titles, copies: Number(books.copies), available: Number(books.available) },
    loans: await loans.countByStatus(),
    overdue: await loans.countOverdue(),
  };
  // El administrador también ve cuántos usuarios hay de cada rol.
  if (req.user.role === "admin") {
    const [rows] = await pool.execute("SELECT role, COUNT(*) AS total FROM users GROUP BY role");
    stats.users = Object.fromEntries(rows.map((r) => [r.role, r.total]));
  }
  res.json({ ok: true, stats });
}
