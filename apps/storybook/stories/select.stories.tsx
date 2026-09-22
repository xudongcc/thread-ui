import { useState } from "react";
import { expect, fn, within } from "storybook/test";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { Select } from "@/components/thread-ui/select";

const meta = {
  id: "components-select",
  title: "Forms/Select",
  component: Select<string>,
  decorators: [
    (Story) => (
      <div className="w-80 max-w-full">
        <Story />
      </div>
    ),
  ],
  args: {
    label: "Framework",
    placeholder: "Choose a framework",
    description: "Select the framework for your project.",
    items: [
      { label: "React", value: "react" },
      { label: "Vue", value: "vue" },
      { label: "Svelte", value: "svelte" },
    ],
    onValueChange: fn(),
  },
} satisfies Meta<typeof Select<string>>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  name: "Props API",
  // TODO(a11y): color-contrast: placeholder text on the select trigger.
  parameters: { a11y: { test: "todo" } },
};
export const Selected: Story = { args: { defaultValue: "react" } };
export const Disabled: Story = { args: { disabled: true } };
export const Error: Story = {
  // TODO(a11y): color-contrast: placeholder text on the select trigger.
  parameters: { a11y: { test: "todo" } },
  args: { error: "Choose a framework to continue." },
};
export const ChooseOption: Story = {
  play: async ({ args, canvas, canvasElement, userEvent }) => {
    await userEvent.click(canvas.getByRole("combobox", { name: "Framework" }));
    // The popup is portalled outside the story canvas.
    const body = within(canvasElement.ownerDocument.body);
    await userEvent.click(await body.findByRole("option", { name: "Vue" }));
    await expect(canvas.getByRole("combobox")).toHaveTextContent("Vue");
    await expect(args.onValueChange).toHaveBeenCalledWith(
      "vue",
      expect.anything(),
    );
  },
};

export const EmptyOptions: Story = {
  // TODO(a11y): color-contrast: placeholder text on the select trigger.
  parameters: { a11y: { test: "todo" } },
  args: { items: [], placeholder: "No frameworks available" },
};
export const Controlled: Story = {
  // TODO(a11y): color-contrast: placeholder text on the select trigger.
  parameters: { a11y: { test: "todo" } },
  render: function Controlled(args) {
    const [value, setValue] = useState<string | null>(null);
    return (
      <div className="space-y-3">
        <Select {...args} value={value} onValueChange={setValue} />
        <output>Selected: {value || "None"}</output>
      </div>
    );
  },
};
export const Multiple: Story = {
  render: function Multiple() {
    const [value, setValue] = useState<string[]>(["react"]);
    return (
      <Select<string, true>
        multiple
        items={meta.args.items}
        label="Frameworks"
        value={value}
        onValueChange={setValue}
      />
    );
  },
};
