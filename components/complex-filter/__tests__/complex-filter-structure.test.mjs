import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "../../..");

const componentPath = resolve(root, "components/complex-filter/index.tsx");
const packagePath = resolve(root, "components/complex-filter/package.json");
const docsPath = resolve(
  root,
  "apps/docs/content/docs/form/complex-filter.mdx",
);
const examplePath = resolve(root, "apps/docs/examples/complex-filter.tsx");
const emptyExamplePath = resolve(
  root,
  "apps/docs/examples/complex-filter-empty.tsx",
);

for (const path of [
  componentPath,
  packagePath,
  docsPath,
  examplePath,
  emptyExamplePath,
]) {
  assert.ok(existsSync(path), `${path} should exist`);
}

const source = readFileSync(componentPath, "utf8");
const docs = readFileSync(docsPath, "utf8");
const example = readFileSync(examplePath, "utf8");
const emptyExample = readFileSync(emptyExamplePath, "utf8");

assert.match(source, /export enum ComplexFilterType/);
assert.match(source, /export enum ComplexFilterLogical/);
assert.match(source, /export interface ComplexFilterItem/);
assert.match(source, /export interface ComplexFilterProps/);
assert.match(source, /export const ComplexFilter/);
assert.doesNotMatch(source, /\basChild\b/);
assert.match(docs, /<Preview path="complex-filter" \/>/);
assert.match(example, /ComplexFilterType\.STRING/);
assert.match(example, /ComplexFilterType\.NUMBER/);
assert.match(example, /ComplexFilterType\.DATE/);
for (const previewExample of [example, emptyExample]) {
  assert.match(previewExample, /max-h-full/);
  assert.match(previewExample, /w-full/);
  assert.match(previewExample, /overflow-y-auto/);
}
