// Configuración leída de las variables de entorno (archivo .env en local, panel de Vercel en producción).

// Devuelve la variable (sin espacios ni saltos de línea sobrantes) o un valor por defecto.
const read = (name, fallback = "") => (process.env[name] ?? fallback).trim();

export const env = {
  port: Number(read("PORT", "3002")),
  // Dirección pública de la API: se usa para armar las direcciones de retorno de las redes sociales.
  publicUrl: read("PUBLIC_URL", "http://localhost:3002").replace(/\/$/, ""),

  db: {
    host: read("DB_HOST", "127.0.0.1"),
    port: Number(read("DB_PORT", "3306")),
    user: read("DB_USER", "root"),
    password: read("DB_PASSWORD", ""),
    database: read("DB_NAME", "biblioteca"),
    ssl: read("DB_SSL", "false") === "true", // true para MySQL en la nube.
    sslCa: read("DB_SSL_CA", ""), // Certificado del servidor (contenido PEM).
  },

  jwt: {
    accessSecret: read("JWT_ACCESS_SECRET", "solo-para-desarrollo-cambiar-access"),
    refreshSecret: read("JWT_REFRESH_SECRET", "solo-para-desarrollo-cambiar-refresh"),
    accessTtl: read("JWT_ACCESS_TTL", "15m"), // El token de acceso dura poco.
    refreshDays: Number(read("JWT_REFRESH_DAYS", "30")), // El de renovación, varios días.
  },

  // Credenciales de cada red social. Si faltan, ese botón responde que no está configurado.
  oauth: {
    google: { clientId: read("GOOGLE_CLIENT_ID"), clientSecret: read("GOOGLE_CLIENT_SECRET") },
    github: { clientId: read("GITHUB_CLIENT_ID"), clientSecret: read("GITHUB_CLIENT_SECRET") },
    discord: { clientId: read("DISCORD_CLIENT_ID"), clientSecret: read("DISCORD_CLIENT_SECRET") },
  },

  // Direcciones de la app a las que se permite volver después del login social.
  appRedirects: read("APP_REDIRECTS", "biblioteca://,exp://")
    .split(",")
    .map((r) => r.trim())
    .filter(Boolean),
};

// En producción no se permiten las claves de desarrollo.
if (process.env.NODE_ENV === "production" && env.jwt.accessSecret.startsWith("solo-para")) {
  throw new Error("Configurá JWT_ACCESS_SECRET y JWT_REFRESH_SECRET en producción.");
}
