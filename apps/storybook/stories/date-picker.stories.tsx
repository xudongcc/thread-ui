import { useState } from "react";
import { expect, waitFor, within } from "storybook/test";
import type { Meta, StoryObj } from "@storybook/react-vite";
import type { DatePickerProps } from "@/components/thread-ui/date-picker";
import { DatePicker } from "@/components/thread-ui/date-picker";
import { Button } from "@/components/thread-ui/button";

function PickerExample(args: DatePickerProps) {
  const [date, setDate] = useState(args.selected);
  return (
    <div className="space-y-3">
      <DatePicker
        {...args}
        render={<Button variant="outline">Choose date</Button>}
        selected={date}
        onSelect={setDate}
      />
      <output aria-label="Selected date">
        {date
          ? `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`
          : "No date selected"}
      </output>
    </div>
  );
}
const meta = {
  id: "components-datepicker",
  title: "Forms/DatePicker",
  component: DatePicker,
  args: { selected: new Date(2026, 8, 21), today: new Date(2026, 8, 21) },
  argTypes: { selected: { control: false }, render: { control: false } },
  render: PickerExample,
  parameters: {
    docs: {
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
  play: async ({ canvas, canvasElement, userEvent }) => {
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
  },
};
