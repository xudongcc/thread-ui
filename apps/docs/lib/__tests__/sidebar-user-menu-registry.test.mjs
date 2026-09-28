import assert from "node:assert/strict";
import { resolve } from "node:path";
import process from "node:process";
import { test } from "node:test";
import { registryItemSchema } from "shadcn/schema";
import { getPackage } from "../package.ts";

test("standalone sidebar user menu installs its mobile hook and menu dependencies", async () => {
  const previousCwd = process.cwd();
  process.chdir(resolve(import.meta.dirname, "../.."));
  try {
    const item = registryItemSchema.parse(
      await getPackage("sidebar-user-menu"),
    );
    for (const dependency of [
      "button",
      "dropdown-menu",
      "avatar",
      "spinner",
      "use-mobile",
    ]) {
      assert.ok(
        item.registryDependencies.includes(dependency),
        `Missing ${dependency}`,
      );
    }
    assert.ok(
      item.files.some((file) =>
        file.content.includes('from "@/hooks/use-mobile"'),
      ),
    );
    assert.deepEqual(item.css, {});
    assert.equal(item.cssVars, undefined);
    assert.doesNotMatch(JSON.stringify(item), /Topbar|topbar|@repo\//);
  } finally {
    process.chdir(previousCwd);
  }
});
