import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "../../..");

const componentPath = resolve(root, "components/app-provider/index.tsx");
const localePath = resolve(root, "locales/en/thread-ui.json");
const zhLocalePath = resolve(root, "locales/zh/thread-ui.json");
const localesPackagePath = resolve(root, "locales/package.json");
const packagePath = resolve(root, "components/app-provider/package.json");
const tsconfigPath = resolve(root, "components/app-provider/tsconfig.json");

for (const path of [
  componentPath,
  localePath,
  zhLocalePath,
  localesPackagePath,
  packagePath,
  tsconfigPath,
]) {
  assert.ok(existsSync(path), `${path} should exist`);
}

const source = readFileSync(componentPath, "utf8");
const locale = JSON.parse(readFileSync(localePath, "utf8"));
const zhLocale = JSON.parse(readFileSync(zhLocalePath, "utf8"));
const localesPackageJson = JSON.parse(readFileSync(localesPackagePath, "utf8"));
const packageJson = JSON.parse(readFileSync(packagePath, "utf8"));

assert.match(source, /^"use client";/);
assert.match(source, /export type AppProviderProps/);
assert.match(source, /export const useThreadUITranslation/);
assert.doesNotMatch(source, /export const useThreadTranslation/);
assert.match(source, /export const AppProvider/);
assert.match(source, /I18nextProvider/);
assert.match(source, /AlertDialogProvider/);
assert.match(source, /ToastProvider/);
assert.match(source, /i18n: I18nInstance/);
assert.match(source, /toast\?: ToastProviderProps/);
assert.match(source, /useTranslation\("thread-ui"\)/);
assert.match(source, /<I18nextProvider i18n=\{i18n\}>/);
assert.match(source, /<ToastProvider \{\.\.\.toast\}>/);

assert.equal(locale.dataFilter.addFilter, "Add Filter");
assert.equal(locale.dataFilter.minimumAriaLabel, "{{label}} minimum");
assert.equal(locale.calendar.code, "en-US");
assert.equal(locale.calendar.months.wide[0], "January");
assert.equal(zhLocale.dataFilter.addFilter, "添加筛选");
assert.equal(zhLocale.dataFilter.operators.$between, "介于");
assert.equal(zhLocale.calendar.code, "zh");
assert.equal(zhLocale.calendar.weekdays.short[0], "日");

assert.equal(packageJson.name, "@repo/app-provider");
assert.equal(packageJson.private, true);
assert.equal(packageJson.dependencies["@repo/alert-dialog"], "workspace:*");
assert.equal(packageJson.dependencies["@repo/locales"], "workspace:*");
assert.equal(packageJson.dependencies["@repo/toast"], "workspace:*");
assert.ok(packageJson.dependencies.i18next);
assert.ok(packageJson.dependencies["react-i18next"]);
assert.ok(packageJson.dependencies.react);
assert.ok(packageJson.dependencies["react-dom"]);

assert.equal(localesPackageJson.name, "@repo/locales");
assert.equal(localesPackageJson.private, true);
assert.equal(
  localesPackageJson.exports["./en/thread-ui.json"],
  "./en/thread-ui.json",
);
assert.equal(
  localesPackageJson.exports["./zh/thread-ui.json"],
  "./zh/thread-ui.json",
);
