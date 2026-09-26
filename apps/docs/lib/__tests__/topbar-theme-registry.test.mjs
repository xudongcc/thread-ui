import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import process from "node:process";
import { test } from "node:test";
import postcss from "postcss";
import { registryItemSchema } from "shadcn/schema";
import { getPackage } from "../package.ts";

test("Topbar installs scoped existing theme variables without overriding the global theme", async () => {
  const previousCwd = process.cwd();
  process.chdir(resolve(import.meta.dirname, "../.."));
  try {
    const item = registryItemSchema.parse(await getPackage("topbar"));
    const theme = postcss.parse(
      await readFile(
        resolve(process.cwd(), "../../themes/default-theme/default.css"),
        "utf8",
      ),
    );
    for (const [variant, selector] of [
      ["light", ":root"],
      ["dark", ".dark"],
    ]) {
      const expected = {};
      theme.walkRules((rule) => {
        if (rule.selectors.includes(selector))
          rule.walkDecls((decl) => {
            expected[decl.prop] = decl.value;
          });
      });
      delete expected["--radius"];
      assert.ok(expected["--background"]);
      assert.deepEqual(
        item.css[`[data-slot="topbar"][data-variant="${variant}"]`],
        expected,
      );
    }
    assert.deepEqual(Object.keys(item.css).sort(), [
      '[data-slot="topbar"][data-variant="dark"]',
      '[data-slot="topbar"][data-variant="light"]',
    ]);
    assert.deepEqual(item.cssVars, {
      theme: { "color-topbar": "var(--topbar)" },
      light: { topbar: "oklch(1 0 0)" },
      dark: { topbar: "oklch(0.205 0 0)" },
    });
    assert.deepEqual((await getPackage("layout")).css, {});
  } finally {
    process.chdir(previousCwd);
  }
});
