# Guía de instalación y configuración

Cómo preparar el entorno de desarrollo y ejecutar el **backend** (API + base de datos) y el **frontend** (app React Native).

> Para solo **probar la app** no hace falta instalar nada de esto: alcanza con la APK (`apk/BibliotecaEscolar.apk`), que usa la API ya publicada en https://biblioteca-escolar-api.vercel.app.

---

## 1. Requisitos

| Programa | Versión | Para qué |
|---|---|---|
| [Node.js](https://nodejs.org) | 22 o superior (recomendado 24 LTS) | Ejecutar la API y las herramientas de Expo |
| [XAMPP](https://www.apachefriends.org) | Cualquiera reciente | Base de datos MySQL en la computadora |
| [Git](https://git-scm.com) | Cualquiera | Descargar el proyecto |
| [Expo Go](https://expo.dev/go) | SDK 58 | Probar la app en el celular (Android o iPhone) |

Descargar el proyecto:

```bash
git clone https://github.com/zeusjimenezadaro/biblioteca-escolar.git
cd biblioteca-escolar
```

---

## 2. Backend (API)

### 2.1 Base de datos MySQL con XAMPP

1. Abrí el **XAMPP Control Panel**.
2. Tocá **Start** en la fila de **MySQL** (Apache no hace falta).
3. Listo: el instalador del paso 2.3 crea la base `biblioteca` y sus tablas.

### 2.2 Instalar dependencias

```bash
cd backend
npm ci
```

### 2.3 Variables de entorno

Con XAMPP recién instalado (usuario `root` sin contraseña) **no hace falta configurar nada**: la API usa esos valores por defecto.

Para cambiar algo, copiá `.env.example` como `.env` y editalo:

| Variable | Descripción | Por defecto |
|---|---|---|
| `PORT` | Puerto de la API | `3002` |
| `PUBLIC_URL` | Dirección pública de la API (para el login social) | `http://localhost:3002` |
| `DB_HOST`, `DB_PORT` | Servidor y puerto de MySQL | `127.0.0.1`, `3306` |
| `DB_USER`, `DB_PASSWORD` | Usuario y contraseña de MySQL | `root`, vacía |
| `DB_NAME` | Nombre de la base | `biblioteca` |
| `DB_SSL` | `true` si la base exige conexión cifrada (en la nube) | `false` |
| `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET` | Claves para firmar los tokens (textos largos y aleatorios, distintos) | Claves de desarrollo |
| `JWT_ACCESS_TTL`, `JWT_REFRESH_DAYS` | Duración de los tokens | `15m`, `30` |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | Credenciales de Google (opcional) | — |
| `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET` | Credenciales de GitHub (opcional) | — |
| `DISCORD_CLIENT_ID`, `DISCORD_CLIENT_SECRET` | Credenciales de Discord (opcional) | — |
| `APP_REDIRECTS` | Direcciones de la app permitidas para volver del login social | `biblioteca://,exp://` |

> El archivo `.env` es privado: está en `.gitignore` y nunca se sube al repositorio.

### 2.4 Crear las tablas y los datos de prueba

```bash
npm run setup
```

Crea las 6 tablas, las 3 cuentas de prueba y 12 libros. Se puede repetir sin problema: no borra ni duplica datos.

### 2.5 Encender la API

```bash
npm start
```

Probá en el navegador: http://localhost:3002/api/health → `{"ok":true,"database":"connected"}`.

### 2.6 Pruebas automáticas

```bash
npm test
```

Recorren login, validaciones, protección de rutas, permisos por rol, el CRUD de libros con un préstamo completo y la rotación de tokens (con MySQL encendido).

---

## 3. Frontend (app)

### 3.1 Instalar dependencias

```bash
cd frontend
npm ci
```

### 3.2 Elegir qué API usa la app

Copiá `.env.example` como `.env`:

- **API publicada (recomendado):** `EXPO_PUBLIC_API_URL=https://biblioteca-escolar-api.vercel.app`
- **API local:** usá la IP de tu computadora en la red Wi-Fi (verla con `ipconfig`), por ejemplo `EXPO_PUBLIC_API_URL=http://192.168.1.10:3002`. No uses `localhost`: en el celular apuntaría al propio celular.

### 3.3 Ejecutar con Expo Go

```bash
npx expo start
```

1. Conectá el celular al **mismo Wi-Fi** que la computadora.
2. Android: abrí Expo Go y escaneá el código QR. iPhone: escanealo con la app Cámara.

### 3.4 Generar la APK

La APK se compila en la nube con **EAS Build** (cuenta gratuita de Expo):

```bash
npx eas-cli login
npx eas-cli build --platform android --profile preview
```

Al terminar, EAS da un enlace para descargar el archivo `.apk`. El perfil `preview` está en `frontend/eas.json`.

---

## 4. Publicación en la nube (cómo está desplegado)

| Parte | Servicio | Detalle |
|---|---|---|
| API | [Vercel](https://vercel.com) | `backend/api/index.js` exporta la app de Express; `backend/vercel.json` dirige todas las rutas ahí. Las variables de entorno se cargan en el panel de Vercel. |
| Base de datos | [TiDB Cloud](https://tidbcloud.com) (plan Starter gratuito) | Compatible con MySQL. Conexión cifrada (`DB_SSL=true`). Las tablas se crean con `npm run setup` apuntando a esa base. |

Publicar una versión nueva de la API:

```bash
cd backend
npx vercel deploy --prod
```

### Login social: direcciones de retorno

En el panel de desarrollador de cada red social, la dirección de retorno (redirect URI) es:

```
https://biblioteca-escolar-api.vercel.app/api/auth/oauth/google/callback
https://biblioteca-escolar-api.vercel.app/api/auth/oauth/github/callback
https://biblioteca-escolar-api.vercel.app/api/auth/oauth/discord/callback
```

Para usar el login social con la API local hace falta una dirección pública (por ejemplo, un túnel) en `PUBLIC_URL` y registrarla en cada red.

---

## 5. Problemas comunes

| Problema | Solución |
|---|---|
| `ECONNREFUSED 127.0.0.1:3306` al iniciar la API | MySQL está apagado: encendelo en XAMPP. |
| La app dice «No se pudo conectar con el servidor» | Revisá `EXPO_PUBLIC_API_URL`, que la API esté encendida y que el celular esté en el mismo Wi-Fi. Si usás la API local, permití Node.js en el Firewall de Windows (redes privadas). |
| Expo Go dice que la versión del proyecto no es compatible | Actualizá Expo Go: el proyecto usa el SDK 58. |
| Los botones de redes sociales no aparecen | Faltan las credenciales `*_CLIENT_ID` y `*_CLIENT_SECRET` en la configuración de la API. |
