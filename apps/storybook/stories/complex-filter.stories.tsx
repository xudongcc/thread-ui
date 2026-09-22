import { expect } from "storybook/test";
import { testOnly } from "./utils/test-only";
import { FilterExample, filters } from "./examples/complex-filter";
import implementation from "./examples/complex-filter.tsx?raw";
import { withExampleParameters } from "./utils/example-source";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { ComplexFilter } from "@/components/thread-ui/complex-filter";

const exampleParameters = withExampleParameters(implementation, { filters }, [
  "filters",
]);

const meta = {
  id: "components-complexfilter",
  title: "Data/ComplexFilter",
  component: ComplexFilter<"object">,
  args: { filters, showClearAll: true },
  // Custom editor/filter functions are fixed fixtures; other props remain editable.
  argTypes: { value: { control: false }, filters: { control: false } },
  parameters: {
    ...exampleParameters,
    layout: "padded",
    docs: {
      ...exampleParameters.docs,
      description: {
        component:
          "Build nested AND/OR condition groups with custom value editors. Examples expose the resulting object, including nested groups and date/number values.",
      },
    },
  },
  render: (args) => <FilterExample {...args} />,
} satisfies Meta<typeof ComplexFilter<"object">>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  name: "Props API",
  args: { value: { $and: [{ name: { $eq: "Thread" } }] } },
};
export const Empty: Story = {};
export const NestedGroups: Story = {
  args: {
    value: {
      $and: [
        { name: { $fulltext: "Thread" } },
        { $or: [{ amount: { $gte: 100 } }, { amount: { $lt: 10 } }] },
      ],
    },
  },
};
export const DateCondition: Story = {
  args: { value: { $and: [{ date: { $gte: "2026-09-21T00:00:00.000Z" } }] } },
};
export const WithoutClearAll: Story = {
  args: { showClearAll: false, value: { $and: [{ name: { $eq: "Thread" } }] } },
};
export const ClearAll: Story = {
  globals: { locale: "en" },
  args: { value: { $and: [{ name: { $eq: "Thread" } }] } },
  play: testOnly(async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: /clear all/i }));
    await expect(canvas.getByLabelText("Filter value")).not.toHaveTextContent(
      "Thread",
    );
  }),
};
