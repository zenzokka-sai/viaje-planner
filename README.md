# ✈️ Planificador Europa & Marruecos — Despliegue en la nube

Sigue estos pasos para tener una URL fija que funcione desde
cualquier red, siempre encendida, sin depender de tu computador.

────────────────────────────────────────────────────────────────
PASO 1 — Crear cuentas gratuitas (5 minutos)
────────────────────────────────────────────────────────────────

1. GitHub:  https://github.com          (repositorio del código)
2. Upstash: https://upstash.com         (base de datos gratuita)
3. Railway: https://railway.app         (servidor gratuito)
   → En Railway, inicia sesión con tu cuenta de GitHub

────────────────────────────────────────────────────────────────
PASO 2 — Crear base de datos en Upstash
────────────────────────────────────────────────────────────────

1. Entra a https://upstash.com y crea cuenta
2. Clic en "Create Database"
3. Nombre: viaje-planner  |  Tipo: Redis  |  Región: US-East-1
4. Clic en "Create"
5. En la página de la base de datos, baja hasta "REST API"
6. Copia estos dos valores (los necesitarás en el Paso 4):
   - UPSTASH_REDIS_REST_URL
   - UPSTASH_REDIS_REST_TOKEN

────────────────────────────────────────────────────────────────
PASO 3 — Subir código a GitHub
────────────────────────────────────────────────────────────────

1. Descarga GitHub Desktop: https://desktop.github.com
2. Instálalo e inicia sesión con tu cuenta de GitHub
3. Clic en "Add" → "Add Existing Repository"
4. Selecciona esta carpeta (viaje-cloud)
   → Si dice "not a git repo", elige "create a repository"
5. Pon de nombre: viaje-planner
6. Clic en "Publish Repository" (deja "Keep this code private")

────────────────────────────────────────────────────────────────
PASO 4 — Desplegar en Railway
────────────────────────────────────────────────────────────────

1. Entra a https://railway.app
2. Clic en "New Project"
3. Elige "Deploy from GitHub repo"
4. Selecciona el repositorio "viaje-planner"
5. Railway empieza a desplegarlo automáticamente

6. Una vez desplegado, ve a tu proyecto en Railway
7. Clic en la pestaña "Variables"
8. Agrega estas dos variables (con los valores copiados en Paso 2):

   UPSTASH_REDIS_REST_URL    = https://xxx.upstash.io
   UPSTASH_REDIS_REST_TOKEN  = xxxxxxxxxxxxx

9. Railway reinicia el servidor automáticamente

────────────────────────────────────────────────────────────────
PASO 5 — Obtener tu URL permanente
────────────────────────────────────────────────────────────────

1. En Railway, ve a tu proyecto
2. Clic en "Settings" → "Domains"
3. Clic en "Generate Domain"
4. Tu URL quedará algo así:
   https://viaje-planner-production.up.railway.app

5. ¡Comparte esa URL con tus compañeros!
   Funciona desde cualquier red, en cualquier país,
   sin que tu PC esté encendida.

────────────────────────────────────────────────────────────────
MODO LOCAL (sin internet / sin Railway)
────────────────────────────────────────────────────────────────

Este mismo servidor funciona localmente sin configurar Upstash.
Solo ejecuta:

  npm install
  node server.js

Los datos se guardan en data.json en vez de Upstash.
