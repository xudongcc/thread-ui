import { cleanup, render, screen } from "@testing-library/react";
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
    interpolation: {
      escapeValue: false,
    },
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
