import { spawnSync } from "node:child_process";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
const root = fileURLToPath(new URL(".", import.meta.url));
await mkdir(new URL("releases/", import.meta.url), { recursive: true });
const result = spawnSync(
  "rtk",
  [
    "proxy",
    "npm",
    "pack",
    "--ignore-scripts",
    "--pack-destination",
    "releases",
    "--json",
  ],
  { cwd: root, encoding: "utf8" },
);
if (result.status !== 0) {
  process.stderr.write(result.stderr);
  process.exit(result.status ?? 1);
}
const [pack] = JSON.parse(result.stdout);
const data = await readFile(
  new URL(`releases/${pack.filename}`, import.meta.url),
);
await writeFile(
  new URL("releases.json", import.meta.url),
  JSON.stringify(
    {
      version: pack.version,
      archive: `packages/account-ui/releases/${pack.filename}`,
      sha256: createHash("sha256").update(data).digest("hex"),
      integrity: pack.integrity,
    },
    null,
    2,
  ) + "\n",
);
console.log(
  `Packed ${pack.filename}; ${data.length} bytes. Checksums recorded in releases.json.`,
);
