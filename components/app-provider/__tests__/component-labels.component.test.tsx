import { act, cleanup, render, screen } from "@testing-library/react";
import { createInstance } from "i18next";
import { afterEach, beforeAll, expect, it, vi } from "vitest";
import en from "@repo/locales/en/thread-ui.json";
import zh from "@repo/locales/zh/thread-ui.json";
import { AppProvider } from "../index";
import {
  ComplexFilter,
  ComplexFilterType,
} from "@/components/thread-ui/complex-filter";
import { FileUpload } from "@/components/thread-ui/file-upload";

const createI18n = (resources = true) => {
  const i18n = createInstance();
  void i18n.init({
    initAsync: false,
    lng: "zh",
    fallbackLng: "en",
    ns: ["thread-ui"],
    interpolation: { escapeValue: false },
    resources: resources
      ? {
          en: { "thread-ui": structuredClone(en) },
          zh: { "thread-ui": structuredClone(zh) },
        }
      : {},
  });
  return i18n;
};

beforeAll(() => {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: vi.fn().mockImplementation((media: string) => ({
      matches: false,
      media,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })),
  });
});
afterEach(cleanup);

it("updates the upload prompt when the language changes", async () => {
  const i18n = createI18n();
  render(
    <AppProvider i18n={i18n}>
      <FileUpload />
    </AppProvider>,
  );
  expect(screen.getByText(zh.fileUpload.placeholder)).toBeTruthy();
  await act(() => i18n.changeLanguage("en"));
  expect(screen.getByText(en.fileUpload.placeholder)).toBeTruthy();
});

it("preserves explicit upload placeholders", () => {
  render(
    <AppProvider i18n={createI18n()}>
      <FileUpload placeholder="Upload a document" />
    </AppProvider>,
  );
  expect(screen.getByText("Upload a document")).toBeTruthy();
});

it("reads nested ComplexFilter labels and custom translations from the provider", async () => {
  const i18n = createI18n();
  const { rerender } = render(
    <AppProvider i18n={i18n}>
      <ComplexFilter
        showClearAll
        filters={[]}
        value={{ $and: [{}, { $or: [{}, {}] }] }}
      />
    </AppProvider>,
  );
  expect(screen.getAllByText("选择字段")).toHaveLength(3);
  expect(screen.getAllByText("选择操作符")).toHaveLength(3);
  expect(screen.getByRole("button", { name: "且" })).toBeTruthy();
  expect(screen.getByRole("button", { name: "或" })).toBeTruthy();
  expect(screen.getByRole("button", { name: "清除全部" })).toBeTruthy();
  await act(() => i18n.changeLanguage("en"));
  expect(screen.getByRole("button", { name: "Clear all" })).toBeTruthy();
  i18n.addResourceBundle(
    "en",
    "thread-ui",
    {
      complexFilter: { clearAll: "Reset rules", addCondition: "New rule" },
    },
    true,
    true,
  );
  rerender(
    <AppProvider i18n={i18n}>
      <ComplexFilter showClearAll filters={[]} />
    </AppProvider>,
  );
  expect(screen.getByRole("button", { name: "Reset rules" })).toBeTruthy();
  expect(screen.getAllByRole("button", { name: "New rule" })).toHaveLength(2);
});

it("uses English defaults when translation resources are missing", () => {
  render(
    <AppProvider i18n={createI18n(false)}>
      <FileUpload />
      <ComplexFilter showClearAll filters={[]} />
    </AppProvider>,
  );
  expect(screen.getByText(en.fileUpload.placeholder)).toBeTruthy();
  expect(screen.getByRole("button", { name: "Clear all" })).toBeTruthy();
});

it("ships matching English and Chinese translation keys", () => {
  const keys = (value: object, prefix = ""): string[] =>
    Object.entries(value).flatMap(([key, child]) => {
      const name = `${prefix}${key}`;
      return child && typeof child === "object" && !Array.isArray(child)
        ? keys(child, `${name}.`)
        : [name];
    });
  expect(keys(zh).sort()).toEqual(keys(en).sort());
});

it("updates ComplexFilter operator labels when the language changes", async () => {
  const i18n = createI18n();
  render(
    <AppProvider i18n={i18n}>
      <ComplexFilter
        value={{ $and: [{ name: { $eq: "Joe" } }] }}
        filters={[
          {
            field: "name",
            label: "Name",
            type: ComplexFilterType.STRING,
            render: () => null,
          },
        ]}
      />
    </AppProvider>,
  );
  expect(screen.getByText("等于")).toBeTruthy();
  await act(() => i18n.changeLanguage("en"));
  expect(screen.getByText("Equals")).toBeTruthy();
});
