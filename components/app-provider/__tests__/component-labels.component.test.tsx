import { act, cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createInstance } from "i18next";
import { afterEach, beforeAll, expect, it, vi } from "vitest";
import en from "@repo/locales/en/thread-ui.json";
import zh from "@repo/locales/zh/thread-ui.json";
import { AppProvider } from "../index";
import {
  ComplexFilter,
  ComplexFilterType,
} from "@/components/thread-ui/complex-filter";
import { DataFilterSearch } from "@/components/thread-ui/data-filter/components/data-filter-search";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogTitle,
} from "@/components/thread-ui/dialog";
import {
  FileUpload,
  FileUploadPreview,
} from "@/components/thread-ui/file-upload";
import { createToastManager } from "@/components/ui/toast";
import { toast } from "@/components/thread-ui/toast";

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
  Object.defineProperty(URL, "createObjectURL", {
    configurable: true,
    value: vi.fn(() => "blob:preview"),
  });
  Object.defineProperty(URL, "revokeObjectURL", {
    configurable: true,
    value: vi.fn(),
  });
});
afterEach(cleanup);

it.each([false, true])(
  "localizes upload prompts and preserves removal in preview=%s",
  async (preview) => {
    const i18n = createI18n();
    const onChange = vi.fn();
    const file = new File(["image"], "photo.png", { type: "image/png" });
    render(
      <AppProvider i18n={i18n}>
        <FileUpload defaultValue={[file]} onChange={onChange}>
          {preview ? <FileUploadPreview /> : undefined}
        </FileUpload>
      </AppProvider>,
    );
    if (preview) await screen.findByRole("img", { name: file.name });
    else expect(screen.getByText(zh.fileUpload.placeholder)).toBeTruthy();
    expect(
      screen.getByRole("button", { name: "Remove photo.png" }),
    ).toBeTruthy();
    await act(() => i18n.changeLanguage("en"));
    if (!preview)
      expect(screen.getByText(en.fileUpload.placeholder)).toBeTruthy();
    await userEvent.click(
      screen.getByRole("button", { name: "Remove photo.png" }),
    );
    expect(onChange).toHaveBeenCalledWith([]);
    expect(
      screen.queryByRole("button", { name: "Remove photo.png" }),
    ).toBeNull();
  },
);

it("preserves explicit upload placeholders", () => {
  render(
    <AppProvider i18n={createI18n()}>
      <FileUpload placeholder="Upload a document" />
    </AppProvider>,
  );
  expect(screen.getByText("Upload a document")).toBeTruthy();
});

it.each(["content", "footer"])(
  "closes the dialog using the built-in %s button",
  async (button) => {
    const i18n = createI18n();
    render(
      <AppProvider i18n={i18n}>
        <Dialog defaultOpen>
          <DialogContent showCloseButton={button === "content"}>
            <DialogTitle>Details</DialogTitle>
            <DialogFooter showCloseButton={button === "footer"} />
          </DialogContent>
        </Dialog>
      </AppProvider>,
    );
    await userEvent.click(await screen.findByRole("button", { name: "Close" }));
    expect(screen.queryByRole("dialog")).toBeNull();
  },
);

it("preserves custom toast manager actions and dismissal", async () => {
  const i18n = createI18n();
  const manager = createToastManager();
  const onAction = vi.fn();
  render(
    <AppProvider i18n={i18n} toast={{ toastManager: manager, timeout: 0 }} />,
  );
  act(() => {
    manager.add({
      title: "Saved",
      type: "success",
      actionProps: { children: "Undo", onClick: onAction },
    });
  });
  await userEvent.hover(
    await screen.findByRole("region", { name: "Notifications" }),
  );
  expect(
    await screen.findByRole("button", { name: "Close toast" }),
  ).toBeTruthy();
  await userEvent.click(screen.getByRole("button", { name: "Undo" }));
  expect(onAction).toHaveBeenCalledOnce();
  await userEvent.click(screen.getByRole("button", { name: "Close toast" }));
  expect(screen.queryByRole("button", { name: "Close toast" })).toBeNull();
});

it("reads all ComplexFilter labels and custom translations from the provider", async () => {
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
      <DataFilterSearch loading />
      <ComplexFilter showClearAll filters={[]} />
    </AppProvider>,
  );
  expect(screen.getByText(en.fileUpload.placeholder)).toBeTruthy();
  expect(screen.getByRole("button", { name: "Clear all" })).toBeTruthy();
  expect(screen.getByRole("status", { name: "Loading" })).toBeTruthy();
  expect(screen.getByRole("region", { name: "Notifications" })).toBeTruthy();
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

it("renders and updates notifications through the exported default toast manager", async () => {
  render(<AppProvider i18n={createI18n()} toast={{ timeout: 0 }} />);
  let id!: string;
  act(() => {
    id = toast.add({ title: "Saving", type: "loading" });
  });
  expect(await screen.findByRole("heading", { name: "Saving" })).toBeTruthy();
  act(() => {
    toast.update(id, {
      title: "Saved",
      description: "Changes stored",
      type: "success",
    });
  });
  expect(await screen.findByRole("heading", { name: "Saved" })).toBeTruthy();
  expect(screen.getByText("Changes stored")).toBeTruthy();
  act(() => {
    toast.close(id);
  });
  expect(screen.queryByRole("heading", { name: "Saved" })).toBeNull();
});
