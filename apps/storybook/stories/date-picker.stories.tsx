import { expect, waitFor, within } from "storybook/test";
import { testOnly } from "./utils/test-only";
import { PickerExample } from "./examples/date-picker";
import implementation from "./examples/date-picker.tsx?raw";
import { withExampleSource } from "./utils/example-source";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { DatePicker } from "@/components/thread-ui/date-picker";

const meta = {
  id: "components-datepicker",
  title: "Forms/DatePicker",
  component: DatePicker,
  args: { selected: new Date(2026, 8, 21), today: new Date(2026, 8, 21) },
  argTypes: { selected: { control: false }, render: { control: false } },
  render: (args) => <PickerExample {...args} />,
  parameters: {
    docs: {
      source: withExampleSource(implementation),
      description: {
        component:
          "A single-date calendar in a popover. Provide a trigger with render and update selected in onSelect; the popup closes after selection.",
      },
    },
  },
} satisfies Meta<typeof DatePicker>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  name: "Props API",
};
export const Empty: Story = { args: { selected: undefined } };
export const DisabledDates: Story = {
  args: { disabled: { before: new Date(2026, 8, 21) } },
};
export const AlignEnd: Story = { args: { align: "end" } };
export const SelectDate: Story = {
  globals: { locale: "en" },
  play: testOnly(async ({ canvas, canvasElement, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Choose date" }));
    const body = within(canvasElement.ownerDocument.body);
    await userEvent.click(
      await body.findByRole("button", { name: /September 22, 2026/ }),
    );
    await expect(canvas.getByLabelText("Selected date")).toHaveTextContent(
      "2026-9-22",
    );
    await waitFor(() =>
      expect(body.queryByRole("dialog")).not.toBeInTheDocument(),
    );
  }),
};
