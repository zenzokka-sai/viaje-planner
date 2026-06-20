const babel = require("@babel/core");
const fs    = require("fs");
const path  = require("path");

const src  = path.join(__dirname, "src", "app.jsx");
const dest = path.join(__dirname, "public", "app.js");

console.log("📦 Compilando app.jsx...");

const code   = fs.readFileSync(src, "utf8");
const result = babel.transformSync(code, {
  presets: [
    ["@babel/preset-react", { runtime: "classic" }],
  ],
  plugins: [
    "@babel/plugin-transform-optional-chaining",
    "@babel/plugin-transform-nullish-coalescing-operator",
    "@babel/plugin-transform-async-to-generator",
  ],
  filename: "app.jsx",
});

fs.writeFileSync(dest, result.code);
console.log(`✅ Compilado → public/app.js (${(result.code.length/1024).toFixed(0)}KB)`);
