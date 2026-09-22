import { useState } from "react";
import { expect } from "storybook/test";
import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ComponentProps } from "react";
import { Calendar } from "@/components/thread-ui/calendar";

const referenceDate = new Date(2026, 8, 21);
function SingleCalendar(args: ComponentProps<typeof Calendar>) {
  const [date, setDate] = useState<Date | undefined>(referenceDate);
  return (
    <Calendar {...args} mode="single" selected={date} onSelect={setDate} />
  );
}
const meta = {
  id: "components-calendar",
  title: "Forms/Calendar",
  component: Calendar,
  args: {
    defaultMonth: referenceDate,
    today: referenceDate,
    className: "rounded-md border",
  },
  render: SingleCalendar,
  parameters: {
    docs: {
      description: {
        component:
          "Localized calendar supporting single, multiple, and range selection. Example dates are fixed for reproducible previews; use the language toolbar to inspect translations.",
      },
    },
  },
} satisfies Meta<typeof Calendar>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  name: "Props API",
  play: async ({ canvas, globals }) => {
    await expect(
      canvas.getByRole("button", {
        name: globals.locale === "zh" ? /2026年9月22日/ : /September 22, 2026/,
      }),
    ).toBeVisible();
  },
};
export const DisabledDates: Story = {
  args: { disabled: { before: referenceDate } },
};
export const DropdownCaption: Story = {
  args: {
    captionLayout: "dropdown",
    startMonth: new Date(2020, 0),
    endMonth: new Date(2030, 11),
  },
};
export const Range: Story = {
  render: function Range(args) {
    const [range, setRange] = useState<
      { from: Date | undefined; to?: Date } | undefined
    >({
      from: referenceDate,
      to: new Date(2026, 8, 25),
    });
    return (
      <Calendar
        {...args}
        mode="range"
        numberOfMonths={2}
        selected={range}
        onSelect={setRange}
      />
    );
  },
};
export const Multiple: Story = {
  render: function Multiple(args) {
    const [dates, setDates] = useState<Date[] | undefined>([
      referenceDate,
      new Date(2026, 8, 23),
    ]);
    return (
      <Calendar
        {...args}
        mode="multiple"
        selected={dates}
        onSelect={setDates}
      />
    );
  },
};
