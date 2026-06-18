import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "../../../..");
const packageSource = readFileSync(
  resolve(root, "apps/docs/lib/package.ts"),
  "utf8",
);

assert.match(packageSource, /file\.endsWith\("\.json"\)/);
assert.match(packageSource, /packageName === "locales"/);
assert.match(packageSource, /isLocalesPackage \|\| fileName\.startsWith/);
assert.match(
  packageSource,
  /type: isLocaleResource \? "registry:file" : "registry:ui"/,
);
assert.ok(packageSource.includes("`~/public/locales/${fileName}`"));
assert.ok(packageSource.includes("`~/public/${fileName}`"));
assert.match(
  packageSource,
  /type: RegistryItem\["type"\] = isLocalesPackage\s+\?\s+"registry:item"/,
);
assert.ok(
  packageSource.includes("`components/thread-ui/${packageName}/${fileName}`"),
);
