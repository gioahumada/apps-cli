# {{name}}

A small Express server with a static frontend, scaffolded with [apps-cli](https://github.com/gioahumada/apps-cli).

## Run

```sh
npm install
npm run dev     # http://localhost:3000 (node --watch)
```

## Develop

- `server.js` — Express API (`/api/hello`) + static server
- `public/` — frontend, no build step

Prefer the Node.js standard library over new dependencies.

---

> **apps-cli compatible** — this folder is an [apps-cli](https://github.com/gioahumada/apps-cli) app: it ships an `app.json` manifest, so it can be launched, edited and shared from the `apps` panel.
>
> ```sh
> apps run {{name}}                       # launch it
> apps install user/{{name}}              # install it from GitHub
> ```
