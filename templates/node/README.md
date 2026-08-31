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
