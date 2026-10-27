import { copyFile, mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
const root = process.cwd();
const app = path.join(root, "test-results/account-ui-app");
await mkdir(path.join(app, "app/account"), { recursive: true });
await mkdir(path.join(app, "app/settings"), { recursive: true });
await mkdir(path.join(app, "public/brand"), { recursive: true });
await copyFile(
  path.join(root, "public/brand/kazi-logo.svg"),
  path.join(app, "public/brand/kazi-logo.svg"),
);
await writeFile(
  path.join(app, "package.json"),
  JSON.stringify({ name: "account-ui-verification", private: true }),
);
await writeFile(
  path.join(app, "next.config.mjs"),
  `export default {agentRules:false, devIndicators:false, webpack(config) { config.resolve.alias['@clerk/nextjs$'] = ${JSON.stringify(path.join(root, "tests/fixtures/clerk-account.tsx"))}; return config; }};`,
);
await writeFile(
  path.join(app, "tsconfig.json"),
  JSON.stringify({
    extends: "../../tsconfig.json",
    compilerOptions: {
      baseUrl: "../..",
      paths: {
        "@/*": ["src/*"],
        "@clerk/nextjs": ["tests/fixtures/clerk-account.tsx"],
      },
    },
    include: ["**/*.tsx", ".next/types/**/*.ts", ".next/dev/types/**/*.ts"],
    exclude: ["node_modules"],
  }),
);
await writeFile(
  path.join(app, "app/layout.tsx"),
  `import '../../../src/app/globals.css'; import '@iyanju/account-ui/styles.css';
export default function Layout({children}:{children:React.ReactNode}) {return <html lang="en"><body><style>{\`main{max-width:1120px;margin:auto;padding:24px}h1{font-size:32px}h2{font-size:24px}.fixture-controls{display:flex;flex-wrap:wrap;gap:8px;margin:24px 0}.fixture-controls button{padding:8px;min-height:44px}.fixture-summary,.fixture-signout,.fixture-dashboard{margin-top:40px}.hostile-header{width:260px;overflow:hidden}.hostile-app{font-family:Georgia,serif}.hostile-app button{font-family:Georgia;font-size:35px;border-radius:99px;color:hotpink;background:yellow}.after-menu{display:inline-flex;min-height:44px;align-items:center}\`}</style>{children}</body></html>}`,
);
await writeFile(
  path.join(app, "app/page.tsx"),
  `export { default } from '../../../tests/fixtures/account-ui';`,
);
await writeFile(
  path.join(app, "app/account/page.tsx"),
  `export { default } from '../../../../tests/fixtures/account-ui';`,
);
await writeFile(
  path.join(app, "app/settings/page.tsx"),
  `export default function Settings(){return <main><h1>Example settings</h1></main>}`,
);
console.log(
  "Prepared synthetic account/central-adapter fixture in ignored test-results/.",
);
