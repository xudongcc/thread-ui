import { act, cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createInstance } from "i18next";
import { useState } from "react";
import { afterEach, beforeAll, expect, it, vi } from "vitest";
import en from "@repo/locales/en/thread-ui.json";
import zh from "@repo/locales/zh/thread-ui.json";
import { AppProvider } from "../index";
import { alertDialog } from "@/components/thread-ui/alert-dialog";
import { DataFilter } from "@/components/thread-ui/data-filter/data-filter";
import { ComplexFilter } from "@/components/thread-ui/complex-filter";

const createI18n = () => {
  const i18n = createInstance();
  void i18n.init({
    initAsync: false,
    lng: "zh",
    fallbackLng: "en",
    ns: ["thread-ui"],
    resources: {
      en: { "thread-ui": structuredClone(en) },
      zh: { "thread-ui": structuredClone(zh) },
    },
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

it("localizes an open confirmation and keeps explicit button text", async () => {
  const i18n = createI18n();
  render(<AppProvider i18n={i18n} />);
  let result!: Promise<boolean>;
  act(() => {
    result = alertDialog({ title: "Remove item?" });
  });
  expect(await screen.findByRole("button", { name: "取消" })).toBeTruthy();
  expect(screen.getByRole("button", { name: "确认" })).toBeTruthy();
  await act(() => i18n.changeLanguage("en"));
  expect(screen.getByRole("button", { name: "Cancel" })).toBeTruthy();
  await userEvent.click(screen.getByRole("button", { name: "Confirm" }));
  await expect(result).resolves.toBe(true);
  act(() => {
    result = alertDialog({
      title: "Remove another item?",
      cancelText: "Keep",
      confirmText: "Remove",
    });
  });
  expect(await screen.findByRole("button", { name: "Remove" })).toBeTruthy();
  await userEvent.click(screen.getByRole("button", { name: "Keep" }));
  await expect(result).resolves.toBe(false);
});

it.each(["empty", "error"])(
  "localizes async select loading and %s messages",
  async (outcome) => {
    let resolve!: (value: []) => void;
    let reject!: (reason: Error) => void;
    const options = vi.fn(
      () =>
        new Promise<[]>((success, failure) => {
          resolve = success;
          reject = failure;
        }),
    );
    render(
      <AppProvider i18n={createI18n()}>
        <DataFilter
          value={{ query: "", filter: { tags: { $in: ["selected"] } } }}
          filters={[
            {
              field: "tags",
              label: "Tags",
              type: "select",
              options,
              defaultOperator: "$in",
            },
          ]}
        />
      </AppProvider>,
    );
    await userEvent.click(screen.getByRole("button", { name: /Tags/ }));
    expect(await screen.findByText("加载中")).toBeTruthy();
    await act(async () => {
      if (outcome === "empty") resolve([]);
      else reject(new Error("Offline"));
    });
    expect(
      await screen.findByText(
        outcome === "empty" ? "没有找到选项" : "无法加载选项",
      ),
    ).toBeTruthy();
  },
);

const DraftInput = () => {
  const [draft, setDraft] = useState("");
  return (
    <input value={draft} onChange={(event) => setDraft(event.target.value)} />
  );
};

it("preserves form state and an open confirmation when the i18n instance changes", async () => {
  const chinese = createI18n();
  const english = createI18n();
  await english.changeLanguage("en");
  const view = (i18n: ReturnType<typeof createI18n>) => (
    <AppProvider i18n={i18n}>
      <DraftInput />
      <ComplexFilter showClearAll filters={[]} />
    </AppProvider>
  );
  const { rerender } = render(view(chinese));
  expect(screen.getByRole("button", { name: "清除全部" })).toBeTruthy();
  await userEvent.type(screen.getByRole("textbox"), "Unsaved draft");
  let result!: Promise<boolean>;
  act(() => {
    result = alertDialog({ title: "Continue?" });
  });
  expect(await screen.findByRole("button", { name: "确认" })).toBeTruthy();
  rerender(view(english));
  await userEvent.click(await screen.findByRole("button", { name: "Confirm" }));
  await expect(result).resolves.toBe(true);
  expect((screen.getByRole("textbox") as HTMLInputElement).value).toBe(
    "Unsaved draft",
  );
  expect(screen.getByRole("button", { name: "Clear all" })).toBeTruthy();
});
