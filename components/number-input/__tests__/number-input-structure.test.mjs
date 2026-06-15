import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "../../..");

const componentPath = resolve(root, "components/number-input/index.tsx");
const packagePath = resolve(root, "components/number-input/package.json");
const docsPath = resolve(root, "apps/docs/content/docs/form/number-input.mdx");
const examplePath = resolve(root, "apps/docs/examples/number-input.tsx");

for (const path of [componentPath, packagePath, docsPath, examplePath]) {
  assert.ok(existsSync(path), `${path} should exist`);
}

const source = readFileSync(componentPath, "utf8");
const docs = readFileSync(docsPath, "utf8");

assert.match(source, /NumericFormat/);
assert.match(source, /customInput=\{Input\}/);
assert.match(source, /export type NumberInputProps/);
assert.match(source, /export \{ NumberInput \}/);
assert.match(docs, /<Preview path="number-input" \/>/);
