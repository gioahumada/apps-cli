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

> **apps-cli compatible** — this folder ships an `app.json` manifest, so it can be launched, edited and shared from the `apps` panel.
>
> [GitHub](https://github.com/gioahumada/apps-cli) · [npm](https://www.npmjs.com/package/@gioahumada/apps-cli) · [Homebrew tap](https://github.com/gioahumada/homebrew-tap)
>
> ```sh
> brew install gioahumada/tap/apps-cli
> # or: npm install -g @gioahumada/apps-cli
>
> apps run {{name}}                       # launch it
> apps install user/{{name}}              # install it from GitHub
> ```
