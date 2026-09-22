import { Plus } from "lucide-react";
import { expect, fn } from "storybook/test";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { Button } from "@/components/thread-ui/button";

const meta = {
  id: "components-button",
  title: "Actions/Button",
  component: Button,
  args: { children: "Save changes", onClick: fn() },
  argTypes: {
    loading: { control: "boolean" },
    disabled: { control: "boolean" },
    variant: {
      control: "select",
      options: [
        "default",
        "outline",
        "secondary",
        "ghost",
        "destructive",
        "link",
      ],
    },
    size: { control: "select", options: ["xs", "sm", "default", "lg"] },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  name: "Props API",
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Save changes" }));
    await expect(args.onClick).toHaveBeenCalledOnce();
  },
};

export const Loading: Story = {
  args: { loading: true },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("button")).toBeDisabled();
  },
};

export const Disabled: Story = { args: { disabled: true } };

export const Variants: Story = {
  render: (args) => (
    <div className="flex flex-wrap gap-3">
      {(
        [
          "default",
          "outline",
          "secondary",
          "ghost",
          "destructive",
          "link",
        ] as const
      ).map((variant) => (
        <Button key={variant} {...args} variant={variant}>
          {variant}
        </Button>
      ))}
    </div>
  ),
};

export const Sizes: Story = {
  render: (args) => (
    <div className="flex flex-wrap items-center gap-3">
      {(["xs", "sm", "default", "lg"] as const).map((size) => (
        <Button key={size} {...args} size={size}>
          {size}
        </Button>
      ))}
    </div>
  ),
};
export const WithIcon: Story = {
  args: {
    children: (
      <>
        <Plus />
        Create project
      </>
    ),
  },
};
export const IconOnly: Story = {
  args: { children: <Plus />, size: "icon", "aria-label": "Create project" },
};
