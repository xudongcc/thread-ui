import { expect, userEvent, waitFor, within } from "storybook/test";
import { testOnly } from "./utils/test-only";
import {
  LayoutExample,
  LayoutOrdersExample,
  LayoutSplitPageExample,
} from "./examples/layout";
import implementation from "./examples/layout.tsx?raw";
import { withExampleSource } from "./utils/example-source";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Layout } from "@/components/thread-ui/layout";

const meta = {
  id: "components-layout",
  title: "Layout/Layout",
  component: Layout,
  args: { brand: "Thread UI" },
  argTypes: {
    navigation: { control: false },
    sidebar: { control: false },
    sidebarFooter: { control: false },
    search: { control: false },
    actions: { control: false },
    topbarMenu: { control: false },
    children: { control: false },
  },
  render: (args) => <LayoutExample {...args} />,
  parameters: {
    layout: "fullscreen",
    docs: {
      source: withExampleSource(implementation),
      story: { inline: false, height: "720px" },
      description: {
        component:
          "Responsive application layout with a top bar, sidebar navigation, and independently scrolling content. The sidebar stays visible on desktop and opens as a drawer on mobile. Supports custom navigation, header actions, and a workspace/account menu.",
      },
    },
  },
} satisfies Meta<typeof Layout>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { name: "Props API" };
export const SplitPage: Story = {
  name: "Two-column detail page",
  render: (args) => <LayoutSplitPageExample {...args} />,
  globals: { locale: "en" },
  parameters: {
    docs: {
      description: {
        story:
          "Layout + Page + PageLayout: a two-thirds collection editor and a one-third settings column. Sections stack on narrow screens. Edit fields, add/remove products, save changes, or discard changes using in-memory state.",
      },
    },
  },
  play: testOnly(async ({ canvas, canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body);
    const title = canvas.getByRole("textbox", { name: "Title" });
    await userEvent.clear(title);
    await userEvent.type(title, "Weekend essentials");
    await expect(
      await canvas.findByRole("heading", {
        name: "Weekend essentials",
      }),
    ).toBeVisible();
    await userEvent.click(canvas.getByRole("button", { name: "Add product" }));
    await expect(
      await canvas.findByRole("heading", { name: "Oak serving tray" }),
    ).toBeVisible();
    await userEvent.click(canvas.getByRole("button", { name: "Save" }));
    await expect(canvas.getByRole("status")).toHaveTextContent(
      "Collection saved",
    );
    await expect(canvas.getByRole("button", { name: "Save" })).toBeDisabled();
    await userEvent.type(title, " draft");
    const inlineDiscard = canvas.queryByRole("button", {
      name: "Discard changes",
    });
    if (inlineDiscard) await userEvent.click(inlineDiscard);
    else {
      await userEvent.click(
        canvas.getByRole("button", { name: "More actions" }),
      );
      await userEvent.click(
        await body.findByRole("menuitem", { name: "Discard changes" }),
      );
    }
    await expect(title).toHaveValue("Weekend essentials");
  }),
};
export const PageAndDataTable: Story = {
  name: "Page + DataTable + DataFilter",
  render: (args) => <LayoutOrdersExample {...args} />,
  globals: { locale: "en" },
  parameters: {
    docs: {
      description: {
        story:
          "A complete orders page inside Layout, with Page header/actions, DataFilter search/fulfillment/amount filters, and a DataTable. Filtering, pagination, selection, fulfillment, and creation work with in-memory sample data. Narrow screens keep horizontal scrolling inside the table and move secondary page actions into a menu.",
      },
    },
  },
  play: testOnly(async ({ canvas, canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body);
    await expect(canvas.getByRole("heading", { name: "Orders" })).toBeVisible();
    await expect(canvas.getByText("#1001")).toBeVisible();
    await userEvent.click(canvas.getByRole("button", { name: "Next page" }));
    await expect(canvas.getByText("#1009")).toBeVisible();
    await expect(canvas.queryByText("#1001")).not.toBeInTheDocument();
    const search = canvas.getByRole("textbox", { name: "Search orders" });
    await userEvent.type(search, "1001{Enter}");
    await expect(canvas.getByText("#1001")).toBeVisible();
    await expect(
      canvas.getByRole("button", { name: "Next page" }),
    ).toBeDisabled();
    await expect(
      canvas.getByRole("button", { name: "Previous page" }),
    ).toBeDisabled();
    await userEvent.click(
      within(canvas.getByRole("row", { name: /#1001/ })).getByRole("checkbox"),
    );
    await userEvent.click(
      canvas.getByRole("button", { name: "Mark fulfilled" }),
    );
    await expect(
      within(canvas.getByRole("row", { name: /#1001/ })).getByText(
        "Fulfilled",
        { exact: true },
      ),
    ).toBeVisible();
    await userEvent.clear(search);
    await userEvent.type(search, "no matching orders{Enter}");
    await expect(canvas.queryByText("#1001")).not.toBeInTheDocument();
    await userEvent.click(canvas.getByRole("button", { name: "Create order" }));
    await expect(canvas.getByText("#1025")).toBeVisible();
    await expect(
      canvas.getByRole("textbox", { name: "Search orders" }),
    ).toHaveValue("");
    await expect(
      canvas.getByRole("button", { name: "Next page" }),
    ).toBeEnabled();
    await userEvent.click(canvas.getByRole("button", { name: "Add Filter" }));
    await userEvent.click(
      await body.findByRole("menuitem", { name: "Fulfillment" }),
    );
    await userEvent.click(
      await body.findByRole("option", { name: "Unfulfilled" }),
    );
    await userEvent.keyboard("{Escape}");
    await expect(canvas.getByText("#1004")).toBeVisible();
    await expect(canvas.queryByText("#1002")).not.toBeInTheDocument();
    await userEvent.click(canvas.getByRole("button", { name: "Add Filter" }));
    await userEvent.click(
      await body.findByRole("menuitem", { name: "Amount" }),
    );
    await userEvent.type(
      await body.findByRole("textbox", { name: "Amount" }),
      "100{Enter}",
    );
    await userEvent.keyboard("{Escape}");
    await expect(canvas.getByText("#1007")).toBeVisible();
    await expect(canvas.queryByText("#1004")).not.toBeInTheDocument();
    await expect(canvas.queryByText("#1025")).not.toBeInTheDocument();
    const reset = canvas.queryByRole("button", { name: "Reset filters" });
    if (reset) await userEvent.click(reset);
    else {
      await userEvent.click(
        canvas.getByRole("button", { name: "More actions" }),
      );
      await userEvent.click(
        await body.findByRole("menuitem", { name: "Reset filters" }),
      );
    }
    await expect(canvas.getByText("#1025")).toBeVisible();
    await expect(canvas.getByText("#1002")).toBeVisible();
    // Wait for portaled filter/menu exit transitions before the a11y audit.
    await waitFor(() => {
      expect(
        canvasElement.ownerDocument.querySelectorAll(
          "[data-base-ui-focus-guard]",
        ).length,
      ).toBe(0);
    });
  }),
};
