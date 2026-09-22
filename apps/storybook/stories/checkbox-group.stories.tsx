import { expect, fn } from "storybook/test";
import { ControlledCheckboxGroupExample } from "./examples/checkbox-group";
import implementation from "./examples/checkbox-group.tsx?raw";
import { withExampleSource } from "./utils/example-source";
import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  CheckboxGroup,
  CheckboxGroupItem,
} from "@/components/thread-ui/checkbox-group";

const items = [
  { value: "read", label: "Read", description: "View project content." },
  { value: "write", label: "Write", description: "Edit project content." },
  { value: "delete", label: "Delete" },
];
const meta = {
  id: "components-checkboxgroup",
  title: "Forms/CheckboxGroup",
  component: CheckboxGroup<string>,
  args: { label: "Permissions", items, onValueChange: fn() },
  parameters: {
    docs: {
      description: {
        component:
          "### Props API\nPass an `items` array to use the default layout. The first example uses this API.\n\n### Composition API\nCompose `CheckboxGroupItem` children for custom content, omitting `items`. Both APIs support controlled values and disabled options.",
      },
    },
  },
} satisfies Meta<typeof CheckboxGroup<string>>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  name: "Props API",
};
export const Selected: Story = { args: { defaultValue: ["read"] } };
export const Disabled: Story = {
  args: { disabled: true, defaultValue: ["read"] },
};
export const DisabledItem: Story = {
  args: {
    items: items.map((item) => ({
      ...item,
      disabled: item.value === "delete",
    })),
  },
};
export const Parent: Story = {
  args: { parent: { label: "All permissions" }, defaultValue: ["read"] },
  play: async ({ canvas, userEvent }) => {
    const parent = canvas.getByRole("checkbox", { name: "All permissions" });
    await expect(parent).toBePartiallyChecked();
    await userEvent.click(parent);
    for (const item of items)
      await expect(
        canvas.getByRole("checkbox", { name: item.label }),
      ).toBeChecked();
  },
};
export const Controlled: Story = {
  render: (args) => <ControlledCheckboxGroupExample {...args} />,
  parameters: { docs: { source: withExampleSource(implementation) } },
};
export const Compound: Story = {
  name: "Composition API",
  parameters: {
    docs: {
      description: {
        story:
          "Compose item children for custom content. Omit `items` in this mode; the Props API example is the default entry point.",
      },
    },
  },
  render: () => (
    <CheckboxGroup allValues={["email", "sms"]} label="Notifications">
      <CheckboxGroupItem parent>All notifications</CheckboxGroupItem>
      <CheckboxGroupItem description="Receive a daily digest." value="email">
        Email
      </CheckboxGroupItem>
      <CheckboxGroupItem value="sms">SMS</CheckboxGroupItem>
    </CheckboxGroup>
  ),
};
