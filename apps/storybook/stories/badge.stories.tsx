import type { Meta, StoryObj } from "@storybook/react-vite";
import { Badge } from "@/components/thread-ui/badge";

const colors = [
  "red",
  "orange",
  "amber",
  "yellow",
  "lime",
  "green",
  "emerald",
  "teal",
  "cyan",
  "sky",
  "blue",
  "indigo",
  "violet",
  "purple",
  "fuchsia",
  "pink",
  "rose",
  "slate",
  "gray",
  "zinc",
  "neutral",
  "stone",
] as const;
const meta = {
  id: "components-badge",
  title: "Display/Badge",
  component: Badge,
  args: { children: "Published" },
  argTypes: {
    color: { control: "select", options: colors },
    variant: {
      control: "select",
      options: [
        "default",
        "secondary",
        "destructive",
        "outline",
        "ghost",
        "link",
      ],
    },
  },
  parameters: {
    docs: {
      description: {
        component:
          "Status labels with semantic variants and a complete light/dark color palette.",
      },
    },
  },
} satisfies Meta<typeof Badge>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  name: "Props API",
};
export const Colors: Story = {
  render: (args) => (
    <div className="flex max-w-2xl flex-wrap gap-3">
      {colors.map((color) => (
        <Badge key={color} {...args} color={color}>
          {color}
        </Badge>
      ))}
    </div>
  ),
};
export const Variants: Story = {
  // TODO(a11y): color-contrast: destructive badge text on its tinted background.
  parameters: { a11y: { test: "todo" } },
  render: (args) => (
    <div className="flex flex-wrap gap-3">
      {(
        [
          "default",
          "secondary",
          "destructive",
          "outline",
          "ghost",
          "link",
        ] as const
      ).map((variant) => (
        <Badge key={variant} {...args} variant={variant}>
          {variant}
        </Badge>
      ))}
    </div>
  ),
};
export const LongLabel: Story = {
  args: { color: "amber", children: "Waiting for administrator approval" },
};
