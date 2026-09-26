import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { createServer } from "node:http";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import process from "node:process";
import { test } from "node:test";
import { URL, URLSearchParams } from "node:url";
import { registrySchema } from "shadcn/schema";
import { getPackageCatalog, getPackageNames } from "../package.ts";
import { searchRegistry } from "../registry-search.ts";

const catalog = [
  {
    name: "use-navigation",
    type: "registry:hook",
    title: "Navigation",
    description: "Remember list search.",
  },
  {
    name: "default-theme",
    type: "registry:theme",
    title: "Default Theme",
    description: "Shared colors.",
  },
  {
    name: "button",
    type: "registry:ui",
    title: "Button",
    description: "Interactive action.",
  },
  {
    name: "connection",
    type: "registry:lib",
    title: "Connection",
    description: "Cursor navigation helpers.",
  },
];
const search = (params = "") =>
  searchRegistry(catalog, new URLSearchParams(params));

test("searches names, titles and descriptions case-insensitively with all terms", () => {
  for (const query of ["default-theme", "DEFAULT THEME", "shared colors"]) {
    assert.deepEqual(
      search(`q=${encodeURIComponent(query)}`).items.map((item) => item.name),
      ["default-theme"],
    );
  }
  assert.equal(search("q=shared+missing").items.length, 0);
  assert.equal(search("q=%20%20").items.length, catalog.length);
  assert.equal(
    search("q=%5B.*%5D").items.length,
    0,
    "Search input is literal text, not a regular expression",
  );
});

test("supports type lists and combines type and query filters", () => {
  assert.deepEqual(
    search("type=registry:hook,registry:lib").items.map((item) => item.name),
    ["connection", "use-navigation"],
  );
  assert.equal(
    search("type=registry:theme&q=colors").items[0].name,
    "default-theme",
  );
  assert.equal(search("type=registry:theme&q=navigation").pagination.total, 0);
  assert.equal(search("type=registry:unknown").pagination.total, 0);
  assert.equal(search("type=,%20,%20registry:theme,%20").pagination.total, 1);
});

test("returns stable pagination with filtered totals, empty pages and defaults", () => {
  const all = registrySchema.parse(search());
  assert.deepEqual(all.pagination, {
    total: 4,
    limit: 100,
    offset: 0,
    hasMore: false,
  });
  assert.deepEqual(
    all.items.map((item) => item.name),
    ["button", "connection", "default-theme", "use-navigation"],
  );
  const first = search("q=navigation&limit=1");
  const second = search("q=navigation&limit=1&offset=1");
  assert.deepEqual(first.pagination, {
    total: 2,
    limit: 1,
    offset: 0,
    hasMore: true,
  });
  assert.deepEqual(second.pagination, {
    total: 2,
    limit: 1,
    offset: 1,
    hasMore: false,
  });
  assert.equal(first.items[0].name, "connection");
  assert.equal(second.items[0].name, "use-navigation");
  assert.deepEqual(search("offset=999").pagination, {
    total: 4,
    limit: 100,
    offset: 999,
    hasMore: false,
  });
  assert.deepEqual(search("offset=999").items, []);
  assert.deepEqual(search("q=no-match").pagination, {
    total: 0,
    limit: 100,
    offset: 0,
    hasMore: false,
  });
});

test("normalizes invalid pagination and honors large requested limits", () => {
  for (const value of [
    "",
    "-1",
    "1.5",
    "NaN",
    "Infinity",
    "bad",
    "9007199254740992",
  ]) {
    assert.equal(search(`limit=${value}`).pagination.limit, 100);
    assert.equal(search(`offset=${value}`).pagination.offset, 0);
  }
  assert.equal(search("limit=0").pagination.limit, 100);
  assert.equal(search("limit=10000").pagination.limit, 10000);
  assert.equal(search("limit=10000").items.length, catalog.length);
});

const docsDir = resolve(import.meta.dirname, "../..");

test("the metadata catalog includes all four package groups without installation payloads", async () => {
  const previous = process.cwd();
  process.chdir(docsDir);
  try {
    const items = await getPackageCatalog();
    assert.deepEqual(
      items.map((item) => item.name),
      await getPackageNames(),
    );
    assert.deepEqual([...new Set(items.map((item) => item.type))].sort(), [
      "registry:hook",
      "registry:lib",
      "registry:theme",
      "registry:ui",
    ]);
    for (const item of items) {
      assert.deepEqual(Object.keys(item).sort(), [
        "description",
        "name",
        "title",
        "type",
      ]);
    }
    assert.equal(
      items.find((item) => item.name === "default-theme").title,
      "Thread UI Default Theme",
    );
    registrySchema.parse(searchRegistry(items, new URLSearchParams()));
  } finally {
    process.chdir(previous);
  }
});

const require = createRequire(import.meta.url);
const cli = (args) =>
  new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [
      require.resolve("shadcn"),
      "search",
      ...args,
      "--json",
    ]);
    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (data) => (stdout += data));
    child.stderr.on("data", (data) => (stderr += data));
    child.on("error", reject);
    child.on("exit", (code) => {
      if (code !== 0) return reject(new Error(stderr || stdout));
      try {
        resolve(JSON.parse(stdout));
      } catch (error) {
        reject(error);
      }
    });
  });

test("shadcn CLI forwards search parameters and consumes metadata pages", async () => {
  const previous = process.cwd();
  const dir = await mkdtemp(join(tmpdir(), "thread-registry-search-"));
  let server;
  process.chdir(docsDir);
  try {
    const items = await getPackageCatalog();
    const requests = [];
    server = createServer((req, res) => {
      const url = new URL(req.url, "http://localhost");
      requests.push(url);
      res.setHeader("Content-Type", "application/json");
      if (url.pathname !== "/r/registry.json") {
        res.writeHead(404);
        res.end("{}");
        return;
      }
      res.end(JSON.stringify(searchRegistry(items, url.searchParams)));
    });
    await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
    const base = `http://127.0.0.1:${server.address().port}`;
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
          utils: "@/lib/utils",
          hooks: "@/hooks",
          lib: "@/lib",
        },
        registries: { "@thread-ui": `${base}/r/{name}.json` },
      }),
    );
    await writeFile(
      join(dir, "package.json"),
      JSON.stringify({ name: "search-consumer", private: true }),
    );
    const theme = await cli([
      "@thread-ui",
      "--cwd",
      dir,
      "--query",
      "theme",
      "--type",
      "theme",
      "--limit",
      "1",
    ]);
    assert.deepEqual(
      theme.items.map((item) => item.name),
      ["default-theme"],
    );
    assert.equal(theme.items[0].addCommandArgument, "@thread-ui/default-theme");
    assert.deepEqual(theme.pagination, {
      total: 1,
      limit: 1,
      offset: 0,
      hasMore: false,
    });
    const request = requests.find(
      (url) => url.searchParams.get("q") === "theme",
    );
    assert.equal(request.searchParams.get("type"), "registry:theme");
    assert.equal(request.searchParams.get("limit"), "1");
    const paged = await cli([
      "@thread-ui",
      "--cwd",
      dir,
      "--limit",
      "2",
      "--offset",
      "1",
    ]);
    assert.deepEqual(
      paged.items.map((item) => item.name),
      items.slice(1, 3).map((item) => item.name),
    );
    assert.equal(paged.pagination.total, items.length);
    assert.equal(paged.pagination.offset, 1);
    assert.equal(paged.pagination.hasMore, true);
    assert(
      requests.every((url) => url.pathname === "/r/registry.json"),
      "Searching never downloads item source",
    );
  } finally {
    server?.closeAllConnections();
    if (server) await new Promise((resolve) => server.close(resolve));
    process.chdir(previous);
    await rm(dir, { recursive: true, force: true });
  }
});
