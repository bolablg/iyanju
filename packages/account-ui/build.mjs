import { spawnSync } from "node:child_process";
import { copyFile, mkdir, rm } from "node:fs/promises";
import { fileURLToPath } from "node:url";
const root = fileURLToPath(new URL(".", import.meta.url));
await rm(new URL(".build/", import.meta.url), { recursive: true, force: true });
const compiler = fileURLToPath(
  new URL("../../node_modules/typescript/bin/tsc", import.meta.url),
);
const result = spawnSync(
  process.execPath,
  [compiler, "-p", "tsconfig.json", "--outDir", ".build"],
  {
    cwd: root,
    stdio: "inherit",
  },
);
if (result.status !== 0) process.exit(result.status ?? 1);
await mkdir(new URL("dist/fonts/", import.meta.url), { recursive: true });
for (const [source, target] of [
  [".build/index.js", "dist/index.js"],
  [".build/index.d.ts", "dist/index.d.ts"],
  [".build/theme.js", "dist/theme.js"],
  [".build/theme.d.ts", "dist/theme.d.ts"],
  ["src/styles.css", "dist/styles.css"],
  ["assets/plus-jakarta-sans.woff2", "dist/fonts/plus-jakarta-sans.woff2"],
  ["assets/OFL.txt", "dist/fonts/OFL.txt"],
])
  await copyFile(
    new URL(source, import.meta.url),
    new URL(target, import.meta.url),
  );
await rm(new URL(".build/", import.meta.url), { recursive: true, force: true });
