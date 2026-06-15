import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { URL } from "node:url";

const source = readFileSync(new URL("../content.tsx", import.meta.url), "utf8");

assert.doesNotMatch(source, /\b(?:defaultSize|minSize|maxSize)=\{\d+\}/);
assert.match(source, /defaultSize="100%"/);
assert.match(source, /minSize="40%"/);
assert.match(source, /defaultSize="0%"/);
assert.match(source, /maxSize="70%"/);
