# Deploying to a production server (Docker)

The published image (`ghcr.io/invictus808/invictus:latest`, built by
[`.github/workflows/cd.yml`](.github/workflows/cd.yml) on every push to `main`) contains **no
personal content**. All real content (name, contact info, job history, projects) lives only on
the production host and is bind-mounted read-only into the container at deploy time — it's
never part of the image, so the image is safe to keep public on GHCR.

## One-time setup on the server

1. Install Docker and the Docker Compose plugin.
2. Clone this repo (or just copy `docker-compose.prod.yml` and the `content/` folder).
3. Populate real content from the committed placeholder templates:

   ```bash
   for f in content/*.example.json; do
       cp "$f" "${f/.example/}"
   done
   ```

   Edit each `content/*.json` file with your real data. Keep the files world-readable
   (`chmod 644 content/*.json`) so the container's non-root user can read them through the
   bind mount.
4. Create a `.env` file next to `docker-compose.prod.yml` (gitignored, never committed) with
   your Resend API key so the contact form can send email:

   ```bash
   echo "RESEND_API_KEY=re_your_real_key" > .env
   # optional, defaults to Resend's shared sandbox sender:
   echo "RESEND_FROM_EMAIL=contact@yourdomain.com" >> .env
   ```

   Docker Compose reads this file automatically. Without it, the site still works — only the
   contact form's submit button will return an error instead of sending email.

## Deploy / update

```bash
docker compose -f docker-compose.prod.yml pull
docker compose -f docker-compose.prod.yml up -d
```

To pick up new content without a new image, just edit the files in `content/` and restart:

```bash
docker compose -f docker-compose.prod.yml restart
```

## Health check

The container reports health via `GET /api/health` (also used internally by Docker's
`HEALTHCHECK`):

```bash
curl http://localhost:3000/api/health
docker inspect --format='{{json .State.Health}}' invictus
```
