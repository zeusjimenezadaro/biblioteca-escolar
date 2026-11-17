# Manual de usuario · Biblioteca Escolar

Este manual explica cómo usar la app paso a paso. La app sirve para consultar el catálogo de la biblioteca de la escuela, pedir libros prestados y gestionar los préstamos.

---

## 1. Instalar la app (Android)

1. Copiá el archivo `apk/BibliotecaEscolar.apk` al celular (o descargalo desde el repositorio de GitHub).
2. Abrilo desde el celular. Si Android lo pide, permití instalar apps desde esa ubicación («Instalar apps desconocidas»).
3. Tocá **Instalar** y después **Abrir**.

> La app necesita conexión a internet: los datos se guardan en un servidor en la nube.

---

## 2. Entrar a la app

### Con una cuenta de prueba

Para probar los tres roles hay cuentas ya creadas:

| Rol | Correo | Contraseña |
|---|---|---|
| Administrador | `admin@biblioteca.local` | `Admin2026` |
| Bibliotecario | `bibliotecario@biblioteca.local` | `Biblio2026` |
| Alumno | `alumno@biblioteca.local` | `Alumno2026` |

1. Escribí el **correo** y la **contraseña**. El ícono del ojo 👁 muestra u oculta la contraseña.
2. Tocá **Ingresar**.

Si falta un dato o es incorrecto, aparece un mensaje en rojo debajo del campo o en la tarjeta (por ejemplo, «Correo o contraseña incorrectos.»).

### Crear una cuenta nueva

1. En la pantalla de inicio de sesión, tocá **Registrate**.
2. Completá nombre y apellido, correo, contraseña (mínimo 8 caracteres, con letras y números) y repetila.
3. Tocá **Crear cuenta**. La cuenta nueva empieza con el rol **Alumno**.

### Con Google, GitHub o Discord

1. Tocá **Continuar con Google**, **Continuar con GitHub** o **Continuar con Discord**.
2. Se abre la página de esa red social: iniciá sesión y aceptá compartir tu nombre y correo.
3. La app vuelve sola y entrás con tu cuenta. Si es la primera vez, se crea como **Alumno**.

### La sesión queda abierta

No hace falta ingresar cada vez: aunque cierres la app o reinicies el celular, la sesión sigue abierta hasta que toques **Cerrar sesión** (o pasen 30 días sin usarla).

---

## 3. Moverse por la app

Abajo hay una barra con pestañas. Lo que ves depende de tu rol:

| Pestaña | Alumno | Bibliotecario | Administrador |
|---|:---:|:---:|:---:|
| 🏠 **Inicio** | ✅ | ✅ | ✅ |
| 📖 **Catálogo** | ✅ | ✅ | ✅ |
| 🔁 **Mis préstamos / Préstamos** | ✅ | ✅ | ✅ |
| 👥 **Usuarios** | — | — | ✅ |
| 👤 **Perfil** | ✅ | ✅ | ✅ |

Arriba a la derecha está el botón 🌙/☀️ para cambiar entre **modo claro y oscuro**.

En cualquier lista podés **deslizar hacia abajo** para actualizar los datos.

---

## 4. Inicio

Muestra un saludo, tu rol y un resumen:

- **Alumno:** pedidos pendientes, libros en tu poder, devueltos y rechazados.
- **Bibliotecario:** títulos del catálogo, ejemplares disponibles, pedidos por revisar y devoluciones vencidas.
- **Administrador:** lo mismo que el bibliotecario, más la cantidad de usuarios.

Los **accesos rápidos** llevan directo a lo que más usa cada rol.

---

## 5. Catálogo

1. Usá el buscador para encontrar libros por **título, autor o ISBN**.
2. Tocá una **categoría** (Novela, Ciencia, etc.) para filtrar. «Todas» quita el filtro.
3. Cada tarjeta muestra cuántos ejemplares quedan disponibles (en verde) o «Sin ejemplares» (en rojo).
4. Tocá un libro para ver su **detalle**.
5. Si hay muchos libros, abajo aparece **Cargar más**.

### Pedir un préstamo (alumno)

1. Entrá al detalle del libro.
2. Tocá **Pedir préstamo**. Aparece el mensaje «Préstamo solicitado».
3. Esperá a que el bibliotecario lo apruebe. Podés tener hasta **3** préstamos activos o pendientes, y uno solo por libro.

### Agregar, editar o eliminar libros (bibliotecario y administrador)

- **Agregar:** en el catálogo, tocá el botón **+** (abajo a la derecha). Completá los campos con asterisco (*) y tocá **Agregar**.
- **Editar:** entrá al detalle del libro y tocá **Editar**. Cambiá los datos y tocá **Guardar**.
- **Eliminar:** en el detalle, tocá **Eliminar** y confirmá. No se puede eliminar un libro con préstamos pendientes o sin devolver.

---

## 6. Préstamos

### Alumno: «Mis préstamos»

- Filtrá por estado: **Pendiente** (esperando aprobación), **Prestado** (lo tenés vos), **Devuelto** o **Rechazado**.
- Los prestados muestran la **fecha límite de devolución** (14 días). Si se pasa, aparece «⚠ Devolución vencida».
- Para cancelar un pedido **pendiente**, tocá **Cancelar pedido** y confirmá.

### Bibliotecario y administrador: «Préstamos»

- Al entrar se ven los **pendientes**, que son los que hay que revisar.
- **Aprobar:** el libro pasa a «Prestado» y se descuenta un ejemplar.
- **Rechazar:** el pedido queda «Rechazado».
- **Registrar devolución:** en los prestados, cuando el alumno devuelve el libro. El ejemplar vuelve a estar disponible.
- El **administrador** también puede **eliminar registros** de préstamos devueltos o rechazados.

---

## 7. Usuarios (solo administrador)

1. Buscá por nombre o correo.
2. Tocá un **rol** (Administrador, Bibliotecario o Alumno) para cambiárselo a ese usuario.
3. Usá el interruptor **Cuenta activa** para desactivar o volver a activar una cuenta. Una cuenta desactivada no puede entrar.
4. **Eliminar usuario** borra la cuenta y sus préstamos (pide confirmación).

No podés cambiar tu propio rol, desactivarte ni eliminarte, para no quedarte sin acceso.

---

## 8. Perfil

- Muestra tus datos, desde cuándo sos miembro y con qué redes sociales entrás.
- **Editar perfil:** cambiá tu nombre o tu contraseña (para cambiarla, escribí primero la actual). Si entraste con una red social, podés crear una contraseña para entrar también con correo.
- **Modo oscuro:** interruptor para cambiar el tema.
- **Cerrar sesión:** sale de la cuenta en este celular (pide confirmación).

---

## 9. Mensajes frecuentes

| Mensaje | Qué hacer |
|---|---|
| «No se pudo conectar con el servidor.» | Revisá la conexión a internet y tocá **Reintentar**. |
| «Tu sesión expiró. Volvé a iniciar sesión.» | Ingresá de nuevo. |
| «No tenés permiso para realizar esta acción.» | Esa acción no corresponde a tu rol. |
| «Tu cuenta está desactivada.» | Pedile a un administrador que la active. |
| «No hay ejemplares disponibles de este libro.» | Esperá a que alguien lo devuelva. |
| «Podés tener hasta 3 préstamos activos o pendientes.» | Devolvé o cancelá alguno antes de pedir otro. |
