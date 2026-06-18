import assert from "node:assert/strict";
import { resolve } from "node:path";
import process from "node:process";
import { pathToFileURL } from "node:url";
import { test } from "node:test";

const root = resolve(import.meta.dirname, "../../../..");
const docsDir = resolve(root, "apps/docs");
const packageModuleUrl = pathToFileURL(resolve(docsDir, "lib/package.ts")).href;
const { getPackage } = await import(packageModuleUrl);

test("public registry devDependencies do not include internal workspace packages", async () => {
  const previousCwd = process.cwd();
  process.chdir(docsDir);

  try {
    for (const packageName of ["data-filter", "data-table", "calendar"]) {
      const registryPackage = await getPackage(packageName);
      const internalDevDependencies =
        registryPackage.devDependencies?.filter((dependency) =>
          dependency.startsWith("@repo/"),
        ) ?? [];

      assert.deepEqual(
        internalDevDependencies,
        [],
        `${packageName} should not expose workspace devDependencies`,
      );
    }
  } finally {
    process.chdir(previousCwd);
  }
});

test("public registry dependencies keep package versions", async () => {
  const previousCwd = process.cwd();
  process.chdir(docsDir);

  try {
    const calendarPackage = await getPackage("calendar");

    assert.ok(
      calendarPackage.dependencies?.includes("react-day-picker@9.14.0"),
      "calendar should install the tested react-day-picker version",
    );
    assert.ok(
      !calendarPackage.dependencies?.includes("react-day-picker"),
      "calendar should not install react-day-picker as latest",
    );
  } finally {
    process.chdir(previousCwd);
  }
});
