#!/usr/bin/env bash
# One-time bootstrap for Let's Encrypt certificates. Run this once on a fresh
# server before the first `docker compose up -d`, after DNS for DOMAIN
# already points at this server's public IP.
#
# Why this exists: nginx's config expects real certificate files to exist
# before it will start, but Let's Encrypt's HTTP-01 challenge requires nginx
# to already be running to serve it. This script breaks that cycle by
# starting nginx with a throwaway self-signed cert first, then swapping in
# the real one once obtained.
#
# Rate limits matter here. Let's Encrypt allows only 5 duplicate certificates
# per week for the same set of names, and this script is run on fresh servers —
# exactly where DNS has not propagated yet or port 80 is still closed. A few
# failed attempts can lock you out of issuing for a week. Dry-run the whole flow
# first against the staging endpoint, which has far looser limits:
#
#   STAGING=1 ./nginx/init-letsencrypt.sh
#
# That issues an untrusted certificate (browsers will warn) purely to prove the
# challenge succeeds. Re-run without STAGING to get the real one.
set -euo pipefail

cd "$(dirname "$0")/.."

if [ -f .env ]; then
    set -a
    source .env
    set +a
fi

if [ -z "${DOMAIN:-}" ]; then
    echo "DOMAIN is not set. Add DOMAIN=yourdomain.com to .env next to docker-compose.prod.yml first." >&2
    exit 1
fi

EMAIL_ARG="--register-unsafely-without-email"
if [ -n "${LETSENCRYPT_EMAIL:-}" ]; then
    EMAIL_ARG="--email ${LETSENCRYPT_EMAIL} --no-eff-email"
fi

STAGING_ARG=""
if [ -n "${STAGING:-}" ]; then
    STAGING_ARG="--staging"
    echo "### STAGING=1 — using Let's Encrypt's staging endpoint."
    echo "### The certificate issued will NOT be trusted by browsers. This is a"
    echo "### rehearsal to prove the HTTP-01 challenge works before spending a"
    echo "### production issuance."
fi

COMPOSE="docker compose -f docker-compose.prod.yml"
CERT_PATH="/etc/letsencrypt/live/${DOMAIN}"

echo "### Creating a dummy self-signed certificate for ${DOMAIN} so nginx can start..."
$COMPOSE run --rm --entrypoint sh certbot -c "
    mkdir -p '${CERT_PATH}' &&
    openssl req -x509 -nodes -newkey rsa:2048 -days 1 \
        -keyout '${CERT_PATH}/privkey.pem' \
        -out '${CERT_PATH}/fullchain.pem' \
        -subj '/CN=localhost'
"

echo "### Starting nginx with the dummy certificate..."
$COMPOSE up -d nginx

echo "### Deleting the dummy certificate..."
$COMPOSE run --rm --entrypoint sh certbot -c "
    rm -rf '/etc/letsencrypt/live/${DOMAIN}' \
           '/etc/letsencrypt/archive/${DOMAIN}' \
           '/etc/letsencrypt/renewal/${DOMAIN}.conf'
"

if [ -n "${STAGING:-}" ]; then
    echo "### Requesting a STAGING (untrusted) certificate for ${DOMAIN}..."
else
    echo "### Requesting a real Let's Encrypt certificate for ${DOMAIN}..."
fi
$COMPOSE run --rm --entrypoint certbot certbot certonly \
    --webroot -w /var/www/certbot \
    ${EMAIL_ARG} \
    ${STAGING_ARG} \
    -d "${DOMAIN}" -d "www.${DOMAIN}" \
    --rsa-key-size 2048 \
    --agree-tos

echo "### Reloading nginx with the new certificate..."
$COMPOSE exec nginx nginx -s reload

if [ -n "${STAGING:-}" ]; then
    echo "Staging run complete: the challenge succeeded, so the real run will too."
    echo "Now re-run without STAGING to obtain a trusted certificate:"
    echo "  ./nginx/init-letsencrypt.sh"
    exit 0
fi

echo "Done. ${DOMAIN} should now be serving HTTPS with a real Let's Encrypt certificate."
echo "Bring up the rest of the stack with: $COMPOSE up -d"
