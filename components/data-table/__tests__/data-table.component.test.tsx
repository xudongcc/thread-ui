import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { createRef } from "react";
import userEvent from "@testing-library/user-event";
import { createInstance } from "i18next";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";

import en from "@repo/locales/en/thread-ui.json";
import zh from "@repo/locales/zh/thread-ui.json";
import { DataTable } from "../index";
import type { DataTableColumnProps } from "../index";
import { AppProvider } from "@/components/thread-ui/app-provider";

interface User {
  id: string;
  name: string;
}

const columns: Array<DataTableColumnProps<User>> = [
  {
    accessorKey: "name",
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
  return render(<AppProvider i18n={createI18n()}>{ui}</AppProvider>);
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
          { accessorKey: "name", header: "Name", pinned: "left", size: 120 },
          {
            id: "contact",
            accessorFn: (user) => user.name.toUpperCase(),
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

  it("merges element renders and refs without leaking context to the DOM", () => {
    const ref = createRef<HTMLElement>();
    renderWithProvider(
      <DataTable
        data={[data[0]!]}
        columns={[
          {
            accessorKey: "name",
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
});
