// server/index.js — {{name}} backend
import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());

app.get("/api/hello", (req, res) => {
  res.json({ app: "{{name}}", message: "hello 👋" });
});

// production: serve the client build
app.use(express.static(path.join(__dirname, "..", "client", "dist")));

app.listen(PORT, () => {
  console.log(`{{name}} API at http://localhost:${PORT}`);
});
