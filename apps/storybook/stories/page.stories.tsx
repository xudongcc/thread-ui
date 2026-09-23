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
