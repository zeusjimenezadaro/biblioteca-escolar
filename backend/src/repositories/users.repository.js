// Consultas SQL de usuarios y cuentas sociales. Todas usan parámetros (?) para evitar inyección SQL.
import { pool } from "../config/database.js";

// Columnas públicas: nunca se devuelve el hash de la contraseña.
const PUBLIC = "id, name, email, role, active, avatar_url AS avatarUrl, created_at AS createdAt, (password_hash IS NOT NULL) AS hasPassword";

// Convierte los 0/1 de MySQL en booleanos para el JSON.
const toUser = (row) => (row ? { ...row, active: Boolean(row.active), hasPassword: Boolean(row.hasPassword) } : null);

export async function findById(id) {
  const [rows] = await pool.execute(`SELECT ${PUBLIC} FROM users WHERE id = ?`, [id]);
  return toUser(rows[0]);
}

// Incluye el hash: solo para verificar la contraseña en el login.
export async function findByEmailWithPassword(email) {
  const [rows] = await pool.execute("SELECT id, name, email, role, active, password_hash FROM users WHERE email = ?", [email]);
  return rows[0] ? { ...rows[0], active: Boolean(rows[0].active) } : null;
}

export async function findPasswordHash(id) {
  const [rows] = await pool.execute("SELECT password_hash FROM users WHERE id = ?", [id]);
  return rows[0]?.password_hash ?? null;
}

export async function create({ name, email, passwordHash = null, role = "alumno", avatarUrl = null }) {
  const [result] = await pool.execute(
    "INSERT INTO users (name, email, password_hash, role, avatar_url) VALUES (?, ?, ?, ?, ?)",
    [name, email, passwordHash, role, avatarUrl],
  );
  return findById(result.insertId);
}

export async function updateProfile(id, { name, passwordHash }) {
  if (passwordHash) await pool.execute("UPDATE users SET name = ?, password_hash = ? WHERE id = ?", [name, passwordHash, id]);
  else await pool.execute("UPDATE users SET name = ? WHERE id = ?", [name, id]);
  return findById(id);
}

// Listado para el administrador, con búsqueda opcional por nombre o correo.
export async function list(search) {
  const like = `%${search ?? ""}%`;
  const [rows] = await pool.execute(
    `SELECT ${PUBLIC} FROM users WHERE name LIKE ? OR email LIKE ? ORDER BY created_at DESC`,
    [like, like],
  );
  return rows.map(toUser);
}

// Cambia el rol y/o el estado (solo los campos enviados).
export async function updateAdmin(id, { role, active }) {
  if (role !== undefined) await pool.execute("UPDATE users SET role = ? WHERE id = ?", [role, id]);
  if (active !== undefined) await pool.execute("UPDATE users SET active = ? WHERE id = ?", [active ? 1 : 0, id]);
  return findById(id);
}

export async function remove(id) {
  const [result] = await pool.execute("DELETE FROM users WHERE id = ?", [id]);
  return result.affectedRows > 0;
}

// ----- Cuentas sociales -----
export async function findBySocial(provider, providerUserId) {
  const [rows] = await pool.execute(
    `SELECT u.id FROM social_accounts s JOIN users u ON u.id = s.user_id WHERE s.provider = ? AND s.provider_user_id = ?`,
    [provider, providerUserId],
  );
  return rows[0] ? findById(rows[0].id) : null;
}

export async function findByEmail(email) {
  const [rows] = await pool.execute("SELECT id FROM users WHERE email = ?", [email]);
  return rows[0] ? findById(rows[0].id) : null;
}

export async function linkSocial(userId, provider, providerUserId) {
  await pool.execute(
    "INSERT IGNORE INTO social_accounts (user_id, provider, provider_user_id) VALUES (?, ?, ?)",
    [userId, provider, providerUserId],
  );
}

export async function listSocialProviders(userId) {
  const [rows] = await pool.execute("SELECT provider FROM social_accounts WHERE user_id = ?", [userId]);
  return rows.map((r) => r.provider);
}
