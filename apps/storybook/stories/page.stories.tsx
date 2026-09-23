import { useState } from "react";
import { expect, fn, waitFor, within } from "storybook/test";
import { testOnly } from "./utils/test-only";
import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  BreadcrumbAction,
  BreadcrumbActions,
  Page,
  PageActions,
  PageContent,
  PageDescription,
  PageHeader,
  PageNextAction,
  PagePagination,
  PagePreviousAction,
  PagePrimaryAction,
  PageSecondaryAction,
  PageTitle,
} from "@/components/thread-ui/page";
import { Input } from "@/components/thread-ui/input";
import { FormLayout, FormLayoutItem } from "@/components/thread-ui/form-layout";
import { Card, CardContent } from "@/components/ui/card";

const meta = {
  id: "components-page",
  title: "Layout/Page",
  component: Page,
  args: { variant: "default" },
  argTypes: {
    variant: { control: "select", options: ["default", "compact", "full"] },
  },
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Responsive page shell with title, description, single-parent or multi-level breadcrumb navigation, primary action, and secondary actions that move into a menu in narrow containers.",
      },
    },
  },
  render: (args) => (
    <Page {...args}>
      <PageHeader>
        <BreadcrumbActions>
          <BreadcrumbAction render={<a href="#projects" />}>
            Projects
          </BreadcrumbAction>
          <BreadcrumbAction render={<a href="#project" />}>
            Thread UI
          </BreadcrumbAction>
        </BreadcrumbActions>
        <PageTitle>Project settings</PageTitle>
        <PageDescription>Manage your project and team.</PageDescription>
        <PageActions>
          <PagePrimaryAction onClick={fn()}>Save</PagePrimaryAction>
          <PageSecondaryAction onAction={fn()}>Duplicate</PageSecondaryAction>
          <PageSecondaryAction onAction={fn()}>Export</PageSecondaryAction>
          <PageSecondaryAction disabled>Archive</PageSecondaryAction>
          <PageSecondaryAction destructive onAction={fn()}>
            Delete
          </PageSecondaryAction>
        </PageActions>
      </PageHeader>
      <PageContent>
        <Card>
          <CardContent>
            <FormLayout>
              <FormLayoutItem>
                <Input defaultValue="Thread UI" label="Project name" />
              </FormLayoutItem>
              <FormLayoutItem>
                <Input
                  defaultValue="A component library for product teams."
                  label="Description"
                />
              </FormLayoutItem>
            </FormLayout>
          </CardContent>
        </Card>
      </PageContent>
    </Page>
  ),
} satisfies Meta<typeof Page>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  name: "Composition API",
  play: testOnly(async ({ canvas, canvasElement, userEvent, globals }) => {
    const body = within(canvasElement.ownerDocument.body);
    const trigger = canvas.getByRole("button", {
      name: globals.locale === "zh" ? "上级页面" : "Parent pages",
    });
    await userEvent.click(trigger);
    await expect(
      await body.findByRole("menuitem", { name: "Projects" }),
    ).toHaveAttribute("href", "#projects");
    await expect(
      body.getByRole("menuitem", { name: "Thread UI" }),
    ).toHaveAttribute("href", "#project");
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(trigger).toHaveFocus());
  }),
};
export const Compact: Story = { args: { variant: "compact" } };
export const FullWidth: Story = { args: { variant: "full" } };

export const SingleParent: Story = {
  render: (args) => (
    <Page {...args}>
      <PageHeader>
        <BreadcrumbActions>
          <BreadcrumbAction render={<a href="#projects" />}>
            Projects
          </BreadcrumbAction>
        </BreadcrumbActions>
        <PageTitle>Thread UI</PageTitle>
        <PageDescription>
          A single parent is a direct back link.
        </PageDescription>
      </PageHeader>
      <PageContent>
        <Card>
          <CardContent>Project overview</CardContent>
        </Card>
      </PageContent>
    </Page>
  ),
};

export const LongTitle: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "The title truncates within the header while actions stay visible. The description spans a separate row and wraps at every viewport size.",
      },
    },
  },
  render: (args) => (
    <Page {...args}>
      <PageHeader>
        <BreadcrumbActions>
          <BreadcrumbAction render={<a href="#products" />}>
            Products
          </BreadcrumbAction>
          <BreadcrumbAction render={<a href="#collection" />}>
            Autumn collection
          </BreadcrumbAction>
        </BreadcrumbActions>
        <PageTitle>
          Edit product — Limited edition organic cotton oversized blue T-shirt
        </PageTitle>
        <PageDescription>
          Manage product details, pricing, and availability across your sales
          channels.
        </PageDescription>
        <PageActions>
          <PagePrimaryAction onClick={fn()}>Save</PagePrimaryAction>
          <PageSecondaryAction onAction={fn()}>Preview</PageSecondaryAction>
          <PageSecondaryAction destructive onAction={fn()}>
            Delete
          </PageSecondaryAction>
        </PageActions>
      </PageHeader>
      <PageContent>
        <Card>
          <CardContent>Product details</CardContent>
        </Card>
      </PageContent>
    </Page>
  ),
};

export const Pagination: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Navigate between product details with a shadcn ButtonGroup after the primary action. The group is hidden below 768px of Page content width, alongside the existing responsive action layout. Use the viewport toolbar to check mobile behavior.",
      },
    },
  },
  render: function Render(args) {
    const products = [
      "Leather pet collar",
      "Cotton pet harness",
      "Travel pet carrier",
    ];
    const [index, setIndex] = useState(0);
    return (
      <Page {...args}>
        <PageHeader>
          <BreadcrumbActions>
            <BreadcrumbAction render={<a href="#products" />}>
              Products
            </BreadcrumbAction>
          </BreadcrumbActions>
          <PageTitle>{products[index]}</PageTitle>
          <PageDescription>
            Review product details and move between products.
          </PageDescription>
          <PageActions>
            <PageSecondaryAction onAction={fn()}>Preview</PageSecondaryAction>
            <PagePrimaryAction onClick={fn()}>Save</PagePrimaryAction>
            <PagePagination>
              <PagePreviousAction
                disabled={index === 0}
                onClick={() => setIndex((current) => Math.max(0, current - 1))}
              />
              <PageNextAction
                disabled={index === products.length - 1}
                onClick={() =>
                  setIndex((current) =>
                    Math.min(products.length - 1, current + 1),
                  )
                }
              />
            </PagePagination>
          </PageActions>
        </PageHeader>
        <PageContent>
          <Card>
            <CardContent>{products[index]} — product details</CardContent>
          </Card>
        </PageContent>
      </Page>
    );
  },
  play: testOnly(async ({ canvas, userEvent, globals }) => {
    const previous = canvas.queryByRole("button", {
      name: globals.locale === "zh" ? "上一项" : "Previous item",
    });
    // Pagination intentionally has no focusable controls in narrow pages.
    if (!previous) {
      await expect(canvas.getByRole("button", { name: "Save" })).toBeVisible();
      return;
    }
    const next = canvas.getByRole("button", {
      name: globals.locale === "zh" ? "下一项" : "Next item",
    });
    await expect(previous).toBeDisabled();
    await userEvent.click(next);
    await expect(
      canvas.getByRole("heading", { name: "Cotton pet harness" }),
    ).toBeVisible();
    await userEvent.click(next);
    await expect(next).toBeDisabled();
    await userEvent.click(previous);
    await expect(
      canvas.getByRole("heading", { name: "Cotton pet harness" }),
    ).toBeVisible();
  }),
};
