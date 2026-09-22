import { useState } from "react";
import { expect, fn } from "storybook/test";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { RadioGroup, RadioGroupItem } from "@/components/thread-ui/radio-group";

const items = [
  { value: "starter", label: "Starter", description: "For personal projects." },
  { value: "team", label: "Team", description: "For collaboration." },
  { value: "enterprise", label: "Enterprise", description: "Contact sales." },
];
const meta = {
  id: "components-radiogroup",
  title: "Forms/RadioGroup",
  component: RadioGroup<string>,
  args: {
    label: "Plan",
    description: "Choose one plan.",
    items,
    defaultValue: "starter",
    onValueChange: fn(),
  },
  parameters: {
    docs: {
      description: {
        component:
          "### Props API\nPass an `items` array to use the default layout. The first example uses this API.\n\n### Composition API\nCompose `RadioGroupItem` children for custom content, omitting `items`. Both APIs support controlled values and disabled options.",
      },
    },
  },
} satisfies Meta<typeof RadioGroup<string>>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  name: "Props API",
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("radio", { name: "Team" }));
    await expect(canvas.getByRole("radio", { name: "Team" })).toBeChecked();
    await expect(
      canvas.getByRole("radio", { name: "Starter" }),
    ).not.toBeChecked();
  },
};
export const Disabled: Story = { args: { disabled: true } };
export const DisabledItem: Story = {
  args: {
    items: items.map((item) => ({
      ...item,
      disabled: item.value === "enterprise",
    })),
  },
};
export const Controlled: Story = {
  render: function Controlled(args) {
    const [value, setValue] = useState("starter");
    return (
      <div className="space-y-4">
        <RadioGroup {...args} value={value} onValueChange={setValue} />
        <output>Selected: {value}</output>
      </div>
    );
  },
};
export const Compound: Story = {
  name: "Composition API",
  parameters: {
    docs: {
      description: {
        story:
          "Compose item children for custom content. Omit `items` in this mode; the Props API example is the default entry point.",
      },
    },
  },
  render: () => (
    <RadioGroup defaultValue="standard" label="Delivery">
      <RadioGroupItem description="Arrives in 3–5 days." value="standard">
        Standard
      </RadioGroupItem>
      <RadioGroupItem description="Arrives tomorrow." value="express">
        Express
      </RadioGroupItem>
    </RadioGroup>
  ),
};
