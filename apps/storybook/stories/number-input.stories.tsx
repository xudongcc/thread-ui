import { expect } from "storybook/test";
import { ControlledNumberInputExample } from "./examples/number-input";
import implementation from "./examples/number-input.tsx?raw";
import { withExampleSource } from "./utils/example-source";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { NumberInput } from "@/components/thread-ui/number-input";

const meta = {
  id: "components-numberinput",
  title: "Forms/NumberInput",
  component: NumberInput,
  args: {
    "aria-label": "Amount",
    placeholder: "Enter an amount",
    className: "w-72 max-w-full",
  },
  parameters: {
    docs: {
      description: {
        component:
          "Formatted numeric input. Use onValueChange to access the raw string or floatValue; prefixes, suffixes, and decimal precision affect display only.",
      },
    },
  },
} satisfies Meta<typeof NumberInput>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  name: "Props API",
};
export const Currency: Story = {
  args: {
    prefix: "$",
    thousandSeparator: true,
    decimalScale: 2,
    fixedDecimalScale: true,
    defaultValue: 1250.5,
  },
};
export const Percentage: Story = {
  args: { suffix: "%", decimalScale: 2, defaultValue: 12.5 },
};
export const Integer: Story = {
  args: { decimalScale: 0, allowNegative: false, defaultValue: 10 },
};
export const Disabled: Story = { args: { disabled: true, defaultValue: 42 } };
export const Controlled: Story = {
  render: (args) => <ControlledNumberInputExample {...args} />,
  parameters: { docs: { source: withExampleSource(implementation) } },
  play: async ({ canvas, userEvent }) => {
    await userEvent.type(
      canvas.getByRole("textbox", { name: "Amount" }),
      "1234",
    );
    await expect(canvas.getByRole("textbox")).toHaveValue("1,234");
    await expect(canvas.getByLabelText("Raw value")).toHaveTextContent("1234");
  },
};
