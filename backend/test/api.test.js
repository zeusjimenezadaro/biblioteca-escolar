// Pruebas de integración: levantan la API con la base real (npm run setup antes) y recorren
// los flujos principales de cada rol. Si MySQL no está encendido, se omiten.
import test from "node:test";
import assert from "node:assert/strict";
import { app } from "../src/app.js";
import { pool } from "../src/config/database.js";

let base;
let server;
let dbReady = true;

test.before(async () => {
  try {
    await pool.query("SELECT 1");
  } catch {
    dbReady = false;
    return;
  }
  server = app.listen(0); // Puerto libre al azar.
  base = `http://127.0.0.1:${server.address().port}/api`;
});

test.after(async () => {
  server?.close();
  await pool.end();
});

// Hace un pedido a la API y devuelve el código de estado y el JSON.
async function call(method, path, { token, body } = {}) {
  const response = await fetch(base + path, {
    method,
    headers: { "Content-Type": "application/json", ...(token && { Authorization: `Bearer ${token}` }) },
    body: body ? JSON.stringify(body) : undefined,
  });
  return { status: response.status, data: await response.json() };
}

const login = async (email, password) => (await call("POST", "/auth/login", { body: { email, password } })).data;

test("login: rechaza credenciales incorrectas y acepta las correctas", async (t) => {
  if (!dbReady) return t.skip("MySQL no disponible");
  const bad = await call("POST", "/auth/login", { body: { email: "admin@biblioteca.local", password: "mala1234" } });
  assert.equal(bad.status, 401);
  const ok = await login("admin@biblioteca.local", "Admin2026");
  assert.equal(ok.user.role, "admin");
  assert.ok(ok.accessToken && ok.refreshToken);
  assert.equal(ok.user.password_hash, undefined); // Nunca se envía el hash.
});

test("validación: el registro informa cada campo inválido", async (t) => {
  if (!dbReady) return t.skip("MySQL no disponible");
  const r = await call("POST", "/auth/register", { body: { name: "", email: "no-es-correo", password: "123" } });
  assert.equal(r.status, 400);
  assert.ok(r.data.errors.name && r.data.errors.email && r.data.errors.password);
});

test("rutas protegidas: sin token responde 401", async (t) => {
  if (!dbReady) return t.skip("MySQL no disponible");
  assert.equal((await call("GET", "/books")).status, 401);
});

test("roles: el alumno no puede crear libros ni ver usuarios", async (t) => {
  if (!dbReady) return t.skip("MySQL no disponible");
  const { accessToken } = await login("alumno@biblioteca.local", "Alumno2026");
  const book = { title: "X", author: "Y", category: "Z", totalCopies: 1 };
  assert.equal((await call("POST", "/books", { token: accessToken, body: book })).status, 403);
  assert.equal((await call("GET", "/users", { token: accessToken })).status, 403);
});

test("CRUD de libros y flujo completo de préstamo", async (t) => {
  if (!dbReady) return t.skip("MySQL no disponible");
  const staff = (await login("bibliotecario@biblioteca.local", "Biblio2026")).accessToken;
  const student = (await login("alumno@biblioteca.local", "Alumno2026")).accessToken;

  // Crear
  const created = await call("POST", "/books", {
    token: staff,
    body: { title: "Libro de prueba", author: "Autor de prueba", category: "Pruebas", year: 2024, totalCopies: 1 },
  });
  assert.equal(created.status, 201);
  const id = created.data.book.id;

  // Leer y actualizar
  assert.equal((await call("GET", `/books/${id}`, { token: student })).data.book.title, "Libro de prueba");
  const updated = await call("PUT", `/books/${id}`, {
    token: staff,
    body: { title: "Libro de prueba 2", author: "Autor de prueba", category: "Pruebas", year: 2024, totalCopies: 1 },
  });
  assert.equal(updated.data.book.title, "Libro de prueba 2");

  // Préstamo: pedir, aprobar (resta un ejemplar), no se puede borrar el libro, devolver
  const loan = await call("POST", "/loans", { token: student, body: { bookId: id } });
  assert.equal(loan.status, 201);
  const approved = await call("PATCH", `/loans/${loan.data.loan.id}`, { token: staff, body: { action: "aprobar" } });
  assert.equal(approved.data.loan.status, "aprobado");
  assert.equal((await call("GET", `/books/${id}`, { token: staff })).data.book.availableCopies, 0);
  assert.equal((await call("DELETE", `/books/${id}`, { token: staff })).status, 409);
  const returned = await call("PATCH", `/loans/${loan.data.loan.id}`, { token: staff, body: { action: "devolver" } });
  assert.equal(returned.data.loan.status, "devuelto");

  // Eliminar
  assert.equal((await call("DELETE", `/books/${id}`, { token: staff })).status, 200);
  assert.equal((await call("GET", `/books/${id}`, { token: staff })).status, 404);
});

test("token de renovación: rota y no se puede reutilizar", async (t) => {
  if (!dbReady) return t.skip("MySQL no disponible");
  const { refreshToken } = await login("alumno@biblioteca.local", "Alumno2026");
  const first = await call("POST", "/auth/refresh", { body: { refreshToken } });
  assert.equal(first.status, 200);
  assert.ok(first.data.accessToken);
  // Reutilizar el mismo token es sospechoso: se rechaza.
  assert.equal((await call("POST", "/auth/refresh", { body: { refreshToken } })).status, 401);
});
