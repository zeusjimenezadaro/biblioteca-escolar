# 📚 Biblioteca Escolar · Trabajo Integrador

App móvil en **React Native (Expo + TypeScript)** con backend **Node.js + Express** y base de datos **MySQL**, para gestionar la biblioteca de la escuela: catálogo de libros, préstamos y usuarios con tres roles.

**Alumno:** Zeus Jimenez Adaro · Escuela Técnica N.º 5

| | |
|---|---|
| 📱 APK para Android | [`apk/BibliotecaEscolar.apk`](apk/BibliotecaEscolar.apk) |
| 🌐 API publicada | https://biblioteca-escolar-api.vercel.app |
| 📘 Documentación de la API | [`backend/README.md`](backend/README.md) |
| 🧭 Manual de usuario | [`docs/MANUAL_DE_USUARIO.md`](docs/MANUAL_DE_USUARIO.md) |
| 🛠️ Guía de instalación | [`docs/GUIA_DE_INSTALACION.md`](docs/GUIA_DE_INSTALACION.md) |
| 🎬 Video de demostración | [Alumno](video/1-alumno.mp4) · [Bibliotecario](video/2-bibliotecario.mp4) · [Administrador](video/3-administrador.mp4) |

## Cuentas de prueba

| Rol | Correo | Contraseña |
|---|---|---|
| Administrador | `admin@biblioteca.local` | `Admin2026` |
| Bibliotecario | `bibliotecario@biblioteca.local` | `Biblio2026` |
| Alumno | `alumno@biblioteca.local` | `Alumno2026` |

También se puede crear una cuenta nueva o entrar con **Google, GitHub o Discord**.

## Funcionalidades

**Registro e inicio de sesión**
- Registro e inicio de sesión con correo y contraseña, con validaciones en cada campo.
- Login con **3 redes sociales**: Google, GitHub y Discord (OAuth 2.0).
- **Sesión persistente:** se guarda cifrada en el celular (SecureStore) y sigue abierta al cerrar y volver a abrir la app.

**Roles de usuario**

| Rol | Puede |
|---|---|
| **Alumno** | Ver el catálogo, pedir préstamos (hasta 3) y cancelar sus pedidos pendientes. |
| **Bibliotecario** | Todo lo anterior para consultar, más crear, editar y eliminar libros, y aprobar, rechazar y registrar devoluciones. |
| **Administrador** | Todo lo del bibliotecario, más gestionar usuarios: cambiar roles, activar o desactivar cuentas y eliminarlas. |

La app muestra pantallas y botones distintos según el rol, y la API protege cada endpoint en el servidor.

**CRUD con la API REST**
- **Libros:** crear, leer (con búsqueda, filtro por categoría y paginación), actualizar y eliminar.
- **Préstamos:** crear, leer, cambiar de estado y eliminar.
- **Usuarios:** leer, actualizar rol y estado, y eliminar.

**Interfaz**
- Navegación con **Expo Router**: pila de pantallas y barra de pestañas según el rol.
- **Diseño adaptable:** grillas de 1, 2 o 3 columnas según el ancho, y soporte de orientación horizontal y vertical.
- Modo claro y oscuro, avisos emergentes, confirmaciones antes de borrar y «tirar para actualizar».
- **Manejo de errores:** errores por campo en los formularios, mensajes claros si falla la conexión, renovación automática del token y cierre de sesión si expira.

## Tecnologías

| Parte | Tecnologías |
|---|---|
| Frontend | React Native 0.88, Expo SDK 58, TypeScript, Expo Router, **Context API** (sesión, tema y avisos), SecureStore, WebBrowser |
| Backend | Node.js 24, Express 5, mysql2, jsonwebtoken, express-rate-limit, scrypt |
| Base de datos | MySQL 8 (XAMPP en local) · TiDB Cloud, compatible con MySQL (en la nube) |
| Despliegue | Vercel (API) · EAS Build (APK) |

## Estructura del proyecto

```
├── backend/                 API REST (ver backend/README.md)
│   ├── api/                 Entrada para Vercel
│   ├── database/schema.sql  Tablas de MySQL
│   ├── scripts/setup.js     Instalador de la base y datos de prueba
│   ├── src/                 config · routes · middleware · controllers · repositories · security · oauth · validation
│   └── test/                Pruebas automáticas
├── frontend/                App React Native
│   └── src/
│       ├── app/             Pantallas (Expo Router): (auth) login/registro · (app) pestañas y detalle
│       ├── components/      Componentes reutilizables (botones, campos, tarjetas, grilla…)
│       ├── context/         AuthContext (sesión global) y ToastContext (avisos)
│       ├── services/        Cliente HTTP con renovación de token y funciones de la API
│       ├── storage/         Persistencia segura de la sesión
│       ├── hooks/           useLoader (carga de datos) y useResponsive (tamaño de pantalla)
│       ├── theme/           Colores y estilos (claro y oscuro)
│       ├── types/           Tipos de TypeScript
│       └── utils/           Validaciones y permisos por rol
├── docs/                    Manual de usuario y guía de instalación
├── apk/                     APK para Android
└── video/                   Video de demostración (una parte por rol)
```

## Instalación rápida

```bash
# Backend (con MySQL de XAMPP encendido)
cd backend
npm ci
npm run setup
npm start

# Frontend (en otra terminal)
cd frontend
npm ci
npx expo start
```

Los detalles (variables de entorno, ejecución en el celular y generación de la APK) están en la [guía de instalación](docs/GUIA_DE_INSTALACION.md).
