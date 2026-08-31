# {{name}}

A single-script terminal app, scaffolded with [apps-cli](https://github.com/gioahumada/apps-cli).

## Run

```sh
./main.sh
```

## Develop

Edit `main.sh` — that's the whole app. Keep it POSIX-friendly and prefer standard tools over new dependencies.

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
