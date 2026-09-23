import assert from "node:assert/strict";
import { resolve } from "node:path";
import process from "node:process";
import { test } from "node:test";
import { registryItemSchema } from "shadcn/schema";
import { getPackage } from "../package.ts";

test("installed Topbar includes semantic theme tokens and scoped appearance overrides", async () => {
  const previousCwd = process.cwd();
  process.chdir(resolve(import.meta.dirname, "../.."));
  try {
    const item = registryItemSchema.parse(await getPackage("topbar"));
    const rules = item.css["@layer base"];
    const theme = item.css["@theme inline"];
    const variablesFor = (selector) =>
      Object.entries(rules).find(([selectors]) =>
        selectors
          .split(",")
          .map((value) => value.trim())
          .includes(selector),
      )?.[1];
    const light = variablesFor(":root");
    const dark = variablesFor(".dark");
    for (const part of [
      "",
      "-foreground",
      "-accent",
      "-accent-foreground",
      "-border",
      "-ring",
      "-menu-accent",
      "-menu-border",
    ]) {
      const name = `topbar${part}`;
      assert.ok(light[`--${name}`], `Missing light ${name} in installed CSS`);
      assert.ok(dark[`--${name}`], `Missing dark ${name} in installed CSS`);
      assert.equal(theme[`--color-${name}`], `var(--${name})`);
    }
    assert.notEqual(light["--topbar"], dark["--topbar"]);
    assert.deepEqual(
      variablesFor('[data-slot="topbar"][data-variant="light"]'),
      light,
    );
    assert.deepEqual(
      variablesFor('[data-slot="topbar"][data-variant="dark"]'),
      dark,
    );
  } finally {
    process.chdir(previousCwd);
  }
});
