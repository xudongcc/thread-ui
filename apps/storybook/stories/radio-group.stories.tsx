import { expect, fn } from "storybook/test";
import { ControlledRadioGroupExample } from "./examples/radio-group";
import implementation from "./examples/radio-group.tsx?raw";
import { withExampleSource } from "./utils/example-source";
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
  render: (args) => <ControlledRadioGroupExample {...args} />,
  parameters: { docs: { source: withExampleSource(implementation) } },
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
