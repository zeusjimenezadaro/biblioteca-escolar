// Consultas SQL de tokens de renovación y códigos de login social.
import { pool } from "../config/database.js";

// Guarda el id (jti) del token de renovación emitido.
export async function saveRefresh(jti, userId, expiresAt) {
  await pool.execute("INSERT INTO refresh_tokens (id, user_id, expires_at) VALUES (?, ?, ?)", [jti, userId, expiresAt]);
}

// Marca el token como usado. Devuelve true solo si estaba vigente (cada token sirve una sola vez).
export async function consumeRefresh(jti, userId) {
  const [result] = await pool.execute(
    "UPDATE refresh_tokens SET revoked_at = UTC_TIMESTAMP() WHERE id = ? AND user_id = ? AND revoked_at IS NULL AND expires_at > UTC_TIMESTAMP()",
    [jti, userId],
  );
  return result.affectedRows === 1;
}

// Cierra todas las sesiones de un usuario (por ejemplo, si se reutiliza un token robado).
export async function revokeAllForUser(userId) {
  await pool.execute("UPDATE refresh_tokens SET revoked_at = UTC_TIMESTAMP() WHERE user_id = ? AND revoked_at IS NULL", [userId]);
}

// Código de un solo uso del login social: vale 2 minutos.
export async function saveOAuthCode(codeHash, userId) {
  await pool.execute(
    "INSERT INTO oauth_codes (code_hash, user_id, expires_at) VALUES (?, ?, UTC_TIMESTAMP() + INTERVAL 2 MINUTE)",
    [codeHash, userId],
  );
}

// Canjea el código: devuelve el id del usuario solo si es válido y no se usó antes.
export async function consumeOAuthCode(codeHash) {
  const [result] = await pool.execute(
    "UPDATE oauth_codes SET used_at = UTC_TIMESTAMP() WHERE code_hash = ? AND used_at IS NULL AND expires_at > UTC_TIMESTAMP()",
    [codeHash],
  );
  if (result.affectedRows !== 1) return null;
  const [rows] = await pool.execute("SELECT user_id FROM oauth_codes WHERE code_hash = ?", [codeHash]);
  return rows[0]?.user_id ?? null;
}
