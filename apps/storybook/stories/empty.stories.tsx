import { Inbox, Plus } from "lucide-react";
import { expect, fn } from "storybook/test";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Empty } from "@/components/thread-ui/empty";
import { Button } from "@/components/thread-ui/button";

const createProject = fn();
const meta = {
  id: "components-empty",
  title: "Display/Empty",
  component: Empty,
  args: {
    title: "No projects yet",
    description: "Create your first project to start collaborating.",
    icon: <Inbox />,
  },
  parameters: {
    docs: {
      description: {
        component:
          "An empty state with optional icon, description, and primary/secondary actions. Actions accept a props object or a React element.",
      },
    },
  },
} satisfies Meta<typeof Empty>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  name: "Props API",
};
export const WithActions: Story = {
  args: {
    primaryAction: {
      label: "Create project",
      icon: <Plus />,
      onClick: createProject,
    },
    secondaryAction: { label: "Learn more", onClick: fn() },
  },
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(
      canvas.getByRole("button", { name: "Create project" }),
    );
    await expect(createProject).toHaveBeenCalledOnce();
  },
};
export const CustomAction: Story = {
  args: {
    primaryAction: (
      <Button variant="outline" onClick={fn()}>
        Import project
      </Button>
    ),
  },
};
export const Minimal: Story = {
  args: { icon: undefined, description: undefined, title: "No results" },
};
