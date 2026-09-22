import { expect } from "storybook/test";
import {
  MultipleCalendar,
  RangeCalendar,
  SingleCalendar,
} from "./examples/calendar";
import implementation from "./examples/calendar.tsx?raw";
import { withExampleSource } from "./utils/example-source";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Calendar } from "@/components/thread-ui/calendar";

const referenceDate = new Date(2026, 8, 21);
const meta = {
  id: "components-calendar",
  title: "Forms/Calendar",
  component: Calendar,
  args: {
    defaultMonth: referenceDate,
    today: referenceDate,
    className: "rounded-md border",
  },
  render: (args) => <SingleCalendar {...args} />,
  parameters: {
    docs: {
      source: withExampleSource(implementation),
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
  render: (args) => <RangeCalendar {...args} />,
};
export const Multiple: Story = {
  render: (args) => <MultipleCalendar {...args} />,
};
