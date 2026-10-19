import { createServer } from "node:http";
import { createServer as createVite } from "vite";
import handler from "../api/index.js";
const server = createServer();
const port = 5178;
const vite = await createVite({
  server: { middlewareMode: true, hmr: { server } },
  appType: "spa",
});
server.on("request", (req, res) => {
  if (req.url.split("?")[0] === "/api") return handler(req, res);
  // Private server source is never served by Vite.
  if (/^\/(private|server|api)(\/|$)/.test(req.url)) {
    res.statusCode = 404;
    return res.end();
  }
  vite.middlewares(req, res);
});
server.on("error", (error) => { console.error(`No se pudo abrir el puerto ${port}: ${error.message}`); process.exit(1); });
server.listen(port, "0.0.0.0", () => console.log(`Chéverry: http://localhost:${port}`));
