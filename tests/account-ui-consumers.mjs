import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import path from "node:path";
const root = process.cwd();
const release = JSON.parse(
  await readFile("packages/account-ui/releases.json", "utf8"),
);
const archive =
  process.env.IYANJU_ACCOUNT_UI_ARCHIVE ||
  `file:${path.join(root, release.archive)}`;
const lock = JSON.parse(await readFile("package-lock.json", "utf8"));
function run(args, cwd) {
  const result = spawnSync("rtk", ["proxy", ...args], {
    cwd,
    stdio: "inherit",
    env: {
      ...process.env,
      npm_config_cache: path.join(root, "test-results/consumer-cache"),
    },
  });
  if (result.status !== 0) process.exit(result.status ?? 1);
}
for (const target of ["spa", "next"]) {
  const dir = path.join(root, `test-results/clean-consumer-${target}`);
  await mkdir(dir, { recursive: true });
  await rm(path.join(dir, "node_modules"), { recursive: true, force: true });
  await rm(path.join(dir, "package-lock.json"), { force: true });
  const dependencies =
    target === "spa"
      ? { react: "18.3.1", "react-dom": "18.3.1", vite: "8.3.5" }
      : Object.fromEntries(
          [
            "react",
            "react-dom",
            "next",
            "typescript",
            "@types/react",
            "@types/node",
          ].map((name) => [
            name,
            lock.packages[`node_modules/${name}`].version,
          ]),
        );
  await writeFile(
    path.join(dir, "package.json"),
    JSON.stringify(
      {
        name: `account-ui-${target}-verification`,
        private: true,
        type: "module",
        dependencies: { ...dependencies, "@iyanju/account-ui": archive },
      },
      null,
      2,
    ),
  );
  const menu = `import {AccountMenu} from '@iyanju/account-ui'; export default function Menu(){return <AccountMenu state={{status:'signed-in',identity:{name:'Synthetic Example',email:'example@example.invalid'}}} links={{profile:'/account?view=profile',services:'/account',signIn:'/account',signUp:'/account/sign-up'}} onSignOut={async()=>{}}/>}`;
  if (target === "spa") {
    await writeFile(
      path.join(dir, "index.html"),
      '<html lang="en"><head><title>Account archive SPA verification</title></head><body><div id="root"></div><script type="module" src="/main.jsx"></script></body></html>',
    );
    await writeFile(
      path.join(dir, "main.jsx"),
      `import React from 'react'; import {createRoot} from 'react-dom/client'; import '@iyanju/account-ui/styles.css'; import Menu from './menu.jsx'; createRoot(document.getElementById('root')).render(<Menu/>);`,
    );
    await writeFile(
      path.join(dir, "menu.jsx"),
      `import React from 'react'; ${menu}`,
    );
  } else {
    await mkdir(path.join(dir, "app"), { recursive: true });
    await writeFile(
      path.join(dir, "next.config.mjs"),
      `export default {agentRules:false,turbopack:{root:${JSON.stringify(dir)}},typescript:{ignoreBuildErrors:false}}`,
    );
    await writeFile(
      path.join(dir, "app/layout.tsx"),
      `import '@iyanju/account-ui/styles.css'; import {accountTheme} from '@iyanju/account-ui/theme'; export default function Layout({children}:{children:React.ReactNode}){return <html lang="en"><body style={{fontFamily:accountTheme.variables.fontFamily}}>{children}</body></html>}`,
    );
    await writeFile(path.join(dir, "app/page.tsx"), `'use client'; ${menu}`);
  }
  run(
    [
      "npm",
      "install",
      "--package-lock-only",
      "--ignore-scripts",
      "--no-audit",
      "--no-fund",
    ],
    dir,
  );
  // npm ci proves the lockfile installs the archive independently of the source checkout.
  run(["npm", "ci", "--ignore-scripts", "--no-audit", "--no-fund"], dir);
  run(
    [
      "node",
      target === "spa"
        ? "node_modules/vite/bin/vite.js"
        : "node_modules/next/dist/bin/next",
      "build",
    ],
    dir,
  );
  const installed = JSON.parse(
    await readFile(
      path.join(dir, "node_modules/@iyanju/account-ui/package.json"),
      "utf8",
    ),
  );
  if (installed.version !== release.version)
    throw new Error("Consumer installed the wrong archive version");
  for (const file of [
    "index.js",
    "index.d.ts",
    "theme.js",
    "theme.d.ts",
    "styles.css",
    "fonts/plus-jakarta-sans.woff2",
    "fonts/OFL.txt",
  ]) {
    const source = await readFile(
      path.join(root, "packages/account-ui/dist", file),
    );
    const installedFile = await readFile(
      path.join(dir, "node_modules/@iyanju/account-ui/dist", file),
    );
    if (!source.equals(installedFile))
      throw new Error(`Archive mismatch: ${file}`);
  }
  console.log(
    `PASS: clean ${target} build with account-ui ${installed.version}.`,
  );
}
