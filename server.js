import path from "node:path";
import { fileURLToPath } from "node:url";
import express from "express";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.join(__dirname, "public");
const port = Number(process.env.PORT || 3000);
const app = express();

app.disable("x-powered-by");
app.use(express.static(publicDir, { etag: true, maxAge: "1h" }));

app.get("*path", (_req, res) => {
  res.sendFile(path.join(publicDir, "index.html"));
});

app.listen(port, "0.0.0.0", () => {
  console.log(`Apresentacao KallTec disponivel na porta ${port}.`);
});
