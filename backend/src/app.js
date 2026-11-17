// Configuración de la aplicación Express (sin encender el servidor: así sirve en local y en Vercel).
import express from "express";
import cors from "cors";
import { router } from "./routes/index.js";
import { errorHandler, notFoundHandler } from "./middleware/errors.js";
import { homePage, privacyPage } from "./pages.js";

export const app = express();

app.disable("x-powered-by"); // No revela la tecnología del servidor.
app.set("trust proxy", 1); // Detrás del proxy de Vercel: permite conocer la IP real para el límite de intentos.
app.use(cors()); // La app móvil no usa cookies; CORS habilita además probar desde el navegador.
app.use(express.json({ limit: "20kb" })); // Lee cuerpos JSON y rechaza envíos enormes.

// Páginas públicas (exigidas por Google para el login social).
app.get("/", (_req, res) => res.type("html").send(homePage));
app.get("/privacidad", (_req, res) => res.type("html").send(privacyPage));

app.use("/api", router);
app.use(notFoundHandler);
app.use(errorHandler);
