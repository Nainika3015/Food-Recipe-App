# FreeBuff – Preview Run Doc

Pure static site (HTML + CSS + Vanilla JS + Local Storage). No npm packages, no build step, no env files to copy.

## Reproduce artifacts

None required — all application files are committed in the workspace root:
`index.html`, `*.html`, `admin/*.html`, `css/*.css`, `js/*.js`.

## Run the server

A zero-dependency static server is included (`serve.js`, uses only Node's built-in `http` module):

```powershell
powershell -NoProfile -Command "(Start-Process -FilePath 'node.exe' -ArgumentList 'serve.js' -RedirectStandardOutput '<log>' -RedirectStandardError '<log>.err' -WindowStyle Hidden -PassThru).Id"
```

- Port: **8000** (hard-coded in `serve.js`; do not rely on a `PORT` env var — this machine has `PORT=0` set globally which breaks the fallback).
- Open `http://localhost:8000/index.html`.
- Alternative with no server at all: double-click `index.html` (works via file://, except clipboard copy).

## Demo credentials

- User: `nainika@cravecart.com` / `demo123` (also `alisha@cravecart.com`, `swaroopa@cravecart.com`)
- Admin: `admin@cravecart.com` / `admin123` at `http://localhost:8000/admin/admin-login.html`
- Local Storage keys are `cravecart_*`; old `freebuff_*` keys are wiped automatically on load.
