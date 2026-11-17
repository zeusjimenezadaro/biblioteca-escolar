// Login con redes sociales (Google, GitHub y Discord) usando OAuth 2.0.
//
// Recorrido:
// 1. La app abre /api/auth/oauth/:provider/start en el navegador del celular.
// 2. La API redirige a la red social, donde el usuario inicia sesión y autoriza.
// 3. La red social vuelve a /callback con un código; la API lo canjea y obtiene el perfil.
// 4. La API crea o vincula el usuario y vuelve a la app con un código de un solo uso.
// 5. La app canjea ese código en /exchange por sus tokens JWT (nunca viajan en la URL).
import { env } from "../config/env.js";
import { callbackUrl, isConfigured, providers } from "../oauth/providers.js";
import * as users from "../repositories/users.repository.js";
import * as tokens from "../repositories/tokens.repository.js";
import { randomCode, sha256, signState, verifyState } from "../security/tokens.js";
import { createSession } from "../services/session.service.js";
import { badRequest, forbidden, notFound, unauthorized } from "../utils/http-error.js";

// Solo se vuelve a direcciones de la app permitidas (evita redirigir a sitios ajenos).
const allowedRedirect = (url) => typeof url === "string" && env.appRedirects.some((prefix) => url.startsWith(prefix));

// Agrega parámetros a la dirección de la app (con ? o & según corresponda).
const withParams = (url, params) => `${url}${url.includes("?") ? "&" : "?"}${new URLSearchParams(params)}`;

function getProvider(name) {
  const provider = providers[name];
  if (!provider) throw notFound("Red social no soportada.");
  if (!isConfigured(name)) throw badRequest(`El ingreso con ${provider.name} no está configurado en el servidor.`);
  return provider;
}

// GET /api/auth/oauth/:provider/start?redirect=<dirección de la app>
export function start(req, res) {
  const provider = getProvider(req.params.provider);
  const redirect = req.query.redirect;
  if (!allowedRedirect(redirect)) throw badRequest("La dirección de retorno de la app no es válida.");

  const params = new URLSearchParams({
    client_id: env.oauth[req.params.provider].clientId,
    redirect_uri: callbackUrl(req.params.provider),
    response_type: "code",
    scope: provider.scope,
    state: signState({ provider: req.params.provider, redirect }), // Firmado: no se puede falsificar.
    ...provider.extraParams,
  });
  res.redirect(`${provider.authorizeUrl}?${params}`);
}

// Busca la cuenta social; si no existe, la vincula a un usuario con el mismo correo o crea uno nuevo.
async function findOrCreateUser(providerName, profile) {
  const linked = await users.findBySocial(providerName, profile.id);
  if (linked) return linked;
  if (!profile.email) {
    throw badRequest("Tu cuenta no tiene un correo verificado. Verificalo en la red social o registrate con correo.");
  }
  const user =
    (await users.findByEmail(profile.email.toLowerCase())) ??
    (await users.create({
      name: (profile.name || profile.email.split("@")[0]).slice(0, 100),
      email: profile.email.toLowerCase(),
      avatarUrl: profile.avatarUrl,
    })); // Los usuarios nuevos empiezan como «alumno».
  await users.linkSocial(user.id, providerName, profile.id);
  return user;
}

// GET /api/auth/oauth/:provider/callback?code=...&state=...
export async function callback(req, res) {
  let state;
  try {
    state = verifyState(String(req.query.state ?? ""));
  } catch {
    throw badRequest("El inicio de sesión expiró. Volvé a intentarlo desde la app.");
  }
  if (state.provider !== req.params.provider || !allowedRedirect(state.redirect)) throw badRequest("Pedido inválido.");

  // Desde acá, cualquier error vuelve a la app con un mensaje para mostrar en pantalla.
  try {
    if (req.query.error) throw new Error("Cancelaste el inicio de sesión.");
    const provider = getProvider(req.params.provider);
    const tokenData = await provider.exchange(String(req.query.code ?? ""), callbackUrl(req.params.provider));
    if (!tokenData.access_token) throw new Error("La red social no entregó la autorización.");
    const profile = await provider.profile(tokenData.access_token);
    const user = await findOrCreateUser(req.params.provider, profile);
    if (!user.active) throw forbidden("Tu cuenta está desactivada. Consultá con un administrador.");

    const code = randomCode();
    await tokens.saveOAuthCode(sha256(code), user.id); // Se guarda solo el hash.
    res.redirect(withParams(state.redirect, { code }));
  } catch (error) {
    res.redirect(withParams(state.redirect, { error: error.message || "No se pudo iniciar sesión." }));
  }
}

// POST /api/auth/oauth/exchange { code } — la app canjea el código de un solo uso por sus tokens.
export async function exchange(req, res) {
  const code = req.body?.code;
  if (typeof code !== "string" || !/^[0-9a-f]{64}$/.test(code)) throw badRequest("Código inválido.");
  const userId = await tokens.consumeOAuthCode(sha256(code));
  if (!userId) throw unauthorized("El código expiró o ya se usó. Volvé a iniciar sesión.");
  const user = await users.findById(userId);
  if (!user?.active) throw forbidden("Tu cuenta está desactivada. Consultá con un administrador.");
  res.json(await createSession(user));
}

// GET /api/auth/oauth/providers — qué redes están configuradas (la app solo muestra esas).
export function available(_req, res) {
  res.json({ ok: true, providers: Object.keys(providers).filter(isConfigured) });
}
