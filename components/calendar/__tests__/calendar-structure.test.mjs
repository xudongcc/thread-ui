import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";

const read = (path) => readFileSync(path, "utf8");

const componentPath = "components/calendar/index.tsx";
const packagePath = "components/calendar/package.json";
const tsconfigPath = "components/calendar/tsconfig.json";
const docsPath = "apps/docs/content/docs/form/calendar.mdx";
const examplePath = "apps/docs/examples/calendar.tsx";

for (const path of [
  componentPath,
  packagePath,
  tsconfigPath,
  docsPath,
  examplePath,
]) {
  assert.ok(existsSync(path), `${path} should exist`);
}

const source = read(componentPath);
const packageJson = JSON.parse(read(packagePath));
const docs = read(docsPath);
const example = read(examplePath);

assert.match(source, /^"use client";/);
assert.ok(source.includes("Calendar as ShadcnCalendar"));
assert.ok(source.includes("useThreadUITranslation"));
assert.ok(source.includes("useMemo"));
assert.ok(source.includes("buildDayPickerLocale"));
assert.ok(source.includes("ComponentProps<typeof ShadcnCalendar>"));
assert.ok(source.includes('Omit<T, "locale">'));
assert.ok(!source.includes("react-day-picker/locale"));
assert.ok(source.includes("locale: calendarLocale"));
assert.ok(source.includes("<ShadcnCalendar {...calendarProps} />"));
assert.ok(!source.includes("locale?:"));

assert.equal(packageJson.name, "@repo/calendar");
assert.equal(packageJson.private, true);
assert.equal(packageJson.dependencies["@repo/app-provider"], "workspace:*");
assert.ok(packageJson.dependencies["react-day-picker"]);
assert.ok(packageJson.dependencies.react);
assert.ok(packageJson.dependencies["react-dom"]);

assert.ok(docs.includes("pnpm dlx shadcn@latest add @thread-ui/calendar"));
assert.ok(docs.includes("AppProvider"));
assert.ok(!docs.includes("'locale'"));
assert.ok(example.includes('from "@/components/thread-ui/calendar"'));
