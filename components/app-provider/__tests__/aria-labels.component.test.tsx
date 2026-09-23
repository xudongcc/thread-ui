import { act, cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createInstance } from "i18next";
import { I18nextProvider } from "react-i18next";
import { afterEach, describe, expect, it, vi } from "vitest";

import en from "@repo/locales/en/thread-ui.json";
import zh from "@repo/locales/zh/thread-ui.json";
import { DataFilterDefaultInputField } from "../../data-filter/components/data-filter-default-input-field";
import { DataFilterDefaultNumberInputField } from "../../data-filter/components/data-filter-default-number-input-field";
import { DataFilterSearch } from "../../data-filter/components/data-filter-search";
import { DataFilterSort } from "../../data-filter/components/data-filter-sort";
import { DataFilter } from "../../data-filter/data-filter";
import type { ReactNode } from "react";
import {
  CodeBlockCopyButton,
  CodeBlockSelect,
  CodeBlockSelectTrigger,
} from "@/components/thread-ui/code-block";
import { ComplexFilter } from "@/components/thread-ui/complex-filter";
import { FileUploadItem } from "@/components/thread-ui/file-upload";
import {
  BreadcrumbAction,
  BreadcrumbActions,
  PageActions,
  PageNextAction,
  PagePagination,
  PagePreviousAction,
  PageSecondaryAction,
} from "@/components/thread-ui/page";
import { Select } from "@/components/thread-ui/select";

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

const renderLocalized = (children: ReactNode, language = "en") => {
  const i18n = createInstance();
  void i18n.init({
    initAsync: false,
    lng: language,
    fallbackLng: "en",
    resources: {
      en: { "thread-ui": structuredClone(en) },
      zh: { "thread-ui": structuredClone(zh) },
    },
  });
  render(<I18nextProvider i18n={i18n}>{children}</I18nextProvider>);
  return i18n;
};

describe("accessible labels", () => {
  it("updates built-in labels and preserves filenames with default i18next escaping", async () => {
    vi.stubGlobal(
      "URL",
      class extends URL {
        static createObjectURL = vi.fn(() => "blob:preview");
        static revokeObjectURL = vi.fn();
      },
    );
    const file = new File(["image"], 'A&B "<report>".png', {
      type: "image/png",
    });
    const i18n = renderLocalized(
      <>
        <BreadcrumbActions>
          <BreadcrumbAction>Home</BreadcrumbAction>
          <BreadcrumbAction>Projects</BreadcrumbAction>
        </BreadcrumbActions>
        <PageActions>
          {[1, 2, 3, 4].map((key) => (
            <PageSecondaryAction key={key}>Action {key}</PageSecondaryAction>
          ))}
        </PageActions>
        <PagePagination>
          <PagePreviousAction />
          <PageNextAction />
        </PagePagination>
        <CodeBlockCopyButton />
        <CodeBlockSelect>
          <CodeBlockSelectTrigger />
        </CodeBlockSelect>
        <DataFilterSearch />
        <DataFilterSort options={[]} />
        <FileUploadItem file={file} />
      </>,
    );

    expect(await screen.findByRole("img", { name: file.name })).toBeTruthy();
    expect(i18n.options.interpolation?.escapeValue).toBe(true);
    expect(screen.getByRole("button", { name: "Parent pages" })).toBeTruthy();
    expect(screen.getByRole("group", { name: "Item navigation" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Previous item" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Next item" })).toBeTruthy();
    expect(
      screen.getByRole("navigation", { name: "Breadcrumbs" }),
    ).toBeTruthy();
    expect(
      screen.getAllByRole("button", { name: "More actions" }),
    ).toHaveLength(2);
    expect(screen.getByRole("button", { name: "Copy code" })).toBeTruthy();
    expect(
      screen.getByRole("combobox", { name: "Select code language" }),
    ).toBeTruthy();
    expect(screen.getByRole("textbox", { name: "Search" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Sort" })).toBeTruthy();
    expect(
      screen.getByRole("button", { name: `Remove ${file.name}` }),
    ).toBeTruthy();

    await act(() => i18n.changeLanguage("zh"));

    expect(screen.getByRole("button", { name: "上级页面" })).toBeTruthy();
    expect(screen.getByRole("group", { name: "项目导航" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "上一项" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "下一项" })).toBeTruthy();
    expect(screen.getByRole("navigation", { name: "面包屑导航" })).toBeTruthy();
    expect(screen.getAllByRole("button", { name: "更多操作" })).toHaveLength(2);
    expect(screen.getByRole("button", { name: "复制代码" })).toBeTruthy();
    expect(screen.getByRole("combobox", { name: "选择代码语言" })).toBeTruthy();
    expect(screen.getByRole("textbox", { name: "搜索" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "排序" })).toBeTruthy();
    expect(
      screen.getByRole("button", { name: `移除 ${file.name}` }),
    ).toBeTruthy();
  });

  it("preserves explicit labels and visible button text", () => {
    renderLocalized(
      <>
        <BreadcrumbActions>
          <BreadcrumbAction aria-label="Return to settings">
            Settings
          </BreadcrumbAction>
        </BreadcrumbActions>
        <BreadcrumbActions>
          <BreadcrumbAction>Previous step</BreadcrumbAction>
        </BreadcrumbActions>
        <PageActions secondaryMenuLabel="Document actions">
          <PageSecondaryAction>Archive</PageSecondaryAction>
        </PageActions>
        <CodeBlockCopyButton aria-label="Copy snippet" />
        <CodeBlockCopyButton>Copy example</CodeBlockCopyButton>
        <CodeBlockSelect>
          <CodeBlockSelectTrigger aria-label="Choose a file" />
        </CodeBlockSelect>
        <DataFilterSearch aria-label="Search orders" />
      </>,
      "zh",
    );

    for (const name of [
      "Return to settings",
      "Document actions",
      "Copy snippet",
      "Copy example",
    ]) {
      expect(screen.getByRole("button", { name })).toBeTruthy();
    }
    expect(screen.getByRole("button", { name: "Previous step" })).toBeTruthy();
    expect(
      screen.getByRole("combobox", { name: "Choose a file" }),
    ).toBeTruthy();
    expect(screen.getByRole("textbox", { name: "Search orders" })).toBeTruthy();
  });

  it("names text and single-value number filters after their field", () => {
    renderLocalized(
      <>
        <DataFilterDefaultInputField
          item={{ field: "name", label: "名称", type: "input" }}
          onChange={() => {}}
        />
        <DataFilterDefaultNumberInputField
          item={{ field: "amount", label: "金额", type: "number-input" }}
          operator="$eq"
          value={10}
          onChange={() => {}}
        />
      </>,
      "zh",
    );
    expect(screen.getByRole("textbox", { name: "名称" })).toBeTruthy();
    expect(screen.getByRole("textbox", { name: "金额" })).toBeTruthy();
  });

  it("names the multiselect input and sort field group", async () => {
    const user = userEvent.setup();
    renderLocalized(
      <DataFilter
        value={{ query: "", filter: { status: { $in: ["active"] } } }}
        filters={[
          {
            field: "status",
            label: "状态",
            type: "select",
            options: [{ value: "active", label: "启用" }],
          },
        ]}
        sort={{
          options: [
            {
              field: "name",
              fieldLabel: "名称",
              direction: "ASC",
              directionLabel: "升序",
            },
          ],
        }}
      />,
      "zh",
    );
    await user.click(screen.getByRole("button", { name: "排序" }));
    expect(screen.getByRole("radiogroup", { name: "排序字段" })).toBeTruthy();
    await user.keyboard("{Escape}");
    await user.click(screen.getByRole("button", { name: /状态 包含/ }));
    expect(screen.getByRole("combobox", { name: "状态" })).toBeTruthy();
  });

  it("localizes complex filter labels and supports custom translations", async () => {
    const value = { $and: [{ $or: [{}] }] };
    const i18n = renderLocalized(<ComplexFilter filters={[]} value={value} />);
    expect(screen.getByRole("combobox", { name: "Select field" })).toBeTruthy();
    expect(
      screen.getByRole("combobox", { name: "Select operator" }),
    ).toBeTruthy();
    expect(
      screen.getByRole("button", { name: "Remove condition" }),
    ).toBeTruthy();
    expect(screen.getByRole("button", { name: "Remove group" })).toBeTruthy();
    await act(() => i18n.changeLanguage("zh"));
    expect(screen.getByRole("combobox", { name: "选择字段" })).toBeTruthy();
    expect(screen.getByRole("combobox", { name: "选择操作符" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "删除条件" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "删除条件组" })).toBeTruthy();

    await act(async () => {
      i18n.addResourceBundle("custom", "thread-ui", {
        complexFilter: {
          selectField: "Custom field",
          selectOperator: "Custom operator",
          removeCondition: "Custom remove condition",
          removeGroup: "Custom remove group",
        },
      });
      await i18n.changeLanguage("custom");
    });
    expect(screen.getByRole("combobox", { name: "Custom field" })).toBeTruthy();
    expect(
      screen.getByRole("combobox", { name: "Custom operator" }),
    ).toBeTruthy();
    expect(
      screen.getByRole("button", { name: "Custom remove condition" }),
    ).toBeTruthy();
    expect(
      screen.getByRole("button", { name: "Custom remove group" }),
    ).toBeTruthy();
  });

  it("forwards Select naming attributes to the combobox and retains visible labels", () => {
    renderLocalized(
      <>
        <Select aria-label="Theme" items={[]} />
        <span id="region-label">Region</span>
        <Select
          aria-label="Fallback"
          aria-labelledby="region-label"
          items={[]}
        />
        <Select items={[]} label="Country" />
      </>,
    );
    for (const name of ["Theme", "Region", "Country"]) {
      expect(screen.getByRole("combobox", { name })).toBeTruthy();
    }
  });
});
