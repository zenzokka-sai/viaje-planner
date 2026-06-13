const express = require("express");
const fs      = require("fs");
const path    = require("path");
const os      = require("os");

const app  = express();
const PORT = process.env.PORT || 3456;

app.use(express.json({ limit: "10mb" }));
app.use(express.static(path.join(__dirname, "public")));

// ─── Storage: Upstash Redis (nube) o archivo local ───────────────
const UPSTASH_URL   = process.env.UPSTASH_REDIS_REST_URL;
const UPSTASH_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;
const DATA_FILE     = path.join(__dirname, "data.json");
const KEY           = "viaje_data";

async function getData() {
  if (UPSTASH_URL) {
    // Modo nube: Upstash Redis
    const res  = await fetch(`${UPSTASH_URL}/get/${KEY}`, {
      headers: { Authorization: `Bearer ${UPSTASH_TOKEN}` },
    });
    const json = await res.json();
    return json.result || null;
  } else {
    // Modo local: archivo JSON
    if (!fs.existsSync(DATA_FILE)) return null;
    const raw = fs.readFileSync(DATA_FILE, "utf8");
    return raw === "{}" ? null : raw;
  }
}

async function setData(value) {
  if (UPSTASH_URL) {
    // Modo nube: Upstash Redis
    await fetch(`${UPSTASH_URL}/set/${KEY}`, {
      method:  "POST",
      headers: { Authorization: `Bearer ${UPSTASH_TOKEN}`, "Content-Type": "application/json" },
      body:    JSON.stringify([value]),
    });
  } else {
    // Modo local: archivo JSON
    fs.writeFileSync(DATA_FILE, value);
  }
}

// ─── Rutas ───────────────────────────────────────────────────────
app.get("/api/data", async (req, res) => {
  try   { res.json({ value: await getData() }); }
  catch { res.json({ value: null }); }
});

app.post("/api/data", async (req, res) => {
  try   { await setData(req.body.value); res.json({ ok: true }); }
  catch (err) { res.status(500).json({ error: err.message }); }
});

// ─── Inicio ───────────────────────────────────────────────────────
app.listen(PORT, "0.0.0.0", () => {
  if (UPSTASH_URL) {
    console.log(`\n✈️  Planificador corriendo en la nube — puerto ${PORT}\n`);
  } else {
    const nets    = os.networkInterfaces();
    let localIp   = "localhost";
    for (const name of Object.keys(nets))
      for (const net of nets[name])
        if (net.family === "IPv4" && !net.internal) { localIp = net.address; break; }

    console.log("\n╔══════════════════════════════════════════════╗");
    console.log("║   ✈️  Planificador Europa & Marruecos 2025   ║");
    console.log("╠══════════════════════════════════════════════╣");
    console.log(`║  Tu PC:       http://localhost:${PORT}          ║`);
    console.log(`║  Compañeros:  http://${localIp}:${PORT}      ║`);
    console.log("╠══════════════════════════════════════════════╣");
    console.log("║  Para URL fija: sube el proyecto a Railway   ║");
    console.log("║  Ver README.md para instrucciones            ║");
    console.log("╚══════════════════════════════════════════════╝\n");
    console.log("  Ctrl + C para detener.\n");
  }
});
