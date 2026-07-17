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
   echo "RESEND_API_KEY=re_your_real_key" > .env
   echo "RESEND_FROM_EMAIL=contact@yourdomain.com" >> .env
   echo "DOMAIN=yourdomain.com" >> .env
   echo "LETSENCRYPT_EMAIL=you@yourdomain.com" >> .env
   ```

   Docker Compose reads this file automatically. `RESEND_API_KEY` is optional (the contact form
   just returns an error without it); `DOMAIN` is required for nginx/TLS to work at all.
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

## Health check

The app container reports health via `GET /api/health` internally, and nginx has its own
healthcheck on `/`:

```bash
curl https://yourdomain.com/api/health
docker inspect --format='{{json .State.Health}}' invictus
docker inspect --format='{{json .State.Health}}' invictus-nginx
```
