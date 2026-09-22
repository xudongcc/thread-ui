import { useState } from "react";
import { expect } from "storybook/test";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { Input } from "@/components/thread-ui/input";

const meta = {
  id: "components-input",
  title: "Forms/Input",
  component: Input,
  decorators: [
    (Story) => (
      <div className="w-80 max-w-full">
        <Story />
      </div>
    ),
  ],
  args: {
    label: "Email",
    placeholder: "you@example.com",
    description: "We will use this address for notifications.",
    type: "email",
  },
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  name: "Props API",
};
export const Disabled: Story = { args: { disabled: true } };
export const Error: Story = {
  // TODO(a11y): color-contrast: destructive input text on the field background.
  parameters: { a11y: { test: "todo" } },
  args: { error: "Enter a valid email address.", defaultValue: "invalid" },
  play: async ({ canvas }) => {
    const input = canvas.getByRole("textbox", { name: "Email" });
    await expect(input).toHaveAttribute("aria-invalid", "true");
    await expect(input).toHaveAccessibleDescription(
      "Enter a valid email address.",
    );
  },
};
export const Typing: Story = {
  play: async ({ canvas, userEvent }) => {
    const input = canvas.getByRole("textbox", { name: "Email" });
    await userEvent.type(input, "hello@example.com");
    await expect(input).toHaveValue("hello@example.com");
  },
};

export const WithoutLabel: Story = {
  args: { label: undefined, "aria-label": "Email" },
};
export const Types: Story = {
  render: () => (
    <div className="w-80 max-w-full space-y-4">
      <Input defaultValue="secret" label="Password" type="password" />
      <Input label="Search" placeholder="Search projects..." type="search" />
      <Input label="Website" placeholder="https://example.com" type="url" />
    </div>
  ),
};
export const Controlled: Story = {
  render: function Controlled(args) {
    const [value, setValue] = useState("");
    return (
      <div className="space-y-3">
        <Input
          {...args}
          value={value}
          onChange={(event) => setValue(event.target.value)}
        />
        <output>{value || "Empty"}</output>
      </div>
    );
  },
};
