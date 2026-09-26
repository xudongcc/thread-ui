import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import process from "node:process";
import { pathToFileURL } from "node:url";
import { test } from "node:test";

const root = resolve(import.meta.dirname, "../../../..");
const docsDir = resolve(root, "apps/docs");
const packageModuleUrl = pathToFileURL(resolve(docsDir, "lib/package.ts")).href;
const { getPackage, getPackageNames } = await import(packageModuleUrl);

test("public registry packages exclude internal dependencies and test tooling", async () => {
  const previousCwd = process.cwd();
  process.chdir(docsDir);

  try {
    const packageNames = await getPackageNames();

    for (const packageName of [...packageNames, "locales"]) {
      const registryPackage = await getPackage(packageName);
      const excludedDependencies = registryPackage.devDependencies?.filter(
        (dependency) =>
          /^(@repo\/|@testing-library\/|@vitejs\/plugin-react@|vitest@|jsdom@|typescript@|@types\/react(?:-dom)?@)/.test(
            dependency,
          ),
      );
      assert.deepEqual(
        excludedDependencies,
        [],
        `${packageName} should not expose internal dependencies or test tooling`,
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
    const calendarManifest = JSON.parse(
      await readFile(resolve(root, "components/calendar/package.json"), "utf8"),
    );

    assert.ok(
      calendarPackage.dependencies?.includes(
        `react-day-picker@${calendarManifest.dependencies["react-day-picker"]}`,
      ),
      "calendar should install the tested react-day-picker version",
    );
    assert.ok(
      !calendarPackage.dependencies?.includes("react-day-picker"),
      "calendar should not install react-day-picker as latest",
    );

    const dataFilterPackage = await getPackage("data-filter");
    assert.ok(
      dataFilterPackage.devDependencies?.includes("@types/lodash-es@^4.17.12"),
      "data-filter source needs lodash-es types in consuming TypeScript apps",
    );
    assert.ok(
      calendarPackage.devDependencies?.includes(
        `i18next@${calendarManifest.devDependencies.i18next}`,
      ),
      "development dependencies outside the blocklist should keep their versions",
    );

    const pagePackage = await getPackage("page");
    assert.ok(
      pagePackage.registryDependencies?.includes(
        "https://thread-ui.vercel.app/r/common.json",
      ),
      "page should still install its shared types",
    );
  } finally {
    process.chdir(previousCwd);
  }
});

test("public registry files do not include internal package metadata", async () => {
  const previousCwd = process.cwd();
  process.chdir(docsDir);

  try {
    for (const packageName of ["data-filter", "data-table", "calendar"]) {
      const registryPackage = await getPackage(packageName);
      const filePaths = registryPackage.files?.map((file) => file.path) ?? [];

      assert.ok(
        !filePaths.includes("package.json"),
        `${packageName} should not install package.json into consuming apps`,
      );
      assert.ok(
        !filePaths.includes("tsconfig.json"),
        `${packageName} should not install tsconfig.json into consuming apps`,
      );
    }
  } finally {
    process.chdir(previousCwd);
  }
});
