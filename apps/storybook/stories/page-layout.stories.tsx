import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  PageLayout,
  PageLayoutSection,
} from "@/components/thread-ui/page-layout";

const meta = {
  id: "components-pagelayout",
  title: "Layout/PageLayout",
  component: PageLayout,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "A six-column container-query layout. Sections stack in narrow containers and use full, half, one-third, or two-thirds spans when space allows.",
      },
    },
  },
  render: (args) => (
    <PageLayout {...args}>
      <PageLayoutSection span="2/3">
        <div className="bg-muted rounded-lg border p-6">Main content · 2/3</div>
      </PageLayoutSection>
      <PageLayoutSection span="1/3">
        <div className="bg-muted rounded-lg border p-6">Sidebar · 1/3</div>
      </PageLayoutSection>
      <PageLayoutSection>
        <div className="rounded-lg border p-6">Full-width section</div>
      </PageLayoutSection>
    </PageLayout>
  ),
} satisfies Meta<typeof PageLayout>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  name: "Composition API",
};
export const EqualColumns: Story = {
  render: (args) => (
    <PageLayout {...args}>
      {["Profile", "Notifications"].map((label) => (
        <PageLayoutSection key={label} span="1/2">
          <div className="rounded-lg border p-6">{label}</div>
        </PageLayoutSection>
      ))}
    </PageLayout>
  ),
};
export const ThreeColumns: Story = {
  render: (args) => (
    <PageLayout {...args}>
      {["Overview", "Activity", "Members"].map((label) => (
        <PageLayoutSection key={label} span="1/3">
          <div className="rounded-lg border p-6">{label}</div>
        </PageLayoutSection>
      ))}
    </PageLayout>
  ),
};
