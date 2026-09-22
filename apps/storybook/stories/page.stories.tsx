import { fn } from "storybook/test";
import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  Page,
  PageActions,
  PageBackAction,
  PageContent,
  PageDescription,
  PageHeader,
  PagePrimaryAction,
  PageSecondaryAction,
  PageTitle,
} from "@/components/thread-ui/page";
import { Input } from "@/components/thread-ui/input";
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
          "Responsive page shell with title, description, back navigation, primary action, and secondary actions that move into a menu in narrow containers.",
      },
    },
  },
  render: (args) => (
    <Page {...args}>
      <PageHeader>
        <PageBackAction onClick={fn()} />
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
          <CardContent className="space-y-4">
            <Input defaultValue="Thread UI" label="Project name" />
            <Input
              defaultValue="A component library for product teams."
              label="Description"
            />
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
};
export const Compact: Story = { args: { variant: "compact" } };
export const FullWidth: Story = { args: { variant: "full" } };
