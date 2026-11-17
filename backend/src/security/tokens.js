// Creación y verificación de los tokens JWT (acceso y renovación).
import jwt from "jsonwebtoken";
import { createHash, randomBytes, randomUUID } from "node:crypto";
import { env } from "../config/env.js";

// Token de acceso: dura poco (15 min) y viaja en cada pedido en el encabezado Authorization.
export function signAccessToken(user) {
  return jwt.sign({ sub: String(user.id), role: user.role }, env.jwt.accessSecret, {
    expiresIn: env.jwt.accessTtl,
  });
}

export function verifyAccessToken(token) {
  return jwt.verify(token, env.jwt.accessSecret); // Lanza un error si es inválido o venció.
}

// Token de renovación: dura días y sirve solo para pedir un token de acceso nuevo.
// Lleva un id único (jti) que se guarda en la base para poder revocarlo.
export function signRefreshToken(user) {
  const jti = randomUUID();
  const expiresAt = new Date(Date.now() + env.jwt.refreshDays * 24 * 60 * 60 * 1000);
  const token = jwt.sign({ sub: String(user.id), jti }, env.jwt.refreshSecret, {
    expiresIn: `${env.jwt.refreshDays}d`,
  });
  return { token, jti, expiresAt };
}

export function verifyRefreshToken(token) {
  return jwt.verify(token, env.jwt.refreshSecret);
}

// Código aleatorio de un solo uso (login social) y su hash para guardarlo.
export function randomCode() {
  return randomBytes(32).toString("hex");
}

export function sha256(text) {
  return createHash("sha256").update(text).digest("hex");
}

// «state» firmado para el login social: evita que alguien inyecte un login ajeno.
export function signState(data) {
  return jwt.sign(data, env.jwt.accessSecret, { expiresIn: "10m" });
}

export function verifyState(state) {
  return jwt.verify(state, env.jwt.accessSecret);
}
