import { act, cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createInstance } from "i18next";
import { I18nextProvider } from "react-i18next";
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

it("removes selected options using the built-in ComboboxChip control", async () => {
  const i18n = createI18n();
  const onChange = vi.fn();
  render(
    <AppProvider i18n={i18n}>
      <DataFilter
        defaultValue={{
          query: "",
          filter: { tags: { $in: ["alpha", "beta"] } },
        }}
        filters={[
          {
            field: "tags",
            label: "Tags",
            type: "select",
            defaultOperator: "$in",
            options: [
              { label: "Alpha", value: "alpha" },
              { label: "Beta", value: "beta" },
            ],
          },
        ]}
        onChange={onChange}
      />
    </AppProvider>,
  );
  await userEvent.click(screen.getByRole("button", { name: /Tags/ }));
  const chip = screen.getByText("Alpha", {
    selector: '[data-slot="combobox-chip"]',
  });
  await userEvent.click(within(chip).getByRole("button"));
  expect(onChange).toHaveBeenLastCalledWith(
    expect.objectContaining({ filter: { tags: { $in: ["beta"] } } }),
  );
});

it.each([false, true])(
  "uses the inherited instance unless an explicit instance is provided (override=%s)",
  async (override) => {
    const outer = createI18n();
    const inner = createI18n();
    await inner.changeLanguage("en");
    const active = override ? inner : outer;
    render(
      <I18nextProvider i18n={outer}>
        <AppProvider i18n={override ? inner : undefined}>
          <ComplexFilter showClearAll filters={[]} />
        </AppProvider>
      </I18nextProvider>,
    );
    expect(
      screen.getByRole("button", { name: override ? "Clear all" : "清除全部" }),
    ).toBeTruthy();
    let result!: Promise<boolean>;
    act(() => {
      result = alertDialog({ title: "Continue?" });
    });
    expect(
      await screen.findByRole("button", {
        name: override ? "Confirm" : "确认",
      }),
    ).toBeTruthy();
    await act(() => active.changeLanguage(override ? "zh" : "en"));
    expect(
      screen.getByRole("button", { name: override ? "确认" : "Confirm" }),
    ).toBeTruthy();
    await userEvent.click(
      screen.getByRole("button", { name: override ? "取消" : "Cancel" }),
    );
    await expect(result).resolves.toBe(false);
    expect(
      screen.getByRole("button", { name: override ? "清除全部" : "Clear all" }),
    ).toBeTruthy();
    expect((override ? outer : inner).language).toBe(override ? "zh" : "en");
  },
);
