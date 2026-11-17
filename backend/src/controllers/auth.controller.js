// Registro, inicio de sesión, renovación de tokens, cierre de sesión y perfil propio.
import * as users from "../repositories/users.repository.js";
import * as tokens from "../repositories/tokens.repository.js";
import { hashPassword, verifyPassword } from "../security/password.js";
import { verifyRefreshToken } from "../security/tokens.js";
import { createSession } from "../services/session.service.js";
import { validateLogin, validateProfile, validateRegister } from "../validation/validators.js";
import { badRequest, conflict, forbidden, unauthorized } from "../utils/http-error.js";

// Hash de relleno: se verifica igual cuando el correo no existe, para no revelar qué cuentas hay.
const dummyHash = await hashPassword("relleno-sin-uso-1234");

// POST /api/auth/register — crea una cuenta con rol «alumno» e inicia sesión.
export async function register(req, res) {
  const data = validateRegister(req.body);
  if (await users.findByEmail(data.email)) throw conflict("Ya existe una cuenta con ese correo.");
  const user = await users.create({ name: data.name, email: data.email, passwordHash: await hashPassword(data.password) });
  res.status(201).json(await createSession(user));
}

// POST /api/auth/login — verifica correo y contraseña.
export async function login(req, res) {
  const { email, password } = validateLogin(req.body);
  const found = await users.findByEmailWithPassword(email);
  const valid = await verifyPassword(password, found?.password_hash ?? dummyHash);
  if (!found || !valid) throw unauthorized("Correo o contraseña incorrectos.");
  if (!found.active) throw forbidden("Tu cuenta está desactivada. Consultá con un administrador.");
  res.json(await createSession(await users.findById(found.id)));
}

// POST /api/auth/refresh — cambia un token de renovación válido por un par nuevo (rotación).
export async function refresh(req, res) {
  const token = req.body?.refreshToken;
  if (typeof token !== "string" || !token) throw badRequest("Falta el token de renovación.");
  let payload;
  try {
    payload = verifyRefreshToken(token);
  } catch {
    throw unauthorized("La sesión expiró. Volvé a iniciar sesión.");
  }
  const userId = Number(payload.sub);
  // Cada token de renovación sirve una sola vez. Si llega uno ya usado, puede ser robado:
  // por seguridad se cierran todas las sesiones de ese usuario.
  if (!(await tokens.consumeRefresh(payload.jti, userId))) {
    await tokens.revokeAllForUser(userId);
    throw unauthorized("La sesión ya no es válida. Volvé a iniciar sesión.");
  }
  const user = await users.findById(userId);
  if (!user) throw unauthorized("La cuenta ya no existe.");
  if (!user.active) throw forbidden("Tu cuenta está desactivada. Consultá con un administrador.");
  res.json(await createSession(user));
}

// POST /api/auth/logout — revoca el token de renovación de este dispositivo.
export async function logout(req, res) {
  const token = req.body?.refreshToken;
  if (typeof token === "string" && token) {
    try {
      const payload = verifyRefreshToken(token);
      await tokens.consumeRefresh(payload.jti, Number(payload.sub));
    } catch {
      // Si el token ya no sirve, la sesión ya estaba cerrada: no es un error.
    }
  }
  res.json({ ok: true, message: "Sesión cerrada." });
}

// GET /api/auth/me — datos del usuario logueado y redes vinculadas.
export async function me(req, res) {
  const providers = await users.listSocialProviders(req.user.id);
  res.json({ ok: true, user: { ...req.user, providers } });
}

// PUT /api/auth/me — cambia el nombre y, opcionalmente, la contraseña.
export async function updateMe(req, res) {
  const data = validateProfile(req.body);
  let passwordHash = null;
  if (data.newPassword) {
    const current = await users.findPasswordHash(req.user.id);
    // Si la cuenta ya tiene contraseña, hay que confirmar la actual para cambiarla.
    if (current && !(await verifyPassword(data.currentPassword, current))) {
      throw badRequest("Revisá los datos ingresados.", { currentPassword: "La contraseña actual no es correcta." });
    }
    passwordHash = await hashPassword(data.newPassword);
  }
  const user = await users.updateProfile(req.user.id, { name: data.name, passwordHash });
  res.json({ ok: true, user, message: "Perfil actualizado." });
}
