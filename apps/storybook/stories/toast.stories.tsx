import { expect, waitFor, within } from "storybook/test";
import ToastExample from "./examples/toast";
import exampleSource from "./examples/toast.tsx?raw";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { toast } from "@/components/thread-ui/toast";

const meta = {
  id: "components-toast",
  title: "Feedback/Toast",
  component: ToastExample,
  args: {
    title: "Changes saved",
    description: "Your project is up to date.",
    timeout: 5000,
  },
  argTypes: {
    type: {
      control: "select",
      options: ["success", "info", "warning", "error"],
    },
  },
  parameters: {
    docs: {
      source: { code: exampleSource, language: "tsx" },
      story: { inline: false, height: "360px" },
      description: {
        component:
          "### Function API\nCall `toast.add(options)` for global notifications with status types and optional actions. AppProvider or ToastProvider installs the toaster. Each docs example is isolated to prevent duplicate global notifications. Thread UI exposes this function API rather than a composed toast component.",
      },
    },
  },
} satisfies Meta<typeof ToastExample>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  name: "Function API",
};
export const Success: Story = { args: { type: "success" } };
export const Info: Story = {
  args: { type: "info", title: "New version available" },
};
export const Warning: Story = {
  args: { type: "warning", title: "Storage nearly full" },
};
export const Error: Story = {
  args: {
    type: "error",
    title: "Could not save",
    description: "Please try again.",
  },
};
export const WithAction: Story = {
  args: {
    title: "File deleted",
    actionProps: {
      children: "Undo",
      onClick: () => toast.add({ title: "File restored", type: "success" }),
    },
  },
};
export const Dismiss: Story = {
  globals: { locale: "en" },
  args: { timeout: 0 },
  play: async ({ canvas, canvasElement, userEvent }) => {
    await userEvent.click(
      canvas.getByRole("button", { name: "Show notification" }),
    );
    const body = within(canvasElement.ownerDocument.body);
    await expect(await body.findByText("Changes saved")).toBeInTheDocument();
    await userEvent.click(body.getByLabelText("Close toast"));
    await waitFor(() =>
      expect(body.queryByText("Changes saved")).not.toBeInTheDocument(),
    );
  },
};
