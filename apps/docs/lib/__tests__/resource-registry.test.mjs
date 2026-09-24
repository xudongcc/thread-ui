import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { createServer } from "node:http";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import process from "node:process";
import { test } from "node:test";
import { pathToFileURL } from "node:url";
import { registryItemSchema } from "shadcn/schema";

const require = createRequire(import.meta.url);
const run = (command, args, cwd) =>
  new Promise((resolve, reject) => {
    const child = spawn(command, args, { cwd });
    let output = "";
    child.stdout.on("data", (data) => (output += data));
    child.stderr.on("data", (data) => (output += data));
    child.on("error", reject);
    child.on("exit", (code) =>
      code === 0 ? resolve() : reject(new Error(output)),
    );
  });

const docsDir = resolve(import.meta.dirname, "../..");
const { getPackage, getPackageNames } = await import(
  pathToFileURL(resolve(docsDir, "lib/package.ts")).href
);

test("hooks and libs are discoverable and install into configured aliases", async () => {
  const cwd = process.cwd();
  process.chdir(docsDir);
  try {
    const names = await getPackageNames();
    for (const [name, type, target] of [
      [
        "use-resource-navigation",
        "registry:hook",
        "@hooks/use-resource-navigation.ts",
      ],
      ["connection-search", "registry:lib", "@lib/connection-search.ts"],
    ]) {
      assert.ok(names.includes(name));
      const item = registryItemSchema.parse(await getPackage(name));
      assert.equal(item.type, type);
      assert.equal(item.files.length, 1);
      assert.equal(item.files[0].type, type);
      assert.equal(item.files[0].target, target);
      assert.ok(item.dependencies.some((dep) => dep.startsWith("zod@")));
      assert.deepEqual(item.registryDependencies, []);
      assert.doesNotMatch(item.files[0].content, /@repo\/|@\/gql|@\/schemas/);
      assert.ok(
        !item.devDependencies.some((dep) =>
          /vitest|testing-library|jsdom|typescript|react-dom/.test(dep),
        ),
      );
    }
    const hook = await getPackage("use-resource-navigation");
    assert.ok(hook.dependencies.some((dep) => dep.startsWith("lodash-es@")));
    assert.ok(
      hook.devDependencies.some((dep) => dep.startsWith("@types/lodash-es@")),
    );
    assert.ok(hook.files[0].content.startsWith('"use client"'));
    await assert.rejects(() => getPackage("../package"));
    await assert.rejects(() => getPackage("unknown-package"));
  } finally {
    process.chdir(cwd);
  }
});

test("shadcn installs both utilities with custom aliases and consumer types", async () => {
  const cwd = process.cwd();
  const dir = await mkdtemp(join(tmpdir(), "thread-ui-resources-"));
  let server;
  process.chdir(docsDir);
  try {
    const items = Object.fromEntries(
      await Promise.all(
        ["use-resource-navigation", "connection-search"].map(async (name) => [
          name,
          await getPackage(name),
        ]),
      ),
    );
    server = createServer((req, res) => {
      const name = req.url?.match(/^\/r\/(.+)\.json$/)?.[1];
      const item = items[name];
      res.writeHead(item ? 200 : 404, { "Content-Type": "application/json" });
      res.end(JSON.stringify(item ?? { error: "Unknown item" }));
    });
    await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
    await writeFile(
      join(dir, "package.json"),
      JSON.stringify({
        name: "resource-consumer",
        private: true,
        dependencies: { react: "^19.2.7" },
        devDependencies: { "@types/react": "^19.2.17" },
      }),
    );
    await writeFile(join(dir, "pnpm-lock.yaml"), "lockfileVersion: '9.0'\n");
    await writeFile(
      join(dir, "tsconfig.json"),
      JSON.stringify({
        compilerOptions: {
          target: "ES2022",
          module: "ESNext",
          moduleResolution: "Bundler",
          strict: true,
          skipLibCheck: true,
          noEmit: true,
          jsx: "react-jsx",
          paths: { "@/*": ["./src/*"] },
        },
        include: ["src"],
      }),
    );
    await writeFile(join(dir, "styles.css"), '@import "tailwindcss";\n');
    await writeFile(
      join(dir, "components.json"),
      JSON.stringify({
        style: "base-rhea",
        rsc: true,
        tsx: true,
        tailwind: {
          css: "styles.css",
          baseColor: "neutral",
          cssVariables: true,
        },
        aliases: {
          components: "@/components",
          ui: "@/components/ui",
          utils: "@/shared/lib/utils",
          hooks: "@/shared/hooks",
          lib: "@/shared/lib",
        },
        registries: {
          "@thread-ui": `http://127.0.0.1:${server.address().port}/r/{name}.json`,
        },
      }),
    );
    await run(
      process.execPath,
      [
        require.resolve("shadcn"),
        "add",
        "@thread-ui/use-resource-navigation",
        "@thread-ui/connection-search",
        "--yes",
        "--cwd",
        dir,
      ],
      dir,
    );
    const hook = await readFile(
      join(dir, "src/shared/hooks/use-resource-navigation.ts"),
      "utf8",
    );
    const lib = await readFile(
      join(dir, "src/shared/lib/connection-search.ts"),
      "utf8",
    );
    assert.match(hook, /useResourceNavigation/);
    assert.match(lib, /createConnectionSearchSchema/);
    const pkg = JSON.parse(await readFile(join(dir, "package.json"), "utf8"));
    assert.ok(pkg.dependencies.zod);
    assert.ok(pkg.dependencies["lodash-es"]);
    assert.ok(pkg.devDependencies["@types/lodash-es"]);
    await writeFile(
      join(dir, "src/example.ts"),
      `
import { useResourceNavigation } from "@/shared/hooks/use-resource-navigation";
import { OrderDirection, createConnectionSearchSchema, createFilterSchema, createInputFilterItemSearchSchema } from "@/shared/lib/connection-search";
const searchSchema = createConnectionSearchSchema({
  pageSize: 20, orderField: { ID: "ID" } as const,
  defaultOrderField: "ID", defaultOrderDirection: OrderDirection.ASC,
  filterSchema: createFilterSchema({ name: createInputFilterItemSearchSchema() }),
});
export function useExample() {
  return useResourceNavigation({ key: ["user", "products"], searchSchema });
}
`,
    );
    await run(
      process.execPath,
      [require.resolve("typescript/bin/tsc"), "-p", join(dir, "tsconfig.json")],
      dir,
    );
  } finally {
    server?.closeAllConnections();
    if (server) await new Promise((resolve) => server.close(resolve));
    process.chdir(cwd);
    await rm(dir, { recursive: true, force: true });
  }
});
