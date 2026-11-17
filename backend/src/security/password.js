// Manejo seguro de contraseñas con scrypt (incluido en Node.js, sin dependencias externas).
import { randomBytes, scrypt as derive, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

const scrypt = promisify(derive);

// Cada contraseña usa una sal aleatoria; nunca se guarda el texto original.
export async function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const key = await scrypt(password, salt, 64);
  return `${salt}:${key.toString("hex")}`; // Formato guardado: sal:hash.
}

// Compara la contraseña escrita con el hash guardado.
export async function verifyPassword(password, stored) {
  if (!stored) return false; // Cuenta sin contraseña (solo red social).
  const [salt, hex] = stored.split(":");
  if (!salt || !hex || hex.length !== 128) return false;
  const expected = Buffer.from(hex, "hex");
  const actual = await scrypt(password, salt, expected.length);
  // Comparación en tiempo constante: no revela cuántos caracteres coinciden.
  return timingSafeEqual(actual, expected);
}
