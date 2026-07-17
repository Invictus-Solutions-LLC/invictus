# Deploying to a production server (Docker)

The published image (`ghcr.io/invictus808/invictus:latest`, built by
[`.github/workflows/cd.yml`](.github/workflows/cd.yml) on every push to `main`) contains **no
personal content**. All real content (name, contact info, job history, projects) lives only on
the production host and is bind-mounted read-only into the container at deploy time — it's
never part of the image, so the image is safe to keep public on GHCR.

The stack is three containers: the app itself (not directly exposed), nginx (the only public
entrypoint — TLS termination, gzip, security headers, reverse proxy to the app), and a certbot
sidecar that keeps the Let's Encrypt certificate renewed automatically.

## One-time setup on the server

0. Point your domain's DNS `A` (and `AAAA` if applicable) records at this server's public IP
   before continuing — Let's Encrypt's HTTP-01 challenge needs that to already be in place.
1. Install Docker and the Docker Compose plugin.
2. Clone this repo (or just copy `docker-compose.prod.yml`, `nginx/`, and the `content/` folder).
3. Populate real content from the committed placeholder templates:

   ```bash
   for f in content/*.example.json; do
       cp "$f" "${f/.example/}"
   done
   ```

   Edit each `content/*.json` file with your real data. Keep the files world-readable
   (`chmod 644 content/*.json`) so the container's non-root user can read them through the
   bind mount.
4. Create a `.env` file next to `docker-compose.prod.yml` (gitignored, never committed):

   ```bash
   cat > .env <<'EOF'
   # --- Contact form (Resend) ---
   RESEND_API_KEY=re_your_real_key
   # Until you verify a domain at resend.com/domains, leave RESEND_FROM_EMAIL unset
   # (it defaults to Resend's sandbox sender) and point RESEND_TO_EMAIL at your Resend
   # account's own email — the sandbox will ONLY deliver there. Once your domain is
   # verified, set RESEND_FROM_EMAIL=contact@yourdomain.com and you can drop RESEND_TO_EMAIL.
   RESEND_TO_EMAIL=you@example.com
   # RESEND_FROM_EMAIL=contact@yourdomain.com

   # --- Private plain-text resume at /api/resume (optional) ---
   # Comma-separated secret tokens; leave empty to keep the endpoint disabled (404 for all).
   # Generate with: openssl rand -hex 24
   RESUME_ACCESS_TOKENS=

   # --- nginx + Let's Encrypt TLS (required) ---
   DOMAIN=yourdomain.com
   LETSENCRYPT_EMAIL=you@yourdomain.com
   EOF
   ```

   Docker Compose reads this file automatically. `DOMAIN` is required for nginx/TLS to work at
   all. `RESEND_API_KEY` is optional (the contact form just returns an error without it) — but if
   you set it while still on Resend's sandbox sender, you **must** also set `RESEND_TO_EMAIL` to
   your Resend account email, or every submission fails with a 502.
5. Bootstrap the Let's Encrypt certificate (one-time only — see the comment in the script for
   why this extra step exists):

   ```bash
   ./nginx/init-letsencrypt.sh
   ```

## Deploy / update

```bash
docker compose -f docker-compose.prod.yml pull    # or: make prod-pull
docker compose -f docker-compose.prod.yml up -d    # or: make prod-up
```

To pick up new content without a new image, just edit the files in `content/` and restart:

```bash
docker compose -f docker-compose.prod.yml restart invictus    # or: make prod-restart
```

### If `pull` fails with "unauthorized" / "denied"

GHCR packages are **private by default even when the repo is public**. Either make the package
public once (GitHub → your profile → Packages → `invictus` → Package settings → change visibility
to Public), or authenticate on the server with a personal access token that has `read:packages`:

```bash
echo "$GHCR_PAT" | docker login ghcr.io -u invictus808 --password-stdin
```

### Pull the image — don't build it on the server

The commands above **pull** the prebuilt image from GHCR (published automatically by CI on every
push to `main`). Do **not** run `docker build` / `make docker-build` on a small production host:
the image build runs `yarn install`, which is memory-hungry, and on a low-RAM box (e.g. a 1 GB
VM) it gets OOM-killed — you'll see the install step die with `Killed` and exit code `137`. Since
the server only ever pulls, its RAM never matters for the build.

If you must build on a memory-constrained host anyway, add swap first:

```bash
sudo fallocate -l 2G /swapfile && sudo chmod 600 /swapfile
sudo mkswap /swapfile && sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

Certificate renewal is automatic (the `certbot` container checks twice a day and only actually
renews when the cert is due). No further action needed once step 5 above has run once.

## Alternative: behind an existing host nginx

If the server already runs its own nginx (or another reverse proxy) on ports 80/443, you don't
want the bundled `nginx` + `certbot` containers fighting it for those ports — that's the
`address already in use` error. Instead, run **only the app container** and let your host proxy
forward to it:

```
Internet -> host nginx (:80/:443, TLS) -> 127.0.0.1:3000 (app container)
```

1. Do the one-time setup above, but for `.env` you only need `RESEND_*` and
   `RESUME_ACCESS_TOKENS` — `DOMAIN` / `LETSENCRYPT_EMAIL` are unused here (your host nginx
   handles TLS), and you can skip `./nginx/init-letsencrypt.sh` entirely.
2. Start just the app — published on `127.0.0.1:3000`, reachable only from the host:

   ```bash
   make app-pull && make app-up      # uses docker-compose.app.yml (no bundled nginx/certbot)
   ```
3. Add a server block to your host nginx that proxies to it. A ready-to-edit template is at
   [`nginx/host-invictus.conf.example`](nginx/host-invictus.conf.example):

   ```bash
   sudo cp nginx/host-invictus.conf.example /etc/nginx/conf.d/yourdomain.conf
   # edit server_name, then:
   sudo nginx -t && sudo systemctl reload nginx
   sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com   # adds HTTPS + redirect
   ```

   The app sends its own security headers and CSP straight through the proxy, so don't re-add
   them (you'd get duplicates) — just add HSTS to the `:443` block certbot creates, per the note
   in the template.

To update later: `make app-pull && make app-up`. For content-only edits: `make app-restart`.

## Health check

The app container reports health via `GET /api/health` internally, and nginx has its own
healthcheck on `/`:

```bash
curl https://yourdomain.com/api/health
docker inspect --format='{{json .State.Health}}' invictus
docker inspect --format='{{json .State.Health}}' invictus-nginx
```
