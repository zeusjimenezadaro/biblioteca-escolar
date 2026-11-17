// Gestión de usuarios: exclusiva del administrador.
import * as users from "../repositories/users.repository.js";
import * as tokens from "../repositories/tokens.repository.js";
import { parseId, validateUserUpdate } from "../validation/validators.js";
import { badRequest, notFound } from "../utils/http-error.js";

// GET /api/users?q=
export async function list(req, res) {
  const q = typeof req.query.q === "string" ? req.query.q.trim().slice(0, 100) : "";
  res.json({ ok: true, items: await users.list(q) });
}

// PATCH /api/users/:id { role?, active? }
export async function update(req, res) {
  const id = parseId(req.params.id);
  const data = validateUserUpdate(req.body);
  // Un administrador no puede quitarse su propio rol ni desactivarse (quedaría sin acceso).
  if (id === req.user.id) throw badRequest("No podés cambiar tu propio rol ni desactivar tu cuenta.");
  if (!(await users.findById(id))) throw notFound("El usuario no existe.");
  const user = await users.updateAdmin(id, data);
  if (data.active === false) await tokens.revokeAllForUser(id); // Cierra sus sesiones abiertas.
  res.json({ ok: true, user, message: "Usuario actualizado." });
}

// DELETE /api/users/:id
export async function remove(req, res) {
  const id = parseId(req.params.id);
  if (id === req.user.id) throw badRequest("No podés eliminar tu propia cuenta.");
  if (!(await users.remove(id))) throw notFound("El usuario no existe.");
  res.json({ ok: true, message: "Usuario eliminado." });
}
