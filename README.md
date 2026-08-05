# Mosaico · Panel de contenido

Dashboard estático (HTML/CSS/JS, sin frameworks ni build step) para ver de un vistazo
el rendimiento de los posts de `@mosaico.lab_` en Instagram: likes, comentarios,
mejores posts y tabla completa.

## Cómo verlo

Abre `index.html` directamente en el navegador (doble clic). No necesita servidor:
los datos viven en `data/data.js` como una variable de JS, no como un `fetch()` a un
archivo, así que funciona incluso abierto como `file://`.

## Cómo refrescar los datos

Los datos se traen de Instagram con el Actor **Fast Instagram Profile Posts Scraper**
de Apify. Para actualizarlos:

1. Consigue tu token de API en [Apify Console → Settings → Integrations](https://console.apify.com/account/integrations).
2. Guárdalo (una sola vez) en `scripts/.apify_token` — ese archivo está en `.gitignore`,
   así que nunca se sube a git. O expórtalo como variable de entorno antes de correr
   el script:
   ```bash
   export APIFY_API_TOKEN=tu_token
   ```
3. Corre el script desde Git Bash:
   ```bash
   bash scripts/fetch-data.sh
   ```
   Por defecto trae los últimos 30 posts de `mosaico.lab_`. Para otra cuenta o
   cantidad:
   ```bash
   bash scripts/fetch-data.sh otro.usuario 50
   ```
4. Recarga `index.html` en el navegador.

Cada corrida del script cuesta centavos de dólar en tu cuenta de Apify (paga por
resultado). 30 posts son unos $0.03.

## Notas

- Las miniaturas de los posts vienen de URLs firmadas de Instagram que **expiran**
  (días, no meses). Si ves imágenes rotas en la tabla, corre `fetch-data.sh` de nuevo.
- El dashboard no calcula "engagement rate" (%) porque el Actor no trae el número de
  seguidores — en su lugar usa "interacciones" (likes + comentarios) como proxy.
- `data/data.js` queda versionado en git a propósito: es solo métricas públicas de
  posts, sin datos sensibles, y así el dashboard funciona apenas clonas el repo sin
  tener que correr el script primero.

## Estructura

```
index.html          panel principal
css/styles.css       paleta de marca de Mosaico + layout
js/charts.js         mini librería de charts SVG (línea + barra), sin dependencias
js/app.js            cálculo de métricas y render
data/data.js          datos generados por el script (versionado)
scripts/fetch-data.sh script que llama a Apify y regenera data/data.js
```
