import { DateInputExample } from "./examples/date-input";
import implementation from "./examples/date-input.tsx?raw";
import { withExampleSource } from "./utils/example-source";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { DateInput } from "@/components/thread-ui/date-input";

const meta = {
  id: "components-dateinput",
  title: "Forms/DateInput",
  component: DateInput,
  args: {
    label: "Due date",
    placeholder: "Choose a date",
    description: "Select a delivery date.",
    className: "w-80 max-w-full",
    today: new Date(2026, 8, 21),
  },
  render: (args) => <DateInputExample {...args} />,
  argTypes: { selected: { control: false } },
  parameters: {
    docs: {
      source: withExampleSource(implementation),
      description: {
        component:
          "A labeled date picker field with placeholder, formatting, description, and accessible validation errors. Selection is controlled through selected/onSelect.",
      },
    },
  },
} satisfies Meta<typeof DateInput>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  name: "Props API",
  // TODO(a11y): color-contrast: placeholder text on the date trigger.
  parameters: { a11y: { test: "todo" } },
};
export const Selected: Story = { args: { selected: new Date(2026, 8, 21) } };
export const CustomFormat: Story = {
  args: { selected: new Date(2026, 8, 21), format: "MMM D, YYYY" },
};
export const Disabled: Story = {
  args: { disabled: true, selected: new Date(2026, 8, 21) },
};
export const Error: Story = {
  // TODO(a11y): color-contrast: placeholder text on the date trigger.
  parameters: { a11y: { test: "todo" } },
  args: { error: "A due date is required." },
};
