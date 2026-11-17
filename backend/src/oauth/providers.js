// Datos de cada red social: dónde se autoriza, dónde se canjea el código y cómo leer el perfil.
import { env } from "../config/env.js";

// Pide JSON y lanza un error claro si la red social responde con error.
async function getJson(url, options) {
  const response = await fetch(url, options);
  const data = await response.json().catch(() => null);
  if (!response.ok || !data) throw new Error(`La red social respondió ${response.status}.`);
  return data;
}

export const providers = {
  google: {
    name: "Google",
    authorizeUrl: "https://accounts.google.com/o/oauth2/v2/auth",
    scope: "openid email profile",
    extraParams: { prompt: "select_account" }, // Permite elegir entre varias cuentas.
    async exchange(code, redirectUri) {
      return getJson("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          code,
          client_id: env.oauth.google.clientId,
          client_secret: env.oauth.google.clientSecret,
          redirect_uri: redirectUri,
          grant_type: "authorization_code",
        }),
      });
    },
    async profile(accessToken) {
      const p = await getJson("https://openidconnect.googleapis.com/v1/userinfo", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      return { id: p.sub, email: p.email_verified ? p.email : null, name: p.name, avatarUrl: p.picture };
    },
  },

  github: {
    name: "GitHub",
    authorizeUrl: "https://github.com/login/oauth/authorize",
    scope: "read:user user:email",
    extraParams: {},
    async exchange(code, redirectUri) {
      return getJson("https://github.com/login/oauth/access_token", {
        method: "POST",
        headers: { Accept: "application/json", "Content-Type": "application/json" },
        body: JSON.stringify({
          code,
          client_id: env.oauth.github.clientId,
          client_secret: env.oauth.github.clientSecret,
          redirect_uri: redirectUri,
        }),
      });
    },
    async profile(accessToken) {
      const headers = { Authorization: `Bearer ${accessToken}`, "User-Agent": "biblioteca-escolar" };
      const p = await getJson("https://api.github.com/user", { headers });
      // El correo puede ser privado: se busca el principal y verificado en la lista de correos.
      const emails = await getJson("https://api.github.com/user/emails", { headers });
      const primary = emails.find((e) => e.primary && e.verified);
      return { id: String(p.id), email: primary?.email ?? null, name: p.name || p.login, avatarUrl: p.avatar_url };
    },
  },

  discord: {
    name: "Discord",
    authorizeUrl: "https://discord.com/oauth2/authorize",
    scope: "identify email",
    extraParams: { prompt: "consent" },
    async exchange(code, redirectUri) {
      return getJson("https://discord.com/api/oauth2/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          code,
          client_id: env.oauth.discord.clientId,
          client_secret: env.oauth.discord.clientSecret,
          redirect_uri: redirectUri,
          grant_type: "authorization_code",
        }),
      });
    },
    async profile(accessToken) {
      const p = await getJson("https://discord.com/api/users/@me", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const avatarUrl = p.avatar ? `https://cdn.discordapp.com/avatars/${p.id}/${p.avatar}.png` : null;
      return { id: p.id, email: p.verified ? p.email : null, name: p.global_name || p.username, avatarUrl };
    },
  },
};

// Dirección a la que vuelve cada red social (debe estar registrada en su panel de desarrollador).
export const callbackUrl = (provider) => `${env.publicUrl}/api/auth/oauth/${provider}/callback`;

// true si la red tiene sus credenciales cargadas.
export const isConfigured = (provider) => Boolean(env.oauth[provider]?.clientId && env.oauth[provider]?.clientSecret);
