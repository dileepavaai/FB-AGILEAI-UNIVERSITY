import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const INDEX_FILE = path.resolve(__dirname, "../index.js");

if (!fs.existsSync(INDEX_FILE)) {
  console.error("❌ index.js not found");
  process.exit(1);
}

const code = fs.readFileSync(INDEX_FILE, "utf8");

const hasEnvPort = /process\.env\.PORT/.test(code);
const hasListen = /app\.listen\(\s*PORT\s*,\s*["']0\.0\.0\.0["']/.test(code);

if (!hasEnvPort) {
  console.error("❌ PORT must use process.env.PORT");
  process.exit(1);
}

if (!hasListen) {
  console.error("❌ app.listen must bind to 0.0.0.0");
  process.exit(1);
}

console.log("✅ PORT configuration valid");
