// Instalador (npm run setup): crea la base y las tablas, y carga datos de demostración.
// Se puede repetir sin problema: no borra nada ni duplica los datos.
import mysql from "mysql2/promise";
import { readFile } from "node:fs/promises";
import { databaseConfig } from "../src/config/database.js";
import { hashPassword } from "../src/security/password.js";

const { database, ...serverConfig } = databaseConfig;

// Usuarios de prueba: uno por cada rol.
const demoUsers = [
  { name: "Ana Administradora", email: "admin@biblioteca.local", password: "Admin2026", role: "admin" },
  { name: "Bruno Bibliotecario", email: "bibliotecario@biblioteca.local", password: "Biblio2026", role: "bibliotecario" },
  { name: "Zeus Jimenez Adaro", email: "alumno@biblioteca.local", password: "Alumno2026", role: "alumno" },
];

// Libros de ejemplo para el catálogo.
const demoBooks = [
  ["Cien años de soledad", "Gabriel García Márquez", "Novela", 1967, 3, "La historia de la familia Buendía en el pueblo de Macondo."],
  ["El principito", "Antoine de Saint-Exupéry", "Novela", 1943, 4, "Un piloto perdido en el desierto conoce a un pequeño príncipe."],
  ["Martín Fierro", "José Hernández", "Clásicos", 1872, 3, "Poema gauchesco fundamental de la literatura argentina."],
  ["Ficciones", "Jorge Luis Borges", "Cuentos", 1944, 2, "Cuentos sobre laberintos, bibliotecas infinitas y espejos."],
  ["Rayuela", "Julio Cortázar", "Novela", 1963, 2, "Una novela que se puede leer en más de un orden."],
  ["El túnel", "Ernesto Sabato", "Novela", 1948, 2, "La confesión del pintor Juan Pablo Castel."],
  ["Don Quijote de la Mancha", "Miguel de Cervantes", "Clásicos", 1605, 2, "Las aventuras de un hidalgo que se cree caballero andante."],
  ["1984", "George Orwell", "Ciencia ficción", 1949, 3, "Una sociedad vigilada por el Gran Hermano."],
  ["Fahrenheit 451", "Ray Bradbury", "Ciencia ficción", 1953, 2, "Un futuro donde los bomberos queman libros."],
  ["Breve historia del tiempo", "Stephen Hawking", "Ciencia", 1988, 2, "Del Big Bang a los agujeros negros, explicado para todos."],
  ["Código limpio", "Robert C. Martin", "Informática", 2008, 2, "Buenas prácticas para escribir código legible y mantenible."],
  ["Introducción a los algoritmos", "Thomas H. Cormen", "Informática", 1990, 1, "Referencia clásica sobre algoritmos y estructuras de datos."],
];

// 1. Crear la base si no existe (en la nube suele venir creada y puede no haber permiso).
const server = await mysql.createConnection(serverConfig);
try {
  await server.query(`CREATE DATABASE IF NOT EXISTS \`${database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
} catch (error) {
  console.log(`Aviso: no se pudo crear la base «${database}» (${error.code}). Se usa la existente.`);
}
await server.end();

const db = await mysql.createConnection({ ...databaseConfig, multipleStatements: false });
try {
  // 2. Crear las tablas ejecutando cada instrucción de schema.sql.
  const sql = await readFile(new URL("../database/schema.sql", import.meta.url), "utf8");
  const statements = sql
    .replace(/--.*$/gm, "") // Quita los comentarios.
    .split(";")
    .map((s) => s.trim())
    .filter(Boolean);
  for (const statement of statements) await db.query(statement);
  console.log(`Tablas listas (${statements.length}).`);

  // 3. Usuarios de demostración (solo si todavía no existen).
  for (const u of demoUsers) {
    const [rows] = await db.execute("SELECT id FROM users WHERE email = ?", [u.email]);
    if (!rows.length) {
      await db.execute("INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)", [
        u.name,
        u.email,
        await hashPassword(u.password),
        u.role,
      ]);
    }
  }
  console.log("Usuarios de demostración listos.");

  // 4. Libros de ejemplo (solo si el catálogo está vacío).
  const [[{ total }]] = await db.query("SELECT COUNT(*) AS total FROM books");
  if (total === 0) {
    for (const [title, author, category, year, copies, description] of demoBooks) {
      await db.execute(
        "INSERT INTO books (title, author, category, year, total_copies, available_copies, description) VALUES (?, ?, ?, ?, ?, ?, ?)",
        [title, author, category, year, copies, copies, description],
      );
    }
    console.log(`Catálogo cargado con ${demoBooks.length} libros.`);
  }

  console.log("\nBase de datos preparada. Cuentas de prueba:");
  for (const u of demoUsers) console.log(`  ${u.role.padEnd(14)} ${u.email} / ${u.password}`);
} finally {
  await db.end();
}
