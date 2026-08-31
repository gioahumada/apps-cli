# {{name}}

A single-script terminal app, scaffolded with [apps-cli](https://github.com/gioahumada/apps-cli).

## Run

```sh
./main.sh
```

## Develop

Edit `main.sh` — that's the whole app. Keep it POSIX-friendly and prefer standard tools over new dependencies.

---

> **apps-cli compatible** — this folder is an [apps-cli](https://github.com/gioahumada/apps-cli) app: it ships an `app.json` manifest, so it can be launched, edited and shared from the `apps` panel.
>
> ```sh
> apps run {{name}}                       # launch it
> apps install user/{{name}}              # install it from GitHub
> ```
