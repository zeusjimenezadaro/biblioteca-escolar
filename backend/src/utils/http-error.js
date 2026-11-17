// Error con código HTTP: los controladores lo lanzan y el manejador de errores lo responde en JSON.
export class HttpError extends Error {
  constructor(status, message, details) {
    super(message);
    this.status = status; // Ej.: 400, 401, 403, 404, 409.
    this.details = details; // Opcional: errores por campo del formulario.
  }
}

// Atajos para los errores más usados.
export const badRequest = (message, details) => new HttpError(400, message, details);
export const unauthorized = (message = "Iniciá sesión para continuar.") => new HttpError(401, message);
export const forbidden = (message = "No tenés permiso para realizar esta acción.") => new HttpError(403, message);
export const notFound = (message = "No se encontró el recurso.") => new HttpError(404, message);
export const conflict = (message) => new HttpError(409, message);
