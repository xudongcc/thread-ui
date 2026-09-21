import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { test } from "node:test";

const componentPath = "components/page-layout/index.tsx";
const packagePath = "components/page-layout/package.json";
const tsconfigPath = "components/page-layout/tsconfig.json";
const docsPath = "apps/docs/content/docs/layout/page-layout.mdx";
const examplePaths = [
  "apps/docs/examples/page-layout.tsx",
  "apps/docs/examples/page-layout-equal-columns.tsx",
];

test("page-layout is packaged, documented, and registered", () => {
  for (const path of [
    componentPath,
    packagePath,
    tsconfigPath,
    docsPath,
    ...examplePaths,
  ]) {
    assert.ok(existsSync(path), `${path} should exist`);
  }

  const source = readFileSync(componentPath, "utf8");
  const packageJson = JSON.parse(readFileSync(packagePath, "utf8"));
  const docs = readFileSync(docsPath, "utf8");

  assert.match(source, /@container\/page-layout/);
  assert.match(source, /span: \{/);
  assert.match(source, /span: "full"/);
  assert.match(source, /@3xl\/page-layout:col-span-3/);
  assert.match(source, /@3xl\/page-layout:col-span-2/);
  assert.match(source, /@3xl\/page-layout:col-span-4/);

  assert.equal(packageJson.name, "@repo/page-layout");
  assert.equal(packageJson.private, true);
  assert.ok(packageJson.dependencies["class-variance-authority"]);

  assert.match(docs, /@thread-ui\/page-layout/);
});
