// Conexión con MySQL mediante un pool (reutiliza conexiones entre consultas).
import mysql from "mysql2/promise";
import { env } from "./env.js";

// Datos de conexión; con DB_SSL=true se usa conexión cifrada (necesaria en la nube).
export const databaseConfig = {
  host: env.db.host,
  port: env.db.port,
  user: env.db.user,
  password: env.db.password,
  database: env.db.database,
  charset: "utf8mb4", // Soporta acentos y ñ.
  timezone: "Z", // Las fechas se guardan y leen en UTC.
  dateStrings: true, // Las fechas llegan como texto, listas para enviar en JSON.
  // La base gratuita en la nube «duerme» si no se usa: se le da tiempo a despertar.
  connectTimeout: 25000,
  ssl: env.db.ssl ? (env.db.sslCa ? { ca: env.db.sslCa } : { rejectUnauthorized: true }) : undefined,
};

export const pool = mysql.createPool({ ...databaseConfig, connectionLimit: 5 });

// Ejecuta varias consultas como una sola operación: si algo falla, no se guarda nada.
export async function transaction(work) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const result = await work(connection);
    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}
