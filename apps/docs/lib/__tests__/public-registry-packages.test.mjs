import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import process from "node:process";
import { test } from "node:test";

const root = process.cwd();

const registryPackages = [
  {
    name: "empty",
    repoDependencies: ["@repo/button"],
  },
  {
    name: "data-table",
    repoDependencies: ["@repo/empty"],
  },
  {
    name: "locales",
    packageDir: "locales",
    requiredFiles: ["package.json", "en/thread-ui.json", "zh/thread-ui.json"],
    repoDependencies: [],
  },
];

for (const registryPackage of registryPackages) {
  test(`${registryPackage.name} is available as a public registry package`, () => {
    const packageDir = join(
      root,
      registryPackage.packageDir ?? join("components", registryPackage.name),
    );
    const packagePath = join(packageDir, "package.json");
    const sourcePath = join(packageDir, "index.tsx");
    const tsconfigPath = join(packageDir, "tsconfig.json");

    assert.ok(
      existsSync(packagePath),
      `${registryPackage.name} needs ${registryPackage.packageDir ?? `components/${registryPackage.name}`}/package.json`,
    );

    if (registryPackage.requiredFiles) {
      for (const file of registryPackage.requiredFiles) {
        assert.ok(
          existsSync(join(packageDir, file)),
          `${registryPackage.name} needs ${file}`,
        );
      }
    } else {
      assert.ok(
        existsSync(sourcePath),
        `${registryPackage.name} needs components/${registryPackage.name}/index.tsx`,
      );
      assert.ok(
        existsSync(tsconfigPath),
        `${registryPackage.name} needs components/${registryPackage.name}/tsconfig.json`,
      );
    }

    const packageJson = JSON.parse(readFileSync(packagePath, "utf8"));

    assert.equal(packageJson.name, `@repo/${registryPackage.name}`);
    assert.equal(packageJson.private, true);

    if (existsSync(sourcePath)) {
      const source = readFileSync(sourcePath, "utf8");

      assert.doesNotMatch(source, /@\/components\/fabric-ui\//);
    }

    for (const dependency of registryPackage.repoDependencies) {
      assert.equal(
        packageJson.dependencies?.[dependency],
        "workspace:*",
        `${registryPackage.name} should declare ${dependency} so registry dependencies are emitted`,
      );
    }
  });
}
