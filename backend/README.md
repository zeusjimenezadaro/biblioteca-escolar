# API REST · Biblioteca Escolar

Backend del Trabajo Integrador: API RESTful en **Node.js + Express** con base de datos **MySQL**, autenticación con **JWT** (token de acceso y token de renovación), **3 roles** y login con **Google, GitHub y Discord**.

- **URL pública:** https://biblioteca-escolar-api.vercel.app
- **Prefijo de todas las rutas:** `/api`
- **Formato:** JSON (`Content-Type: application/json`)

---

## Índice

1. [Autenticación con JWT](#1-autenticación-con-jwt)
2. [Roles y permisos](#2-roles-y-permisos)
3. [Formato de las respuestas y códigos de error](#3-formato-de-las-respuestas-y-códigos-de-error)
4. [Endpoints de autenticación](#4-endpoints-de-autenticación)
5. [Login con redes sociales](#5-login-con-redes-sociales)
6. [Endpoints de libros](#6-endpoints-de-libros)
7. [Endpoints de préstamos](#7-endpoints-de-préstamos)
8. [Endpoints de usuarios](#8-endpoints-de-usuarios-solo-administrador)
9. [Otros endpoints](#9-otros-endpoints)
10. [Estructura del backend](#10-estructura-del-backend)
11. [Base de datos](#11-base-de-datos)
12. [Ejecutar y probar](#12-ejecutar-y-probar)

---

## 1. Autenticación con JWT

Al iniciar sesión, la API devuelve dos tokens:

| Token | Dura | Para qué sirve |
|---|---|---|
| `accessToken` | 15 minutos | Se envía en **cada pedido protegido**, en el encabezado `Authorization: Bearer <accessToken>`. |
| `refreshToken` | 30 días | Sirve solo para pedir un par de tokens nuevo en `POST /api/auth/refresh` cuando el de acceso vence. |

- Cada token de renovación **se usa una sola vez** (rotación). Si alguien intenta reutilizar uno ya usado, la API cierra **todas** las sesiones de ese usuario por seguridad.
- Los tokens de renovación se registran en la tabla `refresh_tokens`, lo que permite revocarlos al cerrar sesión o al desactivar una cuenta.
- Las contraseñas se guardan con **scrypt + sal aleatoria**; nunca se devuelven en ninguna respuesta.

## 2. Roles y permisos

| Acción | Alumno | Bibliotecario | Administrador |
|---|:---:|:---:|:---:|
| Ver catálogo y detalle de libros | ✅ | ✅ | ✅ |
| Crear, editar y eliminar libros | ❌ | ✅ | ✅ |
| Pedir un préstamo | ✅ | ❌ | ❌ |
| Ver préstamos | Solo los suyos | Todos | Todos |
| Aprobar, rechazar y registrar devoluciones | ❌ | ✅ | ✅ |
| Cancelar un pedido pendiente propio | ✅ | ❌ | ❌ |
| Eliminar registros de préstamos cerrados | ❌ | ❌ | ✅ |
| Ver, cambiar rol, activar/desactivar y eliminar usuarios | ❌ | ❌ | ✅ |

- Todo usuario nuevo (registro o red social) empieza como **alumno**. Solo un administrador puede cambiar roles.
- Los permisos se controlan **en el servidor** con los middlewares `authenticate` y `authorize(...)` (`src/middleware/auth.js`). La app solo oculta lo que el rol no puede usar.
- Una cuenta desactivada no puede iniciar sesión ni usar sus tokens (responde `403`).

## 3. Formato de las respuestas y códigos de error

Respuesta correcta:

```json
{ "ok": true, "...": "datos" }
```

Respuesta con error:

```json
{
  "ok": false,
  "message": "Revisá los datos ingresados.",
  "errors": { "email": "Ingresá un correo válido." }
}
```

`errors` aparece solo en los errores de validación (400) e indica el problema de cada campo.

| Código | Significado |
|---|---|
| `200` | OK. |
| `201` | Recurso creado. |
| `400` | Datos inválidos (ver `errors`) o pedido mal formado. |
| `401` | Falta iniciar sesión, el token es inválido o venció, o las credenciales son incorrectas. |
| `403` | El rol no tiene permiso o la cuenta está desactivada. |
| `404` | El recurso o la ruta no existe. |
| `409` | Conflicto con el estado actual (ej.: correo ya registrado, libro sin ejemplares, libro con préstamos activos). |
| `413` | El cuerpo del pedido es demasiado grande. |
| `429` | Demasiados intentos de login o registro (máximo 30 cada 15 minutos). |
| `500` | Error inesperado del servidor. |

---

## 4. Endpoints de autenticación

### `POST /api/auth/register`
Crea una cuenta con rol **alumno** e inicia sesión. Público.

Cuerpo:
```json
{ "name": "Ana Pérez", "email": "ana@ejemplo.com", "password": "Clave2026" }
```
Reglas: nombre de 2 a 100 caracteres; correo válido; contraseña de 8 a 128 caracteres con letras y números.

Respuesta `201`:
```json
{
  "ok": true,
  "user": { "id": 4, "name": "Ana Pérez", "email": "ana@ejemplo.com", "role": "alumno", "active": true, "avatarUrl": null, "hasPassword": true, "createdAt": "2026-11-17 18:00:00" },
  "accessToken": "eyJhbGciOi...",
  "refreshToken": "eyJhbGciOi..."
}
```
Errores: `400` datos inválidos · `409` el correo ya existe · `429` demasiados intentos.

### `POST /api/auth/login`
Inicia sesión con correo y contraseña. Público.

Cuerpo:
```json
{ "email": "alumno@biblioteca.local", "password": "Alumno2026" }
```
Respuesta `200`: igual que el registro (`user`, `accessToken`, `refreshToken`).
Errores: `400` datos inválidos · `401` correo o contraseña incorrectos · `403` cuenta desactivada · `429` demasiados intentos.

### `POST /api/auth/refresh`
Cambia un token de renovación por un par nuevo. Público.

Cuerpo: `{ "refreshToken": "eyJhbGciOi..." }`
Respuesta `200`: `user`, `accessToken` y `refreshToken` nuevos.
Errores: `400` falta el token · `401` token vencido, inválido o ya usado · `403` cuenta desactivada.

### `POST /api/auth/logout`
Revoca el token de renovación del dispositivo. Público.

Cuerpo: `{ "refreshToken": "eyJhbGciOi..." }`
Respuesta `200`: `{ "ok": true, "message": "Sesión cerrada." }`

### `GET /api/auth/me`
Datos del usuario logueado y redes sociales vinculadas. 🔒 Requiere token.

Respuesta `200`:
```json
{ "ok": true, "user": { "id": 3, "name": "Zeus Jimenez Adaro", "role": "alumno", "providers": ["google", "github"], "...": "..." } }
```

### `PUT /api/auth/me`
Cambia el nombre y, opcionalmente, la contraseña. 🔒 Requiere token.

Cuerpo:
```json
{ "name": "Zeus Jimenez", "currentPassword": "Alumno2026", "newPassword": "NuevaClave2026" }
```
`currentPassword` es obligatoria solo si la cuenta ya tiene contraseña. Una cuenta creada con red social puede crear su primera contraseña enviando solo `newPassword`.
Respuesta `200`: `{ "ok": true, "user": {...}, "message": "Perfil actualizado." }`
Errores: `400` datos inválidos o contraseña actual incorrecta.

---

## 5. Login con redes sociales

Proveedores: **Google**, **GitHub** y **Discord** (OAuth 2.0).

```
App ──► GET /api/auth/oauth/:provider/start?redirect=biblioteca://auth
          └─► la API redirige a la red social (el usuario inicia sesión y autoriza)
               └─► la red social vuelve a GET /api/auth/oauth/:provider/callback?code=...
                    └─► la API obtiene el perfil, crea o vincula el usuario
                         └─► redirige a biblioteca://auth?code=<código de un solo uso>
App ──► POST /api/auth/oauth/exchange { code }  ──► accessToken + refreshToken
```

- Los tokens **nunca viajan en la URL**: la app recibe un código de un solo uso que vence en 2 minutos y lo canjea por los tokens.
- El parámetro `state` va firmado, así nadie puede inyectar un login ajeno.
- Si el correo de la red social ya existe, la cuenta social se **vincula** al usuario existente. Solo se aceptan correos verificados por la red social.

| Endpoint | Descripción |
|---|---|
| `GET /api/auth/oauth/providers` | Lista las redes configuradas: `{ "ok": true, "providers": ["google","github","discord"] }` |
| `GET /api/auth/oauth/:provider/start?redirect=URL` | Inicia el login. `provider`: `google`, `github` o `discord`. `redirect` debe empezar con `biblioteca://` o `exp://`. Responde `302`. Errores: `400` dirección no permitida o red no configurada · `404` red no soportada. |
| `GET /api/auth/oauth/:provider/callback` | Lo llama la red social. Vuelve a la app con `?code=...` o con `?error=mensaje`. |
| `POST /api/auth/oauth/exchange` | Cuerpo `{ "code": "..." }`. Respuesta `200` igual que el login. Errores: `400` código mal formado · `401` código vencido o usado · `403` cuenta desactivada. |

---

## 6. Endpoints de libros

Todos requieren token 🔒.

### `GET /api/books`
Lista paginada del catálogo.

| Parámetro (query) | Descripción |
|---|---|
| `q` | Busca en título, autor o ISBN (opcional). |
| `category` | Filtra por categoría exacta (opcional). |
| `page` | Página, desde 1 (por defecto 1). |
| `limit` | Resultados por página, de 1 a 50 (por defecto 20). |

Respuesta `200`:
```json
{
  "ok": true,
  "items": [
    { "id": 1, "title": "Cien años de soledad", "author": "Gabriel García Márquez", "isbn": null, "category": "Novela", "year": 1967, "totalCopies": 3, "availableCopies": 3, "description": "..." }
  ],
  "total": 12, "page": 1, "pages": 1
}
```

### `GET /api/books/categories`
Categorías existentes: `{ "ok": true, "categories": ["Ciencia", "Novela", "..."] }`

### `GET /api/books/:id`
Detalle de un libro: `{ "ok": true, "book": {...} }`. Errores: `400` id inválido · `404` no existe.

### `POST /api/books` · 👤 bibliotecario o admin
Cuerpo:
```json
{ "title": "El Aleph", "author": "Jorge Luis Borges", "category": "Cuentos", "isbn": null, "year": 1949, "totalCopies": 2, "description": null }
```
Obligatorios: `title` (máx. 200), `author` (máx. 150), `category` (máx. 60), `totalCopies` (1 a 999). Opcionales: `isbn` (números y guiones), `year` (1000 al año actual), `description` (máx. 2000).
Respuesta `201`: `{ "ok": true, "book": {...}, "message": "Libro agregado." }`
Errores: `400` validación · `403` sin permiso · `409` ISBN repetido.

### `PUT /api/books/:id` · 👤 bibliotecario o admin
Mismo cuerpo que `POST`. Si cambia `totalCopies`, los disponibles se ajustan en la misma diferencia.
Respuesta `200`: `{ "ok": true, "book": {...}, "message": "Libro actualizado." }`
Errores: `400` validación o total menor que los ejemplares prestados · `403` · `404`.

### `DELETE /api/books/:id` · 👤 bibliotecario o admin
Respuesta `200`: `{ "ok": true, "message": "Libro eliminado." }`
Errores: `403` · `404` · `409` el libro tiene préstamos pendientes o sin devolver.

---

## 7. Endpoints de préstamos

Todos requieren token 🔒.

Estados: `pendiente` → `aprobado` (prestado) → `devuelto`, o `pendiente` → `rechazado`.

### `GET /api/loans?status=`
El alumno recibe solo sus préstamos; el personal, todos. `status` opcional: `pendiente`, `aprobado`, `rechazado` o `devuelto`.

Respuesta `200`:
```json
{
  "ok": true,
  "items": [
    { "id": 7, "status": "aprobado", "requestedAt": "2026-11-17 17:43:00", "decidedAt": "2026-11-17 17:44:10", "dueDate": "2026-12-01", "returnedAt": null, "bookId": 4, "bookTitle": "Ficciones", "bookAuthor": "Jorge Luis Borges", "userId": 3, "userName": "Zeus Jimenez Adaro", "userEmail": "alumno@biblioteca.local" }
  ]
}
```

### `POST /api/loans` · 👤 alumno
Cuerpo: `{ "bookId": 4 }`
Respuesta `201`: `{ "ok": true, "loan": {...}, "message": "Préstamo solicitado. Esperá la aprobación del bibliotecario." }`
Errores: `400` · `403` · `404` libro inexistente · `409` sin ejemplares, ya hay un préstamo activo de ese libro, o se alcanzó el máximo de **3 préstamos** activos o pendientes.

### `PATCH /api/loans/:id` · 👤 bibliotecario o admin
Cuerpo: `{ "action": "aprobar" }`, `{ "action": "rechazar" }` o `{ "action": "devolver" }`.

- **aprobar:** solo pendientes; resta un ejemplar disponible y fija la devolución a 14 días.
- **rechazar:** solo pendientes.
- **devolver:** solo aprobados; suma el ejemplar de nuevo.

Se ejecuta en una **transacción** con bloqueo de fila, así dos personas no pueden aprobar el mismo préstamo a la vez.
Respuesta `200`: `{ "ok": true, "loan": {...}, "message": "Préstamo aprobado." }`
Errores: `400` acción inválida · `403` · `404` · `409` estado incorrecto o sin ejemplares.

### `DELETE /api/loans/:id` · 👤 alumno o admin
- **Alumno:** cancela su propio pedido **pendiente**.
- **Admin:** elimina registros que no estén prestados (primero hay que registrar la devolución).

Respuesta `200`: `{ "ok": true, "message": "Pedido cancelado." }`
Errores: `403` préstamo ajeno · `404` · `409` estado que no permite borrarlo.

---

## 8. Endpoints de usuarios (solo administrador)

Todos requieren token 🔒 de un usuario con rol **admin**.

### `GET /api/users?q=`
Lista de usuarios, con búsqueda opcional por nombre o correo: `{ "ok": true, "items": [ {...}, ... ] }`

### `PATCH /api/users/:id`
Cuerpo (uno o ambos campos):
```json
{ "role": "bibliotecario", "active": false }
```
`role`: `admin`, `bibliotecario` o `alumno`. `active`: `true` o `false`. Al desactivar una cuenta se cierran todas sus sesiones.
Respuesta `200`: `{ "ok": true, "user": {...}, "message": "Usuario actualizado." }`
Errores: `400` datos inválidos o intento de modificarse a sí mismo · `403` · `404`.

### `DELETE /api/users/:id`
Elimina la cuenta y sus préstamos. Respuesta `200`: `{ "ok": true, "message": "Usuario eliminado." }`
Errores: `400` no puede eliminarse a sí mismo · `403` · `404`.

---

## 9. Otros endpoints

| Endpoint | Descripción |
|---|---|
| `GET /api/health` | Público. Verifica la conexión con la base: `{ "ok": true, "database": "connected" }`. |
| `GET /api/stats` | 🔒 Resumen para la pantalla de inicio. Alumno: sus préstamos por estado. Personal: libros, préstamos por estado y devoluciones vencidas. Admin: además, usuarios por rol. |
| `GET /` | Página de inicio en HTML. |
| `GET /privacidad` | Política de privacidad (exigida por Google). |

---

## 10. Estructura del backend

```
backend/
├── api/index.js              Entrada para Vercel (exporta la app)
├── database/schema.sql       Tablas de la base de datos
├── scripts/setup.js          Instalador: crea las tablas y carga los datos de prueba
├── src/
│   ├── app.js                Configuración de Express (middlewares y rutas)
│   ├── server.js             Arranque en local (npm start)
│   ├── pages.js              Páginas HTML públicas
│   ├── config/               Variables de entorno y conexión a MySQL
│   ├── routes/index.js       Todas las rutas y qué rol puede usar cada una
│   ├── middleware/           Autenticación, autorización por rol y manejo de errores
│   ├── controllers/          Lógica de cada endpoint
│   ├── repositories/         Consultas SQL (parametrizadas)
│   ├── services/             Creación de la sesión (par de tokens)
│   ├── security/             Contraseñas (scrypt) y tokens (JWT)
│   ├── oauth/providers.js    Datos de Google, GitHub y Discord
│   ├── validation/           Validación de cada dato recibido
│   └── utils/                Errores HTTP
└── test/api.test.js          Pruebas automáticas
```

## 11. Base de datos

MySQL 8 (en local con **XAMPP**). En producción se usa **TiDB Cloud**, que es compatible con MySQL: el mismo SQL y la misma librería (`mysql2`).

| Tabla | Contenido |
|---|---|
| `users` | Usuarios: nombre, correo, contraseña cifrada, rol, estado y foto. |
| `social_accounts` | Cuentas de Google, GitHub o Discord vinculadas a cada usuario. |
| `refresh_tokens` | Tokens de renovación emitidos (para rotarlos y revocarlos). |
| `oauth_codes` | Códigos de un solo uso del login social (se guarda solo el hash). |
| `books` | Catálogo: título, autor, ISBN, categoría, año y ejemplares. |
| `loans` | Préstamos: libro, alumno, estado, fechas y quién lo aprobó. |

Relaciones: `social_accounts`, `refresh_tokens`, `oauth_codes` y `loans` apuntan a `users`; `loans` apunta a `books`. Ver `database/schema.sql`.

## 12. Ejecutar y probar

```bash
npm ci            # instala las dependencias
npm run setup     # crea las tablas y los datos de prueba
npm start         # API en http://localhost:3002/api
npm test          # pruebas automáticas (necesita MySQL encendido)
```

La configuración se toma del archivo `.env` (ver `.env.example`). La guía completa está en [`docs/GUIA_DE_INSTALACION.md`](../docs/GUIA_DE_INSTALACION.md).

Cuentas de prueba:

| Rol | Correo | Contraseña |
|---|---|---|
| Administrador | `admin@biblioteca.local` | `Admin2026` |
| Bibliotecario | `bibliotecario@biblioteca.local` | `Biblio2026` |
| Alumno | `alumno@biblioteca.local` | `Alumno2026` |

Ejemplo con `curl`:

```bash
curl -X POST https://biblioteca-escolar-api.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"alumno@biblioteca.local","password":"Alumno2026"}'
```
