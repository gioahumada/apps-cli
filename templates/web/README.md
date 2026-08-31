# {{name}}

Full-stack app: Express API + Vite React client, scaffolded with [apps-cli](https://github.com/gioahumada/apps-cli).

## Run

```sh
npm run install:all
npm run dev     # client at http://localhost:5173, API at :3001
```

## Develop

- `server/` — Express API (`/api/hello`), serves the client build in production
- `client/` — Vite + React, proxies `/api` to the server
- Root `package.json` — runs both with `concurrently`

## Production

```sh
npm run prod    # builds the client, serves everything from Express
```

---

> **apps-cli compatible** — this folder is an [apps-cli](https://github.com/gioahumada/apps-cli) app: it ships an `app.json` manifest, so it can be launched, edited and shared from the `apps` panel.
>
> ```sh
> apps run {{name}}                       # launch it
> apps install user/{{name}}              # install it from GitHub
> ```
