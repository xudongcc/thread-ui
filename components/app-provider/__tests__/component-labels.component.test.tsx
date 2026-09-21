import { act, cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createInstance } from "i18next";
import { afterEach, beforeAll, expect, it, vi } from "vitest";
import en from "@repo/locales/en/thread-ui.json";
import zh from "@repo/locales/zh/thread-ui.json";
import { AppProvider } from "../index";
import { Button } from "@/components/thread-ui/button";
import {
  CodeBlock,
  CodeBlockCopyButton,
} from "@/components/thread-ui/code-block";
import {
  ComplexFilter,
  ComplexFilterType,
  defaultComplexFilterI18n,
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
  "localizes upload prompts and removal in preview=%s",
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
    expect(screen.getByRole("button", { name: "移除 photo.png" })).toBeTruthy();
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

it("preserves upload placeholders and copy button labels", () => {
  render(
    <AppProvider i18n={createI18n()}>
      <FileUpload placeholder="Upload a document" />
      <CodeBlockCopyButton aria-label="Copy snippet" />
    </AppProvider>,
  );
  expect(screen.getByText("Upload a document")).toBeTruthy();
  expect(screen.getByRole("button", { name: "Copy snippet" })).toBeTruthy();
});

it("localizes copy feedback without changing clipboard behavior", async () => {
  const user = userEvent.setup();
  const writeText = vi
    .spyOn(navigator.clipboard, "writeText")
    .mockResolvedValue();
  const i18n = createI18n();
  const onCopy = vi.fn();
  render(
    <AppProvider i18n={i18n}>
      <CodeBlock
        defaultValue="typescript"
        data={[
          { filename: "demo.ts", language: "typescript", code: "const n = 1;" },
        ]}
      >
        <CodeBlockCopyButton onCopy={onCopy} />
      </CodeBlock>
    </AppProvider>,
  );
  await user.click(screen.getByRole("button", { name: "复制代码" }));
  expect(writeText).toHaveBeenCalledWith("const n = 1;");
  expect(onCopy).toHaveBeenCalledOnce();
  expect(screen.getByRole("button", { name: "已复制" })).toBeTruthy();
  await act(() => i18n.changeLanguage("en"));
  expect(screen.getByRole("button", { name: "Copied" })).toBeTruthy();
});

it("keeps loading button names and localizes filter search status", async () => {
  const i18n = createI18n();
  render(
    <AppProvider i18n={i18n}>
      <Button loading>Save</Button>
      <DataFilterSearch loading />
    </AppProvider>,
  );
  expect(
    screen.getByRole("button", { name: "Save" }).getAttribute("aria-busy"),
  ).toBe("true");
  expect(screen.getAllByRole("status", { name: "加载中" })).toHaveLength(1);
  await act(() => i18n.changeLanguage("en"));
  expect(
    screen.getByRole("button", { name: "Save" }).getAttribute("aria-busy"),
  ).toBe("true");
  expect(screen.getAllByRole("status", { name: "Loading" })).toHaveLength(1);
});

it.each(["content", "footer"])(
  "localizes and closes the dialog using the %s button",
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
    expect(await screen.findByRole("button", { name: "关闭" })).toBeTruthy();
    await act(() => i18n.changeLanguage("en"));
    await userEvent.click(screen.getByRole("button", { name: "Close" }));
    expect(screen.queryByRole("dialog")).toBeNull();
  },
);

it("localizes toasts from a custom manager and preserves actions and dismissal", async () => {
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
  expect(await screen.findByRole("region", { name: "通知" })).toBeTruthy();
  await userEvent.hover(screen.getByRole("region", { name: "通知" }));
  expect(await screen.findByRole("button", { name: "关闭通知" })).toBeTruthy();
  await act(() => i18n.changeLanguage("en"));
  expect(screen.getByRole("region", { name: "Notifications" })).toBeTruthy();
  await userEvent.click(screen.getByRole("button", { name: "Undo" }));
  expect(onAction).toHaveBeenCalledOnce();
  await userEvent.click(screen.getByRole("button", { name: "Close toast" }));
  expect(screen.queryByRole("button", { name: "Close toast" })).toBeNull();
});

it("connects all ComplexFilter defaults to the provider and keeps explicit translations", async () => {
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
  expect(screen.getAllByRole("button", { name: "移除条件" })).toHaveLength(3);
  expect(screen.getByRole("button", { name: "移除分组" })).toBeTruthy();
  expect(screen.getByRole("button", { name: "且" })).toBeTruthy();
  expect(screen.getByRole("button", { name: "或" })).toBeTruthy();
  expect(screen.getByRole("button", { name: "清除全部" })).toBeTruthy();
  await act(() => i18n.changeLanguage("en"));
  expect(
    screen.getAllByRole("button", { name: "Remove condition" }),
  ).toHaveLength(3);
  expect(screen.getByRole("button", { name: "Clear all" })).toBeTruthy();
  rerender(
    <AppProvider i18n={i18n}>
      <ComplexFilter
        showClearAll
        filters={[]}
        i18n={{
          ...defaultComplexFilterI18n,
          clearAll: "Reset rules",
          addCondition: "New rule",
        }}
      />
    </AppProvider>,
  );
  expect(screen.getByRole("button", { name: "Reset rules" })).toBeTruthy();
  expect(screen.getAllByRole("button", { name: "New rule" })).toHaveLength(2);
});

it("uses English defaults when translation resources are missing", () => {
  render(
    <AppProvider i18n={createI18n(false)}>
      <FileUpload />
      <Button loading>Save</Button>
      <DataFilterSearch loading />
      <CodeBlockCopyButton />
      <ComplexFilter showClearAll filters={[]} />
    </AppProvider>,
  );
  expect(screen.getByText(en.fileUpload.placeholder)).toBeTruthy();
  expect(screen.getByRole("button", { name: "Copy code" })).toBeTruthy();
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

it("keeps a loading button accessible without an internationalization provider", async () => {
  const onClick = vi.fn();
  const { rerender } = render(
    <Button loading onClick={onClick}>
      Save
    </Button>,
  );
  const button = screen.getByRole("button", { name: "Save" });
  expect(button.getAttribute("aria-busy")).toBe("true");
  expect(button.hasAttribute("disabled")).toBe(true);
  await userEvent.click(button);
  expect(onClick).not.toHaveBeenCalled();
  rerender(<Button onClick={onClick}>Save</Button>);
  expect(button.hasAttribute("aria-busy")).toBe(false);
  expect(button.hasAttribute("disabled")).toBe(false);
  await userEvent.click(button);
  expect(onClick).toHaveBeenCalledOnce();
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
