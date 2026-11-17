// Entrada para Vercel: exporta la app de Express como función serverless.
// En local se usa src/server.js; acá Vercel se encarga de recibir los pedidos.
import { app } from "../src/app.js";

export default app;
