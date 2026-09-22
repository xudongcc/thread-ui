import { useState } from "react";
import { expect } from "storybook/test";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { Textarea } from "@/components/thread-ui/textarea";

const meta = {
  id: "components-textarea",
  title: "Forms/Textarea",
  component: Textarea,
  decorators: [
    (Story) => (
      <div className="w-80 max-w-full">
        <Story />
      </div>
    ),
  ],
  args: {
    label: "Description",
    placeholder: "Describe your project",
    description: "Include the project goals and timeline.",
    rows: 4,
  },
} satisfies Meta<typeof Textarea>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  name: "Props API",
};
export const Disabled: Story = { args: { disabled: true } };
export const Error: Story = {
  // TODO(a11y): color-contrast: destructive textarea text on the field background.
  parameters: { a11y: { test: "todo" } },
  args: { error: "Description is required.", defaultValue: "invalid" },
  play: async ({ canvas }) => {
    const input = canvas.getByRole("textbox", { name: "Description" });
    await expect(input).toHaveAttribute("aria-invalid", "true");
    await expect(input).toHaveAccessibleDescription("Description is required.");
  },
};
export const Typing: Story = {
  play: async ({ canvas, userEvent }) => {
    const input = canvas.getByRole("textbox", { name: "Description" });
    await userEvent.type(input, "First line\nSecond line");
    await expect(input).toHaveValue("First line\nSecond line");
  },
};

export const ReadOnly: Story = {
  args: {
    readOnly: true,
    defaultValue: "This description is managed by your administrator.",
  },
};
export const Controlled: Story = {
  render: function Controlled(args) {
    const [value, setValue] = useState("");
    return (
      <div className="space-y-3">
        <Textarea
          {...args}
          value={value}
          onChange={(event) => setValue(event.target.value)}
        />
        <output>{value.length} characters</output>
      </div>
    );
  },
};
