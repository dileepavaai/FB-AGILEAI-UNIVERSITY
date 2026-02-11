import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { builtinModules } from "module";

// -------------------------------
// Resolve paths
// -------------------------------
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, "..");

// -------------------------------
// Config
// -------------------------------
const JS_EXT = [".js", ".mjs"];
const IGNORE_DIRS = ["node_modules", ".git", ".firebase"];

// Node core modules (Node 20 compatible)
const NODE_CORE_MODULES = new Set(builtinModules);

// -------------------------------
// Load package.json safely
// -------------------------------
const pkg = JSON.parse(
  fs.readFileSync(path.join(PROJECT_ROOT, "package.json"), "utf8")
);

const declaredDeps = new Set([
  ...Object.keys(pkg.dependencies || {}),
  ...Object.keys(pkg.devDependencies || {}),
]);

// -------------------------------
// Walk project files
// -------------------------------
function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir)) {
    const fullPath = path.join(dir, entry);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      if (!IGNORE_DIRS.includes(entry)) {
        walk(fullPath, files);
      }
    } else if (JS_EXT.some(ext => entry.endsWith(ext))) {
      files.push(fullPath);
    }
  }
  return files;
}

const sourceFiles = walk(PROJECT_ROOT);

// -------------------------------
// Scan imports
// -------------------------------
const importRegex = /import\s+.*?from\s+["']([^"']+)["']/g;
const missing = new Set();

for (const file of sourceFiles) {
  const content = fs.readFileSync(file, "utf8");
  let match;

  while ((match = importRegex.exec(content))) {
    const raw = match[1];

    // Ignore relative & absolute imports
    if (raw.startsWith(".") || raw.startsWith("/")) continue;

    const dep = raw.split("/")[0];

    // Ignore Node core modules
    if (NODE_CORE_MODULES.has(dep)) continue;

    if (!declaredDeps.has(dep)) {
      missing.add(dep);
    }
  }
}

// -------------------------------
// Result
// -------------------------------
if (missing.size > 0) {
  console.error("\n❌ Missing npm dependencies detected:\n");
  for (const dep of missing) {
    console.error(`   - ${dep}`);
  }
  console.error("\n👉 Fix with: npm install <dependency> --save\n");
  process.exit(1);
}

console.log("✅ Dependency check passed");
