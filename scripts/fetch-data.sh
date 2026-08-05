#!/usr/bin/env bash
# Trae los posts recientes de Instagram vía Apify y regenera data/data.js.
# Uso: bash scripts/fetch-data.sh [usuario] [cantidad_de_posts]
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TOKEN_FILE="$SCRIPT_DIR/.apify_token"

if [ -z "${APIFY_API_TOKEN:-}" ] && [ -f "$TOKEN_FILE" ]; then
  APIFY_API_TOKEN="$(cat "$TOKEN_FILE")"
fi

if [ -z "${APIFY_API_TOKEN:-}" ]; then
  echo "Falta el token de Apify." >&2
  echo "Opción 1: export APIFY_API_TOKEN=tu_token" >&2
  echo "Opción 2: guárdalo una sola vez en scripts/.apify_token (no se sube a git)" >&2
  exit 1
fi

USERNAME="${1:-mosaico.lab_}"
POSTS_PER_PROFILE="${2:-30}"
ACTOR_ID="Gv87i5PtUqPlLcM2W" # instagram-scraper/fast-instagram-post-scraper
FIELDS="pk,shortcode,date,type,product_type,like_count,comment_count,view_count,caption,image,post_url"

echo "Consultando @${USERNAME} en Instagram (hasta ${POSTS_PER_PROFILE} posts)..."

RESPONSE="$(curl -sS -X POST \
  "https://api.apify.com/v2/acts/${ACTOR_ID}/run-sync-get-dataset-items?token=${APIFY_API_TOKEN}&fields=${FIELDS}" \
  -H "Content-Type: application/json" \
  -d "{\"instagramUsernames\":[\"${USERNAME}\"],\"postsPerProfile\":${POSTS_PER_PROFILE}}")"

FIRST_CHAR="${RESPONSE:0:1}"
if [ "$FIRST_CHAR" != "[" ]; then
  echo "La API de Apify devolvió un error:" >&2
  echo "$RESPONSE" >&2
  exit 1
fi

GENERATED_AT="$(date -u +"%Y-%m-%dT%H:%M:%SZ")"
DATA_FILE="$SCRIPT_DIR/../data/data.js"

{
  echo "// Generado automáticamente por scripts/fetch-data.sh — no editar a mano."
  echo "// Volver a correr el script para refrescar estos datos."
  printf 'const RAW_POSTS = %s;\n' "$RESPONSE"
  cat <<'EOF'
const POSTS_DATA = {
  fetchedAt: "__GENERATED_AT__",
  username: "__USERNAME__",
  posts: RAW_POSTS.map(function (p) {
    return {
      id: p.pk,
      shortcode: p.shortcode,
      date: p.date,
      type: p.type,
      productType: p.product_type,
      likes: p.like_count,
      comments: p.comment_count,
      views: p.view_count,
      caption: p.caption,
      image: p.image,
      url: p.post_url
    };
  })
};
EOF
} > "$DATA_FILE"

# Sustituye los marcadores sin depender de sed -i (no siempre disponible igual en Windows/macOS)
TMP_FILE="$(mktemp)"
awk -v gen="$GENERATED_AT" -v user="$USERNAME" \
  '{ gsub(/__GENERATED_AT__/, gen); gsub(/__USERNAME__/, user); print }' \
  "$DATA_FILE" > "$TMP_FILE" && mv "$TMP_FILE" "$DATA_FILE"

echo "Listo. Datos guardados en data/data.js ($(date -u +"%Y-%m-%d %H:%M UTC"))"
