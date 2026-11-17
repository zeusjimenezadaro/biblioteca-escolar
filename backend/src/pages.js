// Páginas públicas en HTML: inicio y política de privacidad.
// Google las exige para habilitar «Continuar con Google» para cualquier usuario.

// Estructura común de las dos páginas.
const layout = (title, body) => `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title} · Biblioteca Escolar</title>
<style>
  body { font-family: system-ui, sans-serif; max-width: 720px; margin: 0 auto; padding: 24px 16px; line-height: 1.6; color: #1f2433; background: #f4f2ee; }
  h1 { color: #1e2347; } a { color: #3b4fd8; } code { background: #e5e8fd; padding: 2px 6px; border-radius: 6px; }
</style>
</head>
<body>${body}</body>
</html>`;

export const homePage = layout(
  "Inicio",
  `<h1>📚 Biblioteca Escolar</h1>
  <p>API REST de la app móvil <strong>Biblioteca Escolar</strong>, Trabajo Integrador de Zeus Jimenez Adaro (Escuela Técnica N.º 5).</p>
  <p>La app permite consultar el catálogo, pedir libros prestados y gestionar la biblioteca según el rol del usuario (alumno, bibliotecario o administrador).</p>
  <p>Estado del servidor: <a href="/api/health"><code>/api/health</code></a> · <a href="/privacidad">Política de privacidad</a></p>`,
);

export const privacyPage = layout(
  "Política de privacidad",
  `<h1>Política de privacidad</h1>
  <p><em>Última actualización: 17 de noviembre de 2026.</em></p>
  <p><strong>Biblioteca Escolar</strong> es un trabajo práctico escolar sin fines comerciales.</p>
  <h2>Qué datos guardamos</h2>
  <ul>
    <li>Nombre, correo electrónico y, si entrás con Google, GitHub o Discord, la foto de perfil y el identificador de esa cuenta.</li>
    <li>Si te registrás con correo, la contraseña se guarda cifrada (nunca en texto legible).</li>
    <li>Los préstamos de libros que pedís.</li>
  </ul>
  <h2>Para qué los usamos</h2>
  <p>Solo para iniciar sesión, mostrar tu perfil y gestionar tus préstamos dentro de la app. No vendemos, compartimos ni usamos tus datos para publicidad.</p>
  <h2>Cómo borrar tus datos</h2>
  <p>Podés pedir que eliminemos tu cuenta escribiendo a <a href="mailto:zeusjimenezadaro@gmail.com">zeusjimenezadaro@gmail.com</a>. Un administrador la elimina junto con sus préstamos.</p>`,
);
