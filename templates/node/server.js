// server.js — {{name}}
import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;

app.get("/api/hello", (req, res) => {
  res.json({ app: "{{name}}", message: "hello 👋" });
});

app.use(express.static(path.join(__dirname, "public")));

app.listen(PORT, () => {
  console.log(`{{name}} at http://localhost:${PORT}`);
});
