import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { createServer } from "node:http";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import process from "node:process";
import { test } from "node:test";
import tailwindcss from "@tailwindcss/postcss";
import postcss from "postcss";
import { registryItemSchema } from "shadcn/schema";
import { getPackage } from "../package.ts";

const docsDir = resolve(import.meta.dirname, "../..");
const require = createRequire(import.meta.url);

const install = (dir) =>
  new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [
      require.resolve("shadcn"),
      "add",
      "@thread-ui/theme",
      "--yes",
      "--cwd",
      dir,
    ]);
    let output = "";
    child.stdout.on("data", (data) => (output += data));
    child.stderr.on("data", (data) => (output += data));
    child.on("error", reject);
    child.on("exit", (code) =>
      code === 0 ? resolve() : reject(new Error(output)),
    );
  });

test("theme installs via its namespace, preserves custom CSS, and compiles on repeat installs", async () => {
  const previousCwd = process.cwd();
  const dir = await mkdtemp(join(tmpdir(), "thread-ui-theme-test-"));
  let server;
  process.chdir(docsDir);
  try {
    const item = registryItemSchema.parse(await getPackage("theme"));
    assert.equal(item.type, "registry:theme");
    assert.equal(item.cssVars.light.secondary, "oklch(0.922 0 0)");
    assert.equal(item.cssVars.dark.secondary, "oklch(0.269 0 0)");
    assert.equal(item.cssVars.theme["color-canvas"], "var(--canvas)");
    assert.equal(item.cssVars.theme["color-topbar"], "var(--topbar)");
    assert.equal(item.cssVars.theme["font-sans"], undefined);
    assert.equal(item.cssVars.theme["font-mono"], undefined);
    assert.equal(item.dependencies?.length ?? 0, 0);
    assert.equal(item.files?.length ?? 0, 0);

    const requests = [];
    server = createServer((req, res) => {
      requests.push(req.url);
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify(item));
    });
    await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
    await writeFile(
      join(dir, "package.json"),
      JSON.stringify({
        name: "theme-consumer",
        private: true,
        devDependencies: { tailwindcss: "^4.1.18" },
      }),
    );
    await writeFile(
      join(dir, "tsconfig.json"),
      JSON.stringify({
        compilerOptions: { baseUrl: ".", paths: { "@/*": ["./*"] } },
      }),
    );
    await writeFile(
      join(dir, "components.json"),
      JSON.stringify({
        style: "base-rhea",
        rsc: false,
        tsx: true,
        tailwind: {
          css: "styles.css",
          baseColor: "neutral",
          cssVariables: true,
          prefix: "",
        },
        aliases: {
          components: "@/components",
          ui: "@/components/ui",
          utils: "@/lib/utils",
          hooks: "@/hooks",
          lib: "@/lib",
        },
        registries: {
          "@thread-ui": `http://127.0.0.1:${server.address().port}/r/{name}.json`,
        },
      }),
    );
    await writeFile(
      join(dir, "styles.css"),
      `
@import "tailwindcss";
@source inline("bg-canvas bg-secondary bg-topbar dark:bg-canvas");
@theme inline { --font-sans: "Existing Font", sans-serif; }
:root { --secondary: hotpink; --custom-color: red; }
.dark { --secondary: purple; }
@layer base { body { @apply bg-background text-foreground; } }
`,
    );
    await install(dir);
    const first = await readFile(join(dir, "styles.css"), "utf8");
    await install(dir);
    const installed = await readFile(join(dir, "styles.css"), "utf8");
    assert.equal(installed, first, "Reinstalling must not duplicate CSS");
    assert(requests.includes("/r/theme.json"));
    assert.match(installed, /Existing Font/);
    assert.match(installed, /--custom-color: red/);
    assert.doesNotMatch(installed, /hotpink|purple|@repo\/|font-geist/);
    const ast = postcss.parse(installed);
    for (const [mode, selector] of [
      ["light", ":root"],
      ["dark", ".dark"],
    ]) {
      const actual = {};
      ast.walkRules(selector, (rule) =>
        rule.walkDecls((decl) => {
          actual[decl.prop.slice(2)] = decl.value;
        }),
      );
      for (const [key, value] of Object.entries(item.cssVars[mode])) {
        assert.equal(actual[key], value, `${mode} ${key} must be installed`);
      }
      const scoped = item.css[`[data-slot="topbar"][data-variant="${mode}"]`];
      assert.equal(scoped["--secondary"], item.cssVars[mode].secondary);
    }
    const compiled = await postcss([tailwindcss({ base: dir })]).process(
      installed,
      {
        // Resolve Tailwind from the docs app, without installing fixture dependencies.
        from: join(docsDir, "theme-registry-test.css"),
      },
    );
    assert.match(
      compiled.css,
      /\.bg-canvas\s*\{\s*background-color: var\(--canvas\)/,
    );
    assert.match(
      compiled.css,
      /\.bg-topbar\s*\{\s*background-color: var\(--topbar\)/,
    );
    assert.match(compiled.css, /body\s*\{\s*background-color: var\(--canvas\)/);
    assert.match(compiled.css, /\.dark/);
  } finally {
    server?.closeAllConnections();
    if (server) await new Promise((resolve) => server.close(resolve));
    process.chdir(previousCwd);
    await rm(dir, { recursive: true, force: true });
  }
});
