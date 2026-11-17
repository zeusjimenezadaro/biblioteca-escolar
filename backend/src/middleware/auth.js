// Middlewares de seguridad: autenticación (¿quién es?) y autorización (¿qué puede hacer?).
import { verifyAccessToken } from "../security/tokens.js";
import * as users from "../repositories/users.repository.js";
import { forbidden, unauthorized } from "../utils/http-error.js";

// Exige el encabezado «Authorization: Bearer <token de acceso>» y carga el usuario en req.user.
export async function authenticate(req, _res, next) {
  const header = req.get("authorization") ?? "";
  const [scheme, token] = header.split(" ");
  if (scheme !== "Bearer" || !token) throw unauthorized();

  let payload;
  try {
    payload = verifyAccessToken(token);
  } catch (error) {
    // La app usa este código para saber que tiene que renovar el token.
    throw unauthorized(error.name === "TokenExpiredError" ? "La sesión expiró." : "Token inválido.");
  }

  // Se consulta la base para tener el rol actualizado y bloquear cuentas desactivadas al instante.
  const user = await users.findById(Number(payload.sub));
  if (!user) throw unauthorized("La cuenta ya no existe.");
  if (!user.active) throw forbidden("Tu cuenta está desactivada. Consultá con un administrador.");
  req.user = user;
  next();
}

// Permite el paso solo a los roles indicados. Ej.: authorize("admin", "bibliotecario").
export function authorize(...roles) {
  return (req, _res, next) => {
    if (!roles.includes(req.user.role)) throw forbidden();
    next();
  };
}
