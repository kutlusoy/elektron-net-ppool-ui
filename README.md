# Elektron Net PPLNS Pool UI

Angular frontend for [elektron-net-ppool](https://github.com/kutlusoy/elektron-net-ppool),
the PPLNS (shared) Stratum V1 mining server for Elektron Net. Forked from
[elektron-net-pool-ui](https://github.com/kutlusoy/elektron-net-pool-ui) (the
solo pool's UI), itself forked from `public-pool-ui` and rebranded for
Elektron Net.

This fork adds PPLNS-specific views on top of the existing dashboard:

- **Pool-wide PPLNS info** (splash page): current PPLNS window size, active
  miner count and difficulty contributed in the window, pool fee, and
  minimum payout threshold (`app-pplns-pool-info`, backed by
  `GET /api/pool/pplns-window-stats` and `GET /api/pool/fee-info`).
- **Pending balance** (per-address dashboard): the connected miner's unpaid
  PPLNS balance, total paid to date, and last payout time
  (`app-pplns-miner-status`, backed by `GET /api/miner/:address/pending-balance`).
- **Payout history** (per-address dashboard): a table of batched payouts —
  block height, amount, transaction id, status (`PENDING`/`SENT`/`CONFIRMED`)
  (`app-pplns-payout-history`, backed by `GET /api/miner/:address/payout-history`).
- **Solo vs. PPLNS banner**: since both pools run in parallel, a banner
  makes clear which one is being viewed and links to the other
  (`app-pool-mode-banner`). The link target is configurable via
  `SOLO_POOL_URL` in the runtime config (see below) — the domain/port split
  between the two pools is an operator decision (concept doc §8.5), not
  hardcoded.

All four PPLNS endpoints are read-only; no new write paths or credentials
are introduced in the UI. Everything else (worker list, hashrate charts,
network stats, connection instructions) is unchanged from the solo pool UI.

## Dependencies

Requires [elektron-net-ppool](https://github.com/kutlusoy/elektron-net-ppool)
to be running.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via a platform of your choice. To use this command, you need to first add a package that implements end-to-end testing capabilities.

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI Overview and Command Reference](https://angular.io/cli) page.

## Deployment

Install pm2 (https://pm2.keymetrics.io/)

```bash
$ pm2 serve --spa dist/elektron-net-pool-ui/ 3335 --name ui
```

## Docker

### Option A: complete package (backend + UI together, recommended)

`docker-compose.yml` in this repo builds and runs **both**
[elektron-net-ppool](https://github.com/kutlusoy/elektron-net-ppool) (the
backend) and this UI together, on one Docker network, with a single command
— no manual IP/hostname lookups, no CORS configuration. The UI's Caddy
server reverse-proxies `/api/*` straight to the backend container.

Clone both repos as sibling directories and set up the backend's `.env`
first (see that repo's README):

```
some-folder/
  elektron-net-ppool/       <- backend repo, .env already configured
  elektron-net-ppool-ui/    <- this repo
```

Then, from inside `elektron-net-ppool-ui/`:

```bash
docker compose up -d --build
```

Open [http://localhost:8080](http://localhost:8080) — the dashboard, PPLNS
views, and miner login now work without any further configuration, since the
UI reaches the backend internally via the `API_UPSTREAM` variable that's
already wired up in the compose file.

If your backend repo isn't a sibling directory, point at it explicitly:

```bash
ELEKTRON_PPOOL_PATH=/path/to/elektron-net-ppool docker compose up -d --build
```

The Stratum port (`3333`) is published so miners can connect; the backend's
API port (`3334`) stays internal-only (only the UI container needs it). See
`docker-compose.yml`'s own comments for the exact port/volume wiring, and
elektron-net-ppool's README ("Exposing the pool to the internet") before
opening anything to the internet.

### Option B: UI only (backend hosted/reachable separately)

Use this if the backend already runs elsewhere (a different machine, a
different Docker Compose stack, a managed host) and you just need this UI
pointed at it via an absolute URL instead of Compose's internal networking.

```bash
$ docker build -t elektron-net-pool-ui .
$ docker run --name elektron-net-pool-ui --rm -p 8080:80 \
    -e PUBLIC_POOL_API_URL=http://your-backend-host:3334 \
    elektron-net-pool-ui
```

Website will be accessible on [http://localhost:8080](http://localhost:8080).
By default Caddy server listens on port 80, but we bind it to port 8080 which
allows you to launch the image without root permissions.

Available variables:
* `API_UPSTREAM`: backend `host:port` to reverse-proxy `/api/*` to internally
  (e.g. `elektron-ppool:3334`, a container name reachable on the same Docker
  network) — this is what Option A sets for you. Mutually exclusive in
  practice with `PUBLIC_POOL_API_URL`: set one or the other, not both.
* `PUBLIC_POOL_API_URL`: absolute backend URL the browser calls directly
  (e.g. `http://your-backend-host:3334`). Use this (Option B) when the
  backend isn't reachable from inside this container's own Docker network.
* `PUBLIC_POOL_STRATUM_URL`: Stratum `host:port` shown to miners in the UI.
  Defaults to `<page's own hostname>:3333` if unset.
* `DOMAIN`: website domain (default: `localhost`)
* `LOGLEVEL`: loglevel in stdout (default: `INFO`)
* `LOGFORMAT`: log format in stdout (default: `json`)
* `PUBLIC_POOL_BLOCK_EXPLORER_TX_URL`: optional URL template containing the
  literal string `{txid}`, used to link payout transaction ids in the PPLNS
  payout history table to a block explorer. Empty renders the txid as plain
  text.
* `PUBLIC_POOL_SOLO_POOL_URL`: optional URL for the solo-pool switcher
  banner. Defaults to the `elektron-net-pool` GitHub repo if unset.

(The Cloudflare Pages Functions deployment in `functions/assets/runtime-config.js.ts`
uses the equivalent `ELEKTRON_POOL_BLOCK_EXPLORER_TX_URL` /
`ELEKTRON_POOL_SOLO_POOL_URL` variable names.)
