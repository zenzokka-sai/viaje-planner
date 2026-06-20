const express = require("express");
const fs      = require("fs");
const path    = require("path");
const os      = require("os");

const app  = express();
const PORT = process.env.PORT || 3456;

app.use(express.json({ limit: "10mb" }));
app.use(express.static(path.join(__dirname, "public")));

const UPSTASH_URL   = process.env.UPSTASH_REDIS_REST_URL;
const UPSTASH_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;
const DATA_FILE     = path.join(__dirname, "data.json");
const KEY           = "viaje_data";
const LOC_KEY       = "viaje_locations";

async function upstash(command, ...args) {
  const res = await fetch(`${UPSTASH_URL}/pipeline`, {
    method:  "POST",
    headers: { Authorization: `Bearer ${UPSTASH_TOKEN}`, "Content-Type": "application/json" },
    body:    JSON.stringify([[command, ...args]]),
  });
  const json = await res.json();
  return json[0]?.result ?? null;
}

async function getData() {
  if (UPSTASH_URL) return await upstash("GET", KEY);
  if (!fs.existsSync(DATA_FILE)) return null;
  const raw = fs.readFileSync(DATA_FILE, "utf8");
  return raw === "{}" ? null : raw;
}

async function setData(value) {
  if (UPSTASH_URL) { await upstash("SET", KEY, value); }
  else { fs.writeFileSync(DATA_FILE, value); }
}

// ─── Data endpoints ───────────────────────────────────────────
app.get("/api/data", async (req, res) => {
  try   { res.json({ value: await getData() }); }
  catch (err) { console.error("GET error:", err); res.json({ value: null }); }
});

app.post("/api/data", async (req, res) => {
  try   { await setData(req.body.value); res.json({ ok: true }); }
  catch (err) { console.error("POST error:", err); res.status(500).json({ error: err.message }); }
});

// ─── Location endpoints ───────────────────────────────────────
app.post("/api/location", async (req, res) => {
  try {
    const { name, lat, lng } = req.body;
    if (!name || !lat || !lng) return res.status(400).json({ error: "Missing fields" });

    let locs = {};
    try {
      if (UPSTASH_URL) {
        const raw = await upstash("GET", LOC_KEY);
        if (raw) locs = JSON.parse(raw);
      }
    } catch {}

    locs[name] = { lat, lng, timestamp: Date.now() };
    const serialized = JSON.stringify(locs);

    if (UPSTASH_URL) await upstash("SET", LOC_KEY, serialized);

    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete("/api/location/:name", async (req, res) => {
  try {
    let locs = {};
    if (UPSTASH_URL) {
      const raw = await upstash("GET", LOC_KEY);
      if (raw) locs = JSON.parse(raw);
    }
    delete locs[decodeURIComponent(req.params.name)];
    if (UPSTASH_URL) await upstash("SET", LOC_KEY, JSON.stringify(locs));
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/locations", async (req, res) => {
  try {
    let locs = {};
    if (UPSTASH_URL) {
      const raw = await upstash("GET", LOC_KEY);
      if (raw) locs = JSON.parse(raw);
    }
    // Remove locations older than 3 hours
    const cutoff = Date.now() - 3 * 60 * 60 * 1000;
    const active = Object.fromEntries(
      Object.entries(locs).filter(([_, v]) => v.timestamp > cutoff)
    );
    res.json({ locations: active });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Start ────────────────────────────────────────────────────
app.listen(PORT, "0.0.0.0", () => {
  if (UPSTASH_URL) {
    console.log(`\n✈️  Planificador en la nube — puerto ${PORT}\n`);
  } else {
    const nets = os.networkInterfaces();
    let ip = "localhost";
    for (const n of Object.keys(nets))
      for (const net of nets[n])
        if (net.family === "IPv4" && !net.internal) { ip = net.address; break; }
    console.log(`\n╔══════════════════════════════════════════════╗`);
    console.log(`║   ✈️  Planificador Europa & Marruecos 2025   ║`);
    console.log(`╠══════════════════════════════════════════════╣`);
    console.log(`║  Tu PC:       http://localhost:${PORT}          ║`);
    console.log(`║  Compañeros:  http://${ip}:${PORT}      ║`);
    console.log(`╚══════════════════════════════════════════════╝\n`);
  }
});
