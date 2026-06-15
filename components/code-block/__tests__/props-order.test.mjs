import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { URL } from "node:url";

const source = readFileSync(new URL("../index.tsx", import.meta.url), "utf8");

assert.match(
  source,
  /<Select\s+\{\.\.\.props\}\s+value=\{value\}\s+onValueChange=\{\(value\) => \{/,
);
assert.match(
  source,
  /<Button\s+\{\.\.\.props\}\s+className=\{cn\("shrink-0", className\)\}\s+size="icon"\s+variant="ghost"\s+onClick=\{copyToClipboard\}/,
);
assert.match(
  source,
  /return <div \{\.\.\.props\} dangerouslySetInnerHTML=\{\{ __html: html \}\} \/>;/,
);
