// Punto de entrada local: enciende la API (npm start).
import { app } from "./app.js";
import { env } from "./config/env.js";
import { pool } from "./config/database.js";

// 0.0.0.0 permite conectarse desde el celular usando la IP de la PC en la red.
const server = app.listen(env.port, "0.0.0.0", () => {
  console.log(`API Biblioteca disponible en http://localhost:${env.port}/api`);
});

// Al cerrar (Ctrl+C) se liberan el puerto y las conexiones a MySQL.
async function shutdown() {
  server.close();
  await pool.end();
}
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
