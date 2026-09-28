import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { StrictMode, createRef, useState } from "react";
import userEvent from "@testing-library/user-event";
import { createInstance } from "i18next";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";

import en from "@repo/locales/en/thread-ui.json";
import zh from "@repo/locales/zh/thread-ui.json";
import { DataTable, createDataTableColumnHelper } from "../index";
import type { DataTableColumnProps, DataTableField } from "../index";
import { AppProvider } from "@/components/thread-ui/app-provider";

interface User {
  id: string;
  name: string;
}

const columns: Array<DataTableColumnProps<User>> = [
  {
    field: "name",
    header: "Name",
    id: "name",
  },
];

const data: Array<User> = [
  { id: "1", name: "Ada" },
  { id: "2", name: "Grace" },
];

const createI18n = () => {
  const i18n = createInstance();

  void i18n.init({
    fallbackLng: "en",
    initAsync: false,
    lng: "zh",
    ns: ["thread-ui"],
    resources: {
      en: {
        "thread-ui": structuredClone(en),
      },
      zh: {
        "thread-ui": structuredClone(zh),
      },
    },
  });

  return i18n;
};

const renderWithProvider = (ui: React.ReactNode) => {
  return render(
    <StrictMode>
      <AppProvider i18n={createI18n()}>{ui}</AppProvider>
    </StrictMode>,
  );
};

beforeAll(() => {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
});

afterEach(() => {
  cleanup();
});

describe("DataTable", () => {
  it("renders inferred nested, indexed, and computed values in one table", () => {
    interface RecordData {
      id: string;
      price: number;
      customer?: { name: string };
      tags: string[];
    }
    const recordDataColumnHelper = createDataTableColumnHelper<RecordData>();
    const inferredColumns = recordDataColumnHelper.columns([
      recordDataColumnHelper.column("price", {
        header: "Price",
        type: "currency",
        currency: "USD",
      }),
      recordDataColumnHelper.column("customer.name", {
        header: "Customer",
        render: (props, { getValue }) => (
          <span {...props}>{getValue()?.toUpperCase() ?? "Guest"}</span>
        ),
      }),
      recordDataColumnHelper.column("tags.0", {
        header: "Tag",
        render: (props, { getValue }) => (
          <span {...props}>{getValue() ?? "No tag"}</span>
        ),
      }),
      recordDataColumnHelper.column("computed", {
        getValue: (row, index) => row.price * 2 + index,
        header: "Computed",
        render: (props, { getValue }) => (
          <span {...props}>{getValue().toFixed(1)}</span>
        ),
      }),
    ]);
    renderWithProvider(
      <DataTable
        columns={inferredColumns}
        locale="en-US"
        data={[
          { id: "1", price: 12.5, customer: { name: "Ada" }, tags: ["New"] },
          { id: "2", price: 20, tags: [] },
        ]}
      />,
    );
    expect(
      screen.getByRole("row", { name: "$12.50 ADA New 25.0" }),
    ).toBeTruthy();
    expect(
      screen.getByRole("row", { name: "$20.00 Guest No tag 41.0" }),
    ).toBeTruthy();
  });

  it("keeps column IDs separate from explicit fields and computed or display values", () => {
    interface RecordData {
      id: string;
      customer: { name: string };
      amount: number;
      actions: string;
    }
    const recordDataColumnHelper = createDataTableColumnHelper<RecordData>();
    const columns = recordDataColumnHelper.columns([
      recordDataColumnHelper.column("customer.name", { header: "Nested" }),
      recordDataColumnHelper.column("customerAlias", {
        field: "customer.name",
        header: (_props, { column }) => <span>{column.id}</span>,
        render: (props, { getValue }) => (
          <strong {...props}>{getValue().toUpperCase()}</strong>
        ),
      }),
      recordDataColumnHelper.column("amount", {
        getValue: (row, index) => row.amount * 2 + index,
        header: "Computed",
      }),
      recordDataColumnHelper.column("actions", {
        field: null,
        header: "Actions",
        render: (props, { getValue, row }) => (
          <span {...props}>
            {getValue() === undefined
              ? `View ${row.original.id}`
              : "Leaked field"}
          </span>
        ),
      }),
    ]);
    renderWithProvider(
      <DataTable
        columns={columns}
        data={[
          {
            id: "1",
            customer: { name: "Ada" },
            amount: 10,
            actions: "Do not read",
          },
          {
            id: "2",
            customer: { name: "Grace" },
            amount: 20,
            actions: "Do not read",
          },
        ]}
      />,
    );
    expect(
      screen.getByRole("columnheader", { name: "customerAlias" }),
    ).toBeTruthy();
    expect(screen.getByRole("row", { name: "Ada ADA 20 View 1" })).toBeTruthy();
    expect(
      screen.getByRole("row", { name: "Grace GRACE 41 View 2" }),
    ).toBeTruthy();
  });

  it("clears the accessor when an existing column becomes display-only", () => {
    const i18n = createI18n();
    const userColumnHelper = createDataTableColumnHelper<User>();
    const makeView = <TValue,>(column: DataTableColumnProps<User, TValue>) => (
      <AppProvider i18n={i18n}>
        <DataTable columns={[column]} data={data.slice(0, 1)} />
      </AppProvider>
    );
    const view = render(makeView(userColumnHelper.column("name", {})));
    expect(screen.getByRole("cell").textContent).toBe("Ada");
    view.rerender(makeView(userColumnHelper.column("name", { field: null })));
    expect(screen.getByRole("cell").textContent).toBe("");
    view.rerender(makeView(userColumnHelper.column("name", { field: "id" })));
    expect(screen.getByRole("cell").textContent).toBe("1");
  });

  it("renders missing dictionary values safely alongside declared properties", () => {
    interface RecordData {
      id: string;
      amounts: { total: number; [key: string]: number };
      customers: Record<string, { name: string }>;
    }
    const recordDataColumnHelper = createDataTableColumnHelper<RecordData>();
    const columns = recordDataColumnHelper.columns([
      recordDataColumnHelper.column("amounts.total", {
        header: "Total",
        render: (props, { getValue }) => (
          <span {...props}>{getValue().toFixed(2)}</span>
        ),
      }),
      recordDataColumnHelper.column("amounts.discount", {
        header: "Discount",
        render: (props, { getValue }) => (
          <span {...props}>{getValue()?.toFixed(2) ?? "No discount"}</span>
        ),
      }),
      recordDataColumnHelper.column("customers.primary.name", {
        header: "Customer",
        render: (props, { getValue }) => (
          <span {...props}>{getValue()?.toUpperCase() ?? "Guest"}</span>
        ),
      }),
    ]);
    renderWithProvider(
      <DataTable
        columns={columns}
        data={[
          { id: "1", amounts: { total: 12.5 }, customers: {} },
          {
            id: "2",
            amounts: { total: 20, discount: 2 },
            customers: { primary: { name: "Ada" } },
          },
        ]}
      />,
    );
    expect(
      screen.getByRole("row", { name: "12.50 No discount Guest" }),
    ).toBeTruthy();
    expect(screen.getByRole("row", { name: "20.00 2.00 ADA" })).toBeTruthy();
  });

  it("uses column, table, and runtime formatting locales without translating UI labels", async () => {
    const i18n = createI18n();
    const formattingColumns: DataTableColumnProps<User>[] = [
      {
        id: "number",
        header: "Number",
        type: "number",
        getValue: () => 1234.5,
      },
      {
        id: "override",
        header: "Override",
        type: "number",
        locale: "de-DE",
        getValue: () => 1234.5,
      },
    ];
    const view = (locale?: string) => (
      <AppProvider i18n={i18n}>
        <DataTable
          columns={formattingColumns}
          data={data.slice(0, 1)}
          locale={locale}
          pagination={{}}
        />
      </AppProvider>
    );
    const { rerender } = render(view("fr-FR"));
    expect(screen.getByRole("cell", { name: "1\u202f234,5" })).toBeTruthy();
    expect(screen.getByRole("cell", { name: "1.234,5" })).toBeTruthy();
    expect(
      screen.getByRole("button", { name: zh.dataTable.nextPage }),
    ).toBeTruthy();
    rerender(view());
    const runtimeValue = new Intl.NumberFormat().format(1234.5);
    expect(screen.getAllByRole("cell")[0].textContent).toBe(runtimeValue);
    await i18n.changeLanguage("de-DE");
    await waitFor(() =>
      expect(
        screen.getByRole("button", { name: en.dataTable.nextPage }),
      ).toBeTruthy(),
    );
    expect(screen.getAllByRole("cell")[0].textContent).toBe(runtimeValue);
  });

  it("updates table time zones while preserving column overrides and calendar dates", () => {
    const dateColumns: DataTableColumnProps<User>[] = [
      { id: "default", type: "date", getValue: () => "2026-01-01T01:00:00Z" },
      {
        id: "override",
        type: "date",
        timeZone: "Asia/Shanghai",
        getValue: () => "2026-01-01T01:00:00Z",
      },
      { id: "calendar", type: "date", getValue: () => "2026-01-01" },
    ];
    const i18n = createI18n();
    const view = (timeZone?: string) => (
      <AppProvider i18n={i18n}>
        <DataTable
          columns={dateColumns}
          data={data.slice(0, 1)}
          locale="en-US"
          timeZone={timeZone}
        />
      </AppProvider>
    );
    const { rerender } = render(view("America/Los_Angeles"));
    expect(screen.getAllByRole("cell").map((cell) => cell.textContent)).toEqual(
      ["12/31/2025", "01/01/2026", "01/01/2026"],
    );
    rerender(view("UTC"));
    expect(screen.getAllByRole("cell").map((cell) => cell.textContent)).toEqual(
      ["01/01/2026", "01/01/2026", "01/01/2026"],
    );
    rerender(view());
    expect(screen.getAllByRole("cell")[0].textContent).toBe(
      new Intl.DateTimeFormat("en-US", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }).format(new Date("2026-01-01T01:00:00Z")),
    );
  });

  it("aligns numeric headers and cells while allowing explicit alignment", () => {
    renderWithProvider(
      <DataTable
        data={data.slice(0, 1)}
        columns={[
          { field: "id", header: "ID", type: "number" },
          {
            id: "center",
            header: "Centered",
            type: "percent",
            align: "center",
            getValue: () => 0.125,
            precision: 1,
          },
        ]}
      />,
    );
    expect(
      screen
        .getByRole("columnheader", { name: "ID" })
        .classList.contains("text-right"),
    ).toBe(true);
    expect(
      screen.getByRole("cell", { name: "1" }).classList.contains("text-right"),
    ).toBe(true);
    expect(
      screen
        .getByRole("columnheader", { name: "Centered" })
        .classList.contains("text-center"),
    ).toBe(true);
    expect(
      screen
        .getByRole("cell", { name: "12.5%" })
        .classList.contains("text-center"),
    ).toBe(true);
  });

  it.each([
    ["null prototype", Object.setPrototypeOf({ label: "Ada" }, null)],
    ["shadowed toString", { label: "Ada", toString: "data property" }],
  ])(
    "renders computed objects with %s without requiring text conversion",
    (_name, details: { label: string }) => {
      interface RecordData {
        id: string;
        details: { label: string };
      }
      const recordDataColumnHelper = createDataTableColumnHelper<RecordData>();
      renderWithProvider(
        <DataTable
          data={[{ id: "1", details }]}
          columns={recordDataColumnHelper.columns([
            recordDataColumnHelper.column("details", {
              getValue: (row) => row.details,
              header: "Details",
              render: (props, { getValue }) => (
                <span {...props}>{getValue().label}</span>
              ),
            }),
          ])}
        />,
      );
      expect(screen.getByRole("cell", { name: "Ada" })).toBeTruthy();
    },
  );

  it("preserves raw render values and supplies formatted children to render elements", () => {
    renderWithProvider(
      <DataTable
        data={data.slice(0, 1)}
        locale="en-US"
        columns={[
          {
            id: "custom",
            type: "percent",
            precision: 1,
            getValue: () => 0.125,
            render: (props, { getValue }) => (
              <strong {...props}>
                Raw: {String(getValue())}; child: {props.children}
              </strong>
            ),
          },
          {
            id: "element",
            type: "currency",
            currency: "USD",
            getValue: () => 12.5,
            render: <em />,
          },
        ]}
      />,
    );
    expect(screen.getByText("Raw: 0.125; child: 0.125")).toBeTruthy();
    expect(screen.getByText("$12.50").tagName).toBe("EM");
  });

  it.each(["pointer", "keyboard"])(
    "keeps %s row actions separate from row navigation",
    async (interaction) => {
      const user = userEvent.setup();
      const onRowClick = vi.fn();
      const onAction = vi.fn();

      renderWithProvider(
        <DataTable
          columns={columns}
          data={data}
          rowActions={() => [{ label: "Edit", onClick: onAction }]}
          onRowClick={onRowClick}
        />,
      );

      await user.click(screen.getByText("Ada"));
      expect(onRowClick).toHaveBeenCalledTimes(1);
      expect(onRowClick.mock.calls[0]![0].original).toEqual(data[0]);
      onRowClick.mockClear();

      const trigger = screen.getAllByLabelText("打开行操作")[0]!;
      await user.click(trigger);
      expect(onRowClick).not.toHaveBeenCalled();
      const item = await screen.findByRole("menuitem", { name: "Edit" });

      if (interaction === "keyboard") {
        item.focus();
        await user.keyboard("{Enter}");
      } else {
        await user.click(item);
      }

      expect(onAction).toHaveBeenCalledTimes(1);
      expect(onAction.mock.calls[0]![0]).toEqual({
        id: "1",
        index: 0,
        original: data[0],
      });
      expect(onRowClick).not.toHaveBeenCalled();

      await user.click(trigger.closest("td")!);
      expect(onRowClick).not.toHaveBeenCalled();
    },
  );

  it("adapts public cell contexts and pins columns without an explicit id", () => {
    const renderCell = vi.fn((props, { getValue, row }) => (
      <strong {...props}>{`${getValue()} / ${row.id}`}</strong>
    ));
    renderWithProvider(
      <DataTable<User, string>
        data={data}
        columns={[
          { field: "name", header: "Name", pinned: "left", size: 120 },
          {
            id: "contact",
            getValue: (user) => user.name.toUpperCase(),
            header: (props, { column }) => <em {...props}>{column.id}</em>,
            render: renderCell,
            pinned: "right",
          },
        ]}
      />,
    );
    expect(screen.getByText("ADA / 1")).toBeTruthy();
    expect(screen.getByText("contact")).toBeTruthy();
    const context = renderCell.mock.calls[0]![1];
    expect(Object.keys(context).sort()).toEqual(["column", "getValue", "row"]);
    expect(context.row).toEqual({ id: "1", index: 0, original: data[0] });
    expect(screen.getByText("Ada").closest("td")!.className).toContain(
      "left-(--column-offset)",
    );
    expect(screen.getByText("ADA / 1").closest("td")!.className).toContain(
      "right-(--column-offset)",
    );
  });

  it("updates column visibility without losing selection or leaving pinned gaps", async () => {
    const user = userEvent.setup();
    const i18n = createI18n();
    const userColumnHelper = createDataTableColumnHelper<User>();
    const hiddenValue = vi.fn((row: User) => row.id);
    const hiddenHeader = vi.fn(() => <span>Identifier</span>);
    const onSelection = vi.fn();
    const makeView = (hidden: boolean) => (
      <AppProvider i18n={i18n}>
        <DataTable
          data={data}
          rowActions={() => [{ label: "Edit" }]}
          columns={userColumnHelper.columns([
            userColumnHelper.column("identifier", {
              getValue: hiddenValue,
              header: hiddenHeader,
              hidden,
              pinned: "left",
              size: 80,
            }),
            userColumnHelper.column("name", { header: "Name", pinned: "left" }),
            userColumnHelper.column("trailing", {
              field: "id",
              header: "Trailing",
              hidden,
              pinned: "right",
              size: 90,
            }),
          ])}
          onRowSelectionChange={onSelection}
        />
      </AppProvider>
    );
    const view = render(makeView(true));
    expect(screen.getAllByRole("columnheader")).toHaveLength(3);
    expect(hiddenValue).not.toHaveBeenCalled();
    expect(hiddenHeader).not.toHaveBeenCalled();
    expect(screen.queryByRole("columnheader", { name: "Trailing" })).toBeNull();
    expect(
      screen
        .getByText("Ada")
        .closest("td")!
        .style.getPropertyValue("--column-offset"),
    ).toBe("32px");

    await user.click(screen.getAllByRole("checkbox")[1]!);
    await waitFor(() =>
      expect(onSelection).toHaveBeenLastCalledWith([data[0]]),
    );
    view.rerender(makeView(false));
    expect(screen.getAllByRole("columnheader")).toHaveLength(5);
    expect(
      screen.getByRole("columnheader", { name: "Identifier" }),
    ).toBeTruthy();
    expect(hiddenValue).toHaveBeenCalled();
    expect(
      screen.getByText("Ada").closest("tr")!.getAttribute("data-state"),
    ).toBe("selected");
    expect(
      screen
        .getByText("Ada")
        .closest("td")!
        .style.getPropertyValue("--column-offset"),
    ).toBe("112px");
    expect(
      screen
        .getByRole("columnheader", { name: "Trailing" })
        .style.getPropertyValue("--column-offset"),
    ).toBe("60px");

    view.rerender(makeView(true));
    expect(screen.getAllByRole("columnheader")).toHaveLength(3);
    expect(
      screen
        .getByText("Ada")
        .closest("td")!
        .style.getPropertyValue("--column-offset"),
    ).toBe("32px");
    expect(
      screen.getByText("Ada").closest("tr")!.getAttribute("data-state"),
    ).toBe("selected");
  });

  it("spans only visible columns in the empty state, including selection and actions", () => {
    const i18n = createI18n();
    const hiddenColumns: DataTableColumnProps<User>[] = [
      { field: "id", hidden: true },
      { field: "name", hidden: true },
    ];
    const view = render(
      <AppProvider i18n={i18n}>
        <DataTable
          columns={hiddenColumns}
          data={[]}
          rowActions={() => []}
          onRowSelectionChange={() => {}}
        />
      </AppProvider>,
    );
    expect(screen.getByRole("cell").getAttribute("colspan")).toBe("2");
    view.rerender(
      <AppProvider i18n={i18n}>
        <DataTable columns={hiddenColumns} data={[]} />
      </AppProvider>,
    );
    expect(screen.getByRole("cell").getAttribute("colspan")).toBe("1");
  });

  it("merges element renders and refs without leaking context to the DOM", () => {
    const ref = createRef<HTMLElement>();
    renderWithProvider(
      <DataTable
        data={[data[0]!]}
        columns={[
          {
            field: "name",
            header: <em>Name</em>,
            render: <strong ref={ref} className="font-medium" />,
          },
        ]}
      />,
    );
    expect(screen.getByText("Name").tagName).toBe("EM");
    const cellContent = screen.getByText("Ada");
    expect(cellContent.tagName).toBe("STRONG");
    expect(ref.current).toBe(cellContent);
    expect(cellContent.className).toBe("font-medium");
    expect(cellContent.closest("td")).toBeTruthy();
    expect(cellContent.hasAttribute("data-context")).toBe(false);
    expect(cellContent.hasAttribute("data-row")).toBe(false);
  });

  it("preserves keyboard activation and disabled state for custom action links", async () => {
    const user = userEvent.setup();
    const onAction = vi.fn();
    const onRowClick = vi.fn();
    renderWithProvider(
      <DataTable
        columns={columns}
        data={[data[0]!]}
        rowActions={() => [
          {
            label: "View",
            onClick: onAction,
            render: (props, { row }) => (
              <a {...props} href={`#person-${row.id}`} />
            ),
          },
          {
            label: "Disabled",
            disabled: true,
            onClick: onAction,
            render: <a href="#disabled" />,
          },
        ]}
        onRowClick={onRowClick}
      />,
    );
    await user.click(screen.getByLabelText("打开行操作"));
    const disabled = await screen.findByRole("menuitem", { name: "Disabled" });
    expect(disabled.getAttribute("aria-disabled")).toBe("true");
    await user.click(disabled);
    expect(onAction).not.toHaveBeenCalled();
    const view = screen.getByRole("menuitem", { name: "View" });
    expect(view.tagName).toBe("A");
    expect(view.getAttribute("href")).toBe("#person-1");
    view.focus();
    await user.keyboard("{Enter}");
    expect(onAction).toHaveBeenCalledWith({
      id: "1",
      index: 0,
      original: data[0],
    });
    expect(onRowClick).not.toHaveBeenCalled();
  });

  it("selects all supplied rows without implicitly paginating them", async () => {
    const user = userEvent.setup();
    const rows = Array.from({ length: 15 }, (_, index) => ({
      id: String(index),
      name: `Person ${index}`,
    }));
    const onSelection = vi.fn();
    renderWithProvider(
      <DataTable
        columns={columns}
        data={rows}
        onRowSelectionChange={onSelection}
      />,
    );
    expect(screen.getAllByLabelText("选择行")).toHaveLength(15);
    await user.click(screen.getByLabelText("选择所有行"));
    expect(onSelection).toHaveBeenLastCalledWith(rows);
  });

  it("refreshes selected records when data changes without changing its length", async () => {
    const user = userEvent.setup();
    const onSelection = vi.fn();
    const i18n = createI18n();
    const view = render(
      <AppProvider i18n={i18n}>
        <DataTable
          columns={columns}
          data={data}
          onRowSelectionChange={onSelection}
        />
      </AppProvider>,
    );
    await user.click(screen.getAllByLabelText("选择行")[0]!);
    const updated = [{ id: "1", name: "Updated Ada" }, data[1]!];
    view.rerender(
      <AppProvider i18n={i18n}>
        <DataTable
          columns={columns}
          data={updated}
          onRowSelectionChange={onSelection}
        />
      </AppProvider>,
    );
    await waitFor(() =>
      expect(onSelection).toHaveBeenLastCalledWith([updated[0]]),
    );
  });

  it("uses AppProvider translations for the built-in empty state", () => {
    renderWithProvider(<DataTable columns={columns} data={[]} />);

    expect(screen.getByText("没有找到项目")).toBeTruthy();
    expect(screen.getByText("调整筛选或搜索条件后重试。")).toBeTruthy();
  });

  it("uses AppProvider translations for built-in table controls", async () => {
    const user = userEvent.setup();

    renderWithProvider(
      <DataTable
        columns={columns}
        data={data}
        pagination={{
          hasNextPage: true,
          hasPreviousPage: true,
          onNextPage: vi.fn(),
          onPreviousPage: vi.fn(),
        }}
        rowActions={() => [
          {
            label: "Edit",
          },
        ]}
        onRowSelectionChange={vi.fn()}
      />,
    );

    expect(screen.getByRole("button", { name: "上一页" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "下一页" })).toBeTruthy();
    expect(screen.getAllByLabelText("选择行")).toHaveLength(2);
    expect(screen.getAllByLabelText("选择所有行").length).toBeGreaterThan(0);
    expect(screen.getAllByLabelText("打开行操作")).toHaveLength(2);

    await user.click(screen.getAllByLabelText("选择行")[0]!);

    const selectionMenu = screen.getByRole("button", { name: /已选择 1 行/ });
    expect(selectionMenu).toBeTruthy();

    await user.click(selectionMenu);

    expect(await screen.findByText("选择本页全部 2 行")).toBeTruthy();
    expect(screen.getByText("选择全部")).toBeTruthy();
    expect(screen.getByText("取消全选")).toBeTruthy();
  });

  it.each(["row", "header"])(
    "revokes all-record selection when %s selection is cleared",
    async (source) => {
      const user = userEvent.setup();
      const onAll = vi.fn();
      renderWithProvider(
        <DataTable
          columns={columns}
          data={data}
          onAllRowsSelectedChange={onAll}
          onRowSelectionChange={vi.fn()}
        />,
      );
      await user.click(screen.getAllByLabelText("选择行")[0]!);
      await user.click(screen.getByRole("button", { name: /已选择 1 行/ }));
      await user.click(await screen.findByText("选择全部"));
      expect(onAll).toHaveBeenLastCalledWith(true);
      await user.click(
        screen.getAllByLabelText(
          source === "row" ? "选择行" : "选择所有行",
        )[0]!,
      );
      expect(onAll.mock.calls).toEqual([[true], [false]]);
    },
  );

  it("clears obsolete selection when selected records leave the supplied data", async () => {
    const user = userEvent.setup();
    const onSelected = vi.fn();
    const i18n = createI18n();
    const view = render(
      <AppProvider i18n={i18n}>
        <DataTable
          columns={columns}
          data={data}
          onRowSelectionChange={onSelected}
        />
      </AppProvider>,
    );
    await user.click(screen.getAllByLabelText("选择行")[0]!);
    view.rerender(
      <AppProvider i18n={i18n}>
        <DataTable
          columns={columns}
          data={[{ id: "3", name: "Other" }]}
          onRowSelectionChange={onSelected}
        />
      </AppProvider>,
    );
    expect(onSelected).toHaveBeenLastCalledWith([]);
    expect(screen.queryByRole("button", { name: /已选择 1 行/ })).toBeNull();
    view.rerender(
      <AppProvider i18n={i18n}>
        <DataTable
          columns={columns}
          data={data}
          onRowSelectionChange={onSelected}
        />
      </AppProvider>,
    );
    expect(
      screen
        .getAllByLabelText("选择行")
        .every((checkbox) => checkbox.getAttribute("aria-checked") === "false"),
    ).toBe(true);
    expect(screen.queryByRole("button", { name: /已选择 1 行/ })).toBeNull();
  });

  it("retains custom cell state when only rowActions callback identity changes", async () => {
    function Editor() {
      const [value, setValue] = useState("initial");
      return (
        <input
          aria-label="editor"
          value={value}
          onChange={(event) => setValue(event.target.value)}
        />
      );
    }
    const customColumns: DataTableColumnProps<User>[] = [
      { field: "name", header: "Name", render: <Editor /> },
    ];
    const i18n = createI18n();
    const stableData = [data[0]!];
    const makeView = () => (
      <AppProvider i18n={i18n}>
        <DataTable
          columns={customColumns}
          data={stableData}
          rowActions={() => [{ label: "Edit" }]}
        />
      </AppProvider>
    );
    const view = render(makeView());
    const user = userEvent.setup();
    await user.clear(screen.getByLabelText("editor"));
    await user.type(screen.getByLabelText("editor"), "edited");
    const editor = screen.getByLabelText("editor");
    view.rerender(makeView());
    expect(screen.getByLabelText("editor")).toBe(editor);
    expect(document.activeElement).toBe(editor);
    expect((screen.getByLabelText("editor") as HTMLInputElement).value).toBe(
      "edited",
    );
  });

  it("updates computed values when the column computation changes", () => {
    const i18n = createI18n();
    const makeView = (suffix: string) => (
      <AppProvider i18n={i18n}>
        <DataTable
          data={data}
          columns={[
            {
              id: "name",
              header: "Name",
              getValue: (row) => row.name + suffix,
            },
          ]}
        />
      </AppProvider>
    );
    const view = render(makeView(" old"));
    expect(screen.getByText("Ada old")).toBeTruthy();
    view.rerender(makeView(" new"));
    expect(screen.getByText("Ada new")).toBeTruthy();
  });
  it("refreshes nested field access and preserves null and falsy values", () => {
    const i18n = createI18n();
    const records = [
      {
        id: "1",
        nested: {
          first: "first",
          second: "second",
          zero: 0,
          no: false,
          empty: null,
        },
      },
    ];
    const makeView = (field: DataTableField<(typeof records)[number]>) => (
      <AppProvider i18n={i18n}>
        <DataTable
          columns={[{ id: "value", field, header: "Value" }]}
          data={records}
        />
      </AppProvider>
    );
    const view = render(makeView("nested.first"));
    expect(screen.getByRole("cell").textContent).toBe("first");
    for (const [field, text] of [
      ["nested.second", "second"],
      ["nested.zero", "0"],
      ["nested.no", "false"],
      ["nested.empty", ""],
    ] as const) {
      view.rerender(makeView(field));
      expect(screen.getByRole("cell").textContent).toBe(text);
    }
  });

  it("revokes all-record selection when replacing the current page", async () => {
    const i18n = createI18n();
    const onAll = vi.fn();
    const onSelected = vi.fn();
    const makeView = (records: User[]) => (
      <StrictMode>
        <AppProvider i18n={i18n}>
          <DataTable
            columns={columns}
            data={records}
            onAllRowsSelectedChange={onAll}
            onRowSelectionChange={onSelected}
          />
        </AppProvider>
      </StrictMode>
    );
    const view = render(makeView(data));
    const user = userEvent.setup();
    await user.click(screen.getAllByLabelText("选择行")[0]!);
    await user.click(screen.getByRole("button", { name: /已选择 1 行/ }));
    await user.click(await screen.findByText("选择全部"));
    view.rerender(makeView([{ id: "3", name: "Other" }]));
    expect(onAll.mock.calls).toEqual([[true], [false]]);
    expect(onSelected).toHaveBeenLastCalledWith([]);
    expect(screen.queryByRole("button", { name: /已全选/ })).toBeNull();
  });
});
