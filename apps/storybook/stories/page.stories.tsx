import { expect, fn, waitFor, within } from "storybook/test";
import { PageLinkActionsExample } from "./examples/page-link-actions";
import linkActionsImplementation from "./examples/page-link-actions.tsx?raw";
import { PagePaginationExample } from "./examples/page";
import paginationImplementation from "./examples/page.tsx?raw";
import { withExampleSource } from "./utils/example-source";
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
          "Responsive page shell with Props and composition APIs. Header props compose the same title, description, breadcrumbs, primary/secondary actions, and pagination components. Secondary actions move into a menu in narrow containers.",
      },
    },
  },
  render: (args) => (
    <Page
      description="Manage your project and team."
      primaryAction={{ label: "Save", onAction: fn() }}
      title="Project settings"
      breadcrumbActions={[
        { label: "Projects", render: <a href="#projects" /> },
        { label: "Thread UI", render: <a href="#project" /> },
      ]}
      secondaryActions={[
        { label: "Duplicate", onAction: fn() },
        { label: "Export", onAction: fn() },
        { label: "Archive", disabled: true },
        { label: "Delete", destructive: true, onAction: fn() },
      ]}
      {...args}
    >
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
    </Page>
  ),
} satisfies Meta<typeof Page>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  name: "Props API",
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
export const Composition: Story = {
  name: "Composition API",
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
      source: withExampleSource(paginationImplementation),
      description: {
        story:
          "Navigate between product details with a shadcn ButtonGroup after the primary action. The group is hidden below 672px of Page content width, alongside the existing responsive action layout. Use the viewport toolbar to check mobile behavior.",
      },
    },
  },
  render: (args) => <PagePaginationExample {...args} />,
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

export const LinkActions: Story = {
  parameters: {
    docs: {
      source: withExampleSource(linkActionsImplementation),
      description: {
        story:
          "ReactNode headings and link actions using Base UI render elements and functions. Secondary links also work in the narrow-page overflow menu.",
      },
    },
  },
  render: (args) => <PageLinkActionsExample {...args} />,
};
