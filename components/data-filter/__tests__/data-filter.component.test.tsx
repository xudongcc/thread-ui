import {
  fireEvent,
  render as renderWithTestingLibrary,
  screen,
  waitFor,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createInstance } from "i18next";
import { StrictMode, createElement, useEffect, useRef, useState } from "react";
import { beforeAll, describe, expect, it, vi } from "vitest";

import en from "@repo/locales/en/thread-ui.json";
import zh from "@repo/locales/zh/thread-ui.json";
import { DataFilter } from "../data-filter";
import { DataFilterItem } from "../index";
import { DataFilterRemoveAction } from "../components/data-filter-remove-action";
import type { DataFilterConditionValue } from "../index";
import type { DataFilterField, DataFilterValue } from "../types";
import type { ReactElement } from "react";
import { AppProvider } from "@/components/thread-ui/app-provider";

const createResources = () => ({
  en: {
    "thread-ui": structuredClone(en),
  },
  zh: {
    "thread-ui": structuredClone(zh),
  },
});

describe("DataFilterRemoveAction", () => {
  it("uses the translated label and removes without submitting its parent form", async () => {
    const onRemove = vi.fn();
    const onSubmit = vi.fn((event) => event.preventDefault());
    render(
      <form onSubmit={onSubmit}>
        <DataFilterRemoveAction onClick={onRemove} />
      </form>,
      { language: "zh" },
    );

    await userEvent.click(
      screen.getByRole("button", { name: zh.dataFilter.removeFilter }),
    );

    expect(onRemove).toHaveBeenCalledTimes(1);
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("allows a custom label and forwards disabled", async () => {
    const onRemove = vi.fn();
    render(
      <DataFilterRemoveAction
        disabled
        aria-label="Remove name filter"
        onClick={onRemove}
      />,
    );

    const button = screen.getByRole("button", { name: "Remove name filter" });
    await userEvent.click(button);
    expect(onRemove).not.toHaveBeenCalled();
  });
});

const createI18n = (language = "en") => {
  const i18n = createInstance();

  void i18n.init({
    fallbackLng: "en",
    initAsync: false,
    lng: language,
    ns: ["thread-ui"],
    resources: createResources(),
  });

  return i18n;
};

const render = (
  ui: ReactElement,
  { language = "en" }: { language?: string } = {},
) => {
  return renderWithTestingLibrary(
    <AppProvider i18n={createI18n(language)}>{ui}</AppProvider>,
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

interface AutoCommitFieldProps {
  value: string | null | undefined;
  onChange: (value: string | null | undefined) => void;
}

const AutoCommitField = ({ onChange, value }: AutoCommitFieldProps) => {
  const didCommitRef = useRef(false);

  useEffect(() => {
    if (didCommitRef.current) {
      return;
    }

    didCommitRef.current = true;
    onChange(value);
  }, [onChange, value]);

  return null;
};

const ControlledDataFilter = () => {
  const [value, setValue] = useState<DataFilterValue>({
    filter: {
      status: {
        $eq: "active",
      },
    },
    query: "",
  });
  const filters: Array<DataFilterField> = [
    {
      field: "status",
      label: "Status",
      render: ({ field }) => <AutoCommitField {...field} />,
      type: "input",
    },
  ];

  return <DataFilter filters={filters} value={value} onChange={setValue} />;
};

const DocsDataFilterExample = () => {
  const [value, setValue] = useState<DataFilterValue>({
    filter: {
      amount: {
        $gte: 100,
      },
      age: {
        $between: [18, 30],
      },
      createdAt: {
        $between: ["2025-03-01T00:00:00.000Z", "2025-03-15T00:00:00.000Z"],
      },
      name: {
        $fulltext: "Acme",
      },
      archived: {
        $eq: true,
      },
    },
    orderBy: { direction: "DESC", field: "createdAt" },
    query: "Acme",
  });
  const filters: Array<DataFilterField> = [
    {
      defaultOperator: "$fulltext",
      field: "name",
      label: "Name",
      operators: ["$eq", "$ne", "$fulltext"],
      placeholder: "Filter by name...",
      type: "input",
    },
    {
      decimalScale: 2,
      defaultOperator: "$gte",
      field: "amount",
      label: "Amount",
      max: 10000,
      min: 0,
      operators: ["$eq", "$ne", "$gt", "$gte", "$lt", "$lte", "$between"],
      type: "number-input",
    },
    {
      defaultOperator: "$between",
      field: "age",
      label: "Age",
      max: 120,
      min: 0,
      operators: ["$eq", "$ne", "$gt", "$gte", "$lt", "$lte", "$between"],
      type: "number-input",
    },
    {
      defaultOperator: "$between",
      field: "createdAt",
      label: "Created At",
      max: new Date("2026-12-31"),
      min: new Date("2024-01-01"),
      operators: ["$eq", "$ne", "$gt", "$gte", "$lt", "$lte", "$between"],
      type: "date-picker",
    },
    {
      defaultOperator: "$eq",
      field: "archived",
      label: "Archived",
      operators: ["$eq", "$ne"],
      type: "checkbox",
    },
  ];

  return <DataFilter filters={filters} value={value} onChange={setValue} />;
};

const ControlledInputFilter = () => {
  const [value, setValue] = useState<DataFilterValue>({
    filter: {
      name: {
        $fulltext: "Acme",
      },
    },
    query: "",
  });

  return (
    <DataFilter
      value={value}
      filters={[
        {
          defaultOperator: "$fulltext",
          field: "name",
          label: "Name",
          placeholder: "Filter by name...",
          type: "input",
        },
      ]}
      onChange={setValue}
    />
  );
};

const pressEnter = (
  element: HTMLElement,
  options: { isComposing?: boolean } = {},
) => {
  const event = new KeyboardEvent("keydown", {
    bubbles: true,
    cancelable: true,
    key: "Enter",
  });

  Object.defineProperty(event, "isComposing", {
    value: options.isComposing ?? false,
  });

  fireEvent(element, event);
};

describe("DataFilter", () => {
  it("uses AppProvider translations for built-in labels", async () => {
    const user = userEvent.setup();

    render(
      <DataFilter
        filters={[
          {
            defaultOperator: "$eq",
            field: "archived",
            label: "归档",
            type: "checkbox",
          },
          {
            defaultOperator: "$between",
            field: "amount",
            label: "金额",
            operators: ["$between"],
            type: "number-input",
          },
          {
            defaultOperator: "$eq",
            field: "name",
            label: "名称",
            type: "input",
          },
          {
            defaultOperator: "$fulltext",
            field: "owner",
            label: "负责人",
            type: "input",
          },
        ]}
        value={{
          filter: {
            amount: {
              $between: [10, 20],
            },
            archived: {
              $eq: true,
            },
            name: {
              $eq: null,
            },
          },
          query: "",
        }}
      />,
      { language: "zh" },
    );

    expect(screen.getByRole("button", { name: "添加筛选" })).toBeTruthy();
    expect(
      screen.getByRole("button", { name: "归档 等于 已选中" }),
    ).toBeTruthy();
    expect(screen.getByRole("button", { name: "名称 为空" })).toBeTruthy();

    await user.click(screen.getByRole("button", { name: "金额 介于 10 - 20" }));

    expect(screen.getByRole("button", { name: "介于" })).toBeTruthy();
    expect(screen.queryByRole("button", { name: "金额 介于" })).toBeNull();
    expect(screen.getByLabelText("金额 最小值")).toBeTruthy();
    expect(screen.getByLabelText("金额 最大值")).toBeTruthy();

    await user.click(screen.getByRole("button", { name: "归档 等于 已选中" }));

    expect(screen.getByRole("button", { name: "未选中" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "已选中" })).toBeTruthy();
  });

  it("uses AppProvider resource overrides with the default English locale", () => {
    const customI18n = createI18n();

    customI18n.addResourceBundle(
      "en",
      "thread-ui",
      {
        dataFilter: {
          addFilter: "Add condition",
          operators: {
            $fulltext: "matches",
          },
        },
      },
      true,
      true,
    );

    renderWithTestingLibrary(
      <AppProvider i18n={customI18n}>
        <DataFilter
          filters={[
            {
              defaultOperator: "$fulltext",
              field: "name",
              label: "Name",
              type: "input",
            },
            {
              defaultOperator: "$eq",
              field: "owner",
              label: "Owner",
              type: "input",
            },
          ]}
          value={{
            filter: {
              name: {
                $fulltext: "Acme",
              },
            },
            query: "",
          }}
        />
      </AppProvider>,
    );

    expect(screen.getByRole("button", { name: "Add condition" })).toBeTruthy();
    expect(
      screen.getByRole("button", { name: "Name matches Acme" }),
    ).toBeTruthy();
  });

  it("passes the AppProvider language calendar locale to date filter calendars", async () => {
    const user = userEvent.setup();
    const selectedDate = new Date(2025, 2, 15).toISOString();
    const localizedDate = new Date(selectedDate).toLocaleDateString("zh");

    render(
      <DataFilter
        filters={[
          {
            defaultOperator: "$eq",
            field: "createdAt",
            label: "创建日期",
            type: "date-picker",
          },
        ]}
        value={{
          filter: {
            createdAt: {
              $eq: selectedDate,
            },
          },
          query: "",
        }}
      />,
      { language: "zh" },
    );

    await user.click(
      screen.getByRole("button", { name: "创建日期 等于 2025-03-15" }),
    );

    expect(
      document.querySelector(`[data-day="${localizedDate}"]`),
    ).toBeTruthy();
  });

  it("resolves labels for selected async select values missing from search results", async () => {
    const user = userEvent.setup();
    const loadOptions = vi.fn(async () => {
      return [{ label: "Cloudflare", value: "cloudflare" }];
    });
    const resolveSelectedOptions = vi.fn(async (values: Array<string>) => {
      return values.map((nextValue) => ({
        label: nextValue === "postgresql" ? "PostgreSQL" : nextValue,
        value: nextValue,
      }));
    });

    render(
      <DataFilter
        filters={[
          {
            defaultOperator: "$in",
            field: "tags",
            label: "Tags",
            options: loadOptions,
            resolveSelectedOptions,
            type: "select",
          },
        ]}
        value={{
          filter: {
            tags: {
              $in: ["postgresql"],
            },
          },
          query: "",
        }}
      />,
    );

    expect(
      await screen.findByRole("button", { name: "Tags contains PostgreSQL" }),
    ).toBeTruthy();
    await waitFor(() => {
      expect(resolveSelectedOptions).toHaveBeenCalledWith(["postgresql"]);
    });

    await user.click(screen.getByRole("button", { name: /Tags contains/ }));

    expect((await screen.findAllByText("PostgreSQL")).length).toBeGreaterThan(
      0,
    );
  });

  it("does not emit controlled value changes from inside state updaters", () => {
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    try {
      render(<ControlledDataFilter />);

      expect(consoleError.mock.calls.flat().join("\n")).not.toContain(
        "Cannot update a component",
      );
    } finally {
      consoleError.mockRestore();
    }
  });

  it("does not emit setState-in-render warnings for the docs example", () => {
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    try {
      render(
        <StrictMode>
          <DocsDataFilterExample />
        </StrictMode>,
      );

      expect(consoleError.mock.calls.flat().join("\n")).not.toContain(
        "Cannot update a component",
      );
    } finally {
      consoleError.mockRestore();
    }
  });

  it("does not emit setState-in-render warnings when filter values change", async () => {
    const user = userEvent.setup();
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    try {
      render(<ControlledInputFilter />);

      await user.click(
        screen.getByRole("button", { name: /Name contains Acme/ }),
      );

      fireEvent.change(
        await screen.findByPlaceholderText("Filter by name..."),
        {
          target: { value: "Beta" },
        },
      );

      expect(consoleError.mock.calls.flat().join("\n")).not.toContain(
        "Cannot update a component",
      );
    } finally {
      consoleError.mockRestore();
    }
  });

  it("emits each filter value change once in StrictMode", async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();

    render(
      <StrictMode>
        <DataFilter
          filters={[
            {
              defaultOperator: "$fulltext",
              field: "name",
              label: "Name",
              placeholder: "Filter by name...",
              type: "input",
            },
          ]}
          value={{
            filter: {
              name: {
                $fulltext: "Acme",
              },
            },
            query: "",
          }}
          onChange={handleChange}
        />
      </StrictMode>,
    );

    await user.click(
      screen.getByRole("button", { name: /Name contains Acme/ }),
    );

    fireEvent.change(await screen.findByPlaceholderText("Filter by name..."), {
      target: { value: "Beta" },
    });
    fireEvent.blur(screen.getByPlaceholderText("Filter by name..."));

    expect(handleChange).toHaveBeenCalledTimes(1);
  });

  it("commits text filter input changes on blur or non-composing Enter", async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();

    render(
      <DataFilter
        filters={[
          {
            defaultOperator: "$fulltext",
            field: "name",
            label: "Name",
            placeholder: "Filter by name...",
            type: "input",
          },
        ]}
        value={{
          filter: {
            name: {
              $fulltext: "Acme",
            },
          },
          query: "",
        }}
        onChange={handleChange}
      />,
    );

    await user.click(
      screen.getByRole("button", { name: /Name contains Acme/ }),
    );
    const input = await screen.findByPlaceholderText("Filter by name...");

    fireEvent.change(input, { target: { value: "Beta" } });
    expect(handleChange).not.toHaveBeenCalled();

    pressEnter(input, { isComposing: true });
    expect(handleChange).not.toHaveBeenCalled();

    pressEnter(input);
    expect(handleChange).toHaveBeenCalledExactlyOnceWith({
      filter: {
        name: {
          $fulltext: "Beta",
        },
      },
      query: "",
    } satisfies DataFilterValue);
  });

  it("commits number filter input changes on blur or non-composing Enter", async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();

    render(
      <DataFilter
        filters={[
          {
            defaultOperator: "$gte",
            field: "amount",
            label: "Amount",
            placeholder: "Filter by amount...",
            type: "number-input",
          },
        ]}
        value={{
          filter: {
            amount: {
              $gte: 100,
            },
          },
          query: "",
        }}
        onChange={handleChange}
      />,
    );

    await user.click(screen.getByRole("button", { name: /Amount greater/ }));
    const input = await screen.findByPlaceholderText("Filter by amount...");

    fireEvent.change(input, { target: { value: "250" } });
    expect(handleChange).not.toHaveBeenCalled();

    pressEnter(input, { isComposing: true });
    expect(handleChange).not.toHaveBeenCalled();

    fireEvent.blur(input);
    expect(handleChange).toHaveBeenCalledExactlyOnceWith({
      filter: {
        amount: {
          $gte: 250,
        },
      },
      query: "",
    } satisfies DataFilterValue);
  });

  it("keeps search commits on blur or non-composing Enter", () => {
    const handleChange = vi.fn();

    render(
      <DataFilter
        filters={[]}
        search={{ placeholder: "Search customers..." }}
        value={{ filter: {}, query: "" }}
        onChange={handleChange}
      />,
    );

    const input = screen.getByPlaceholderText("Search customers...");

    fireEvent.change(input, { target: { value: "Acme" } });
    expect(handleChange).not.toHaveBeenCalled();

    pressEnter(input, { isComposing: true });
    expect(handleChange).not.toHaveBeenCalled();

    pressEnter(input);
    expect(handleChange).toHaveBeenCalledExactlyOnceWith({
      filter: {},
      query: "Acme",
    } satisfies DataFilterValue);
  });

  it("emits query changes through the root onChange callback", async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();

    render(
      createElement(DataFilter, {
        filters: [],
        onChange: handleChange,
        search: { placeholder: "Search customers..." },
        value: { filter: {}, query: "" },
      }),
    );

    const input = screen.getByPlaceholderText("Search customers...");
    await user.type(input, "Acme");
    fireEvent.blur(input);

    expect(handleChange).toHaveBeenLastCalledWith({
      filter: {},
      query: "Acme",
    } satisfies DataFilterValue);
  });

  it("shows root loading in search without disabling input", () => {
    render(
      createElement(DataFilter, {
        filters: [],
        loading: true,
        search: { placeholder: "Search customers..." },
        value: { filter: {}, query: "" },
      }),
    );

    expect(screen.getByRole("status", { name: "Loading" })).toBeTruthy();
    expect(screen.getByPlaceholderText("Search customers...")).toHaveProperty(
      "disabled",
      false,
    );
  });
});

describe("DataFilterItem", () => {
  it("edits a standalone controlled condition and lets its parent handle removal", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const onRemove = vi.fn();
    function Example() {
      const [value, setValue] = useState<DataFilterConditionValue>();
      return (
        <DataFilterItem
          field="name"
          label="Name"
          type="input"
          value={value}
          onChange={(next) => {
            onChange(next);
            setValue(next);
          }}
          onRemove={() => {
            onRemove();
            setValue(undefined);
          }}
        />
      );
    }
    render(<Example />);
    expect(screen.queryByRole("textbox")).toBeNull();
    await user.click(screen.getByRole("button", { name: "Name is" }));
    await user.type(
      screen.getByRole("textbox", { name: "Name" }),
      "Thread{Enter}",
    );
    expect(onChange).toHaveBeenLastCalledWith({ $eq: "Thread" });
    await user.click(screen.getByRole("button", { name: "Remove filter" }));
    expect(onRemove).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("button", { name: "Name is" })).toBeTruthy();
  });

  it("supports render and null operators without exposing a remove action", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const config = { field: "name", label: "Name", type: "input" as const };
    const customRender = vi.fn(({ field }) => (
      <input
        aria-label="Custom name"
        value={field.value ?? ""}
        onChange={(event) => field.onChange(event.target.value)}
      />
    ));
    const { rerender } = render(
      <DataFilterItem
        {...config}
        render={customRender}
        value={{ $eq: "Thread" }}
        onChange={onChange}
      />,
    );
    await user.click(screen.getByRole("button", { name: "Name is Thread" }));
    expect(screen.queryByRole("button", { name: "Remove filter" })).toBeNull();
    await user.type(screen.getByRole("textbox", { name: "Custom name" }), "!");
    expect(onChange).toHaveBeenLastCalledWith({ $eq: "Thread!" });
    // A parent that does not accept onChange must retain its supplied condition.
    expect(screen.getByRole("button", { name: "Name is Thread" })).toBeTruthy();
    rerender(
      <AppProvider i18n={createI18n()}>
        <DataFilterItem
          {...config}
          render={customRender}
          value={{ $ne: null }}
          onChange={onChange}
        />
      </AppProvider>,
    );
    await waitFor(() => expect(screen.queryByRole("textbox")).toBeNull());
    expect(
      screen.getByRole("button", { name: "Name is not empty" }),
    ).toBeTruthy();
  });

  it("resolves async selected option labels without a toolbar", async () => {
    const resolveSelectedOptions = vi.fn(async () => [
      { label: "Active", value: "active" },
    ]);
    render(
      <DataFilterItem
        field="status"
        label="Status"
        options={async () => []}
        resolveSelectedOptions={resolveSelectedOptions}
        type="select"
        value={{ $in: ["active"] }}
        onChange={vi.fn()}
      />,
    );
    await waitFor(() =>
      expect(resolveSelectedOptions).toHaveBeenCalledWith(["active"]),
    );
    expect(
      await screen.findByRole("button", { name: /Status .*Active/ }),
    ).toBeTruthy();
  });
});

it("keeps a standalone partial range controlled and supports external reset", async () => {
  const user = userEvent.setup();
  const onChange = vi.fn();
  const config: Extract<DataFilterField, { type: "number-input" }> = {
    field: "amount",
    label: "Amount",
    type: "number-input" as const,
    defaultOperator: "$between" as const,
    render: ({ field }) => (
      <input
        aria-label="Minimum"
        value={Array.isArray(field.value) ? (field.value[0] ?? "") : ""}
        onChange={(event) =>
          field.onChange([Number(event.target.value), undefined])
        }
      />
    ),
  };
  const { rerender } = render(
    <DataFilterItem
      {...config}
      value={{ $between: [10, undefined] }}
      onChange={onChange}
    />,
  );
  await user.click(screen.getByRole("button", { name: /Amount/ }));
  expect(
    (screen.getByRole("textbox", { name: "Minimum" }) as HTMLInputElement)
      .value,
  ).toBe("10");
  rerender(
    <AppProvider i18n={createI18n()}>
      <DataFilterItem {...config} value={undefined} onChange={onChange} />
    </AppProvider>,
  );
  await waitFor(() =>
    expect(
      (screen.getByRole("textbox", { name: "Minimum" }) as HTMLInputElement)
        .value,
    ).toBe(""),
  );
  await user.type(screen.getByRole("textbox", { name: "Minimum" }), "5");
  expect(onChange).toHaveBeenLastCalledWith({ $between: [5, undefined] });
});
