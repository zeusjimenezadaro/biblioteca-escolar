// Emite el par de tokens (acceso + renovación) de una sesión nueva.
import { signAccessToken, signRefreshToken } from "../security/tokens.js";
import * as tokens from "../repositories/tokens.repository.js";

export async function createSession(user) {
  const refresh = signRefreshToken(user);
  await tokens.saveRefresh(refresh.jti, user.id, refresh.expiresAt); // Se guarda para poder revocarlo.
  return {
    ok: true,
    user,
    accessToken: signAccessToken(user),
    refreshToken: refresh.token,
  };
}
