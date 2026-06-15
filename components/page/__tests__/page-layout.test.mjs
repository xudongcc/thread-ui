import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { URL } from "node:url";

const source = readFileSync(new URL("../index.tsx", import.meta.url), "utf8");

const pageActionsSource =
  source.match(
    /export const PageActions[\s\S]*?export type PageContentProps/,
  )?.[0] ?? "";

assert.doesNotMatch(source, /export const PageSecondaryActions/);
assert.match(pageActionsSource, /Children\.toArray\(children\)/);
assert.match(pageActionsSource, /isPageSecondaryActionElement/);
assert.match(
  pageActionsSource,
  /\[&>\[data-slot=page-primary-action\]\]:order-last/,
);
assert.match(
  pageActionsSource,
  /\[&>\[data-slot=page-secondary-actions\]\]:order-10/,
);
assert.match(source, /hidden @3xl\/page:flex/);
assert.match(source, /@3xl\/page:hidden/);
assert.match(source, /<div className="@3xl\/page:hidden">\s*<DropdownMenu>/);
assert.match(
  pageActionsSource,
  /const inlineSecondaryActions =\s*secondaryActions\.length > 3\s*\?\s*secondaryActions\.slice\(0, 2\)\s*:\s*secondaryActions;/,
);
assert.match(
  pageActionsSource,
  /const overflowSecondaryActions =\s*secondaryActions\.length > 3\s*\?\s*secondaryActions\.slice\(2\)\s*:\s*\[\];/,
);
assert.match(pageActionsSource, /renderSecondaryMenuItems\(secondaryActions\)/);
assert.match(
  pageActionsSource,
  /renderSecondaryMenuItems\(overflowSecondaryActions\)/,
);
