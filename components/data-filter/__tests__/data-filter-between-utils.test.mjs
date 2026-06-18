/* eslint-disable import/no-commonjs, import/newline-after-import */

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const ts = require("typescript");
const root = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const moduleCache = new Map();

const loadTsModule = (relativePath) => {
  const filePath = resolve(root, relativePath);
  const cached = moduleCache.get(filePath);

  if (cached) {
    return cached.exports;
  }

  const module = { exports: {} };
  moduleCache.set(filePath, module);

  const source = readFileSync(filePath, "utf8");
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: {
      esModuleInterop: true,
      jsx: ts.JsxEmit.ReactJSX,
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
    },
    fileName: filePath,
  });

  const localRequire = (specifier) => {
    if (specifier.startsWith(".")) {
      return loadTsModule(resolve(dirname(filePath), `${specifier}.ts`));
    }

    return require(specifier);
  };

  const script = new vm.Script(outputText, { filename: filePath });
  script.runInNewContext({
    exports: module.exports,
    module,
    require: localRequire,
  });

  return module.exports;
};

const { createDataFilterCondition } = loadTsModule(
  "components/data-filter/utils/create-data-filter-condition.ts",
);
const { cleanDataFilterValues } = loadTsModule(
  "components/data-filter/utils/clean-data-filter-values.ts",
);
const { getDataFilterBetweenValue } = loadTsModule(
  "components/data-filter/utils/get-data-filter-between-value.ts",
);
const { getDataFilterCondition } = loadTsModule(
  "components/data-filter/utils/get-data-filter-condition.ts",
);
const { isEmptyDataFilterValue } = loadTsModule(
  "components/data-filter/utils/is-empty-data-filter-value.ts",
);
const normalize = (value) => JSON.parse(JSON.stringify(value));

assert.deepEqual(normalize(createDataFilterCondition("$between", [1, 3])), {
  $between: [1, 3],
});

assert.deepEqual(normalize(getDataFilterCondition({ $between: [1, 3] })), {
  operator: "$between",
  value: [1, 3],
});

assert.deepEqual(
  normalize(getDataFilterBetweenValue({ $gte: 1, $lte: 3 })),
  [1, 3],
);
assert.deepEqual(
  normalize(getDataFilterBetweenValue({ $between: [1, 3] })),
  [1, 3],
);

assert.equal(isEmptyDataFilterValue({ $between: [1, 3] }), false);
assert.equal(isEmptyDataFilterValue({ $between: [1, undefined] }), true);
assert.equal(isEmptyDataFilterValue({ $between: [undefined, 3] }), true);
assert.equal(
  isEmptyDataFilterValue({ $between: [undefined, undefined] }),
  true,
);

assert.deepEqual(
  normalize(
    cleanDataFilterValues({
      age: { $gte: 18, $lte: 30 },
      amount: { $between: [100, undefined] },
      status: { $eq: "active" },
    }),
  ),
  {
    age: { $between: [18, 30] },
    status: { $eq: "active" },
  },
);
