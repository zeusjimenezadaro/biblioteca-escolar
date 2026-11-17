// Manejo central de errores: toda respuesta de error tiene el formato { ok: false, message, errors? }.
import { HttpError } from "../utils/http-error.js";

// Ruta inexistente.
export function notFoundHandler(_req, res) {
  res.status(404).json({ ok: false, message: "Ruta no encontrada." });
}

// Express llama a esta función cuando un controlador lanza un error.
export function errorHandler(error, _req, res, _next) {
  if (error instanceof HttpError) {
    return res.status(error.status).json({ ok: false, message: error.message, ...(error.details && { errors: error.details }) });
  }
  if (error.type === "entity.parse.failed") {
    return res.status(400).json({ ok: false, message: "El cuerpo debe ser un JSON válido." });
  }
  if (error.type === "entity.too.large") {
    return res.status(413).json({ ok: false, message: "La solicitud es demasiado grande." });
  }
  if (error.code === "ER_DUP_ENTRY") {
    return res.status(409).json({ ok: false, message: "Ya existe un registro con esos datos." });
  }
  // Error inesperado (por ejemplo, la base no responde): se registra sin exponer detalles.
  console.error("Error en la API:", error.code || error.name, error.message);
  res.status(500).json({ ok: false, message: "Ocurrió un error en el servidor. Intentá de nuevo más tarde." });
}
