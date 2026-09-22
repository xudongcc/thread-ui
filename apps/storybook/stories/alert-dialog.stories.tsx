import { Trash2 } from "lucide-react";
import { expect, waitFor, within } from "storybook/test";
import CompositionExample from "./examples/alert-dialog-composition";
import compositionSource from "./examples/alert-dialog-composition.tsx?raw";
import exampleSource from "./examples/alert-dialog.tsx?raw";
import AlertDialogExample from "./examples/alert-dialog";
import type { Meta, StoryObj } from "@storybook/react-vite";

const meta = {
  id: "components-alertdialog",
  title: "Feedback/AlertDialog",
  component: AlertDialogExample,
  args: {
    title: "Save changes?",
    description: "Confirm to save your current changes.",
  },
  argTypes: {
    variant: { control: "select", options: ["default", "destructive"] },
    size: { control: "select", options: ["default", "sm"] },
  },
  parameters: {
    docs: {
      source: { code: exampleSource, language: "tsx" },
      story: { inline: false, height: "400px" },
      description: {
        component:
          "### Function API\nCall `await alertDialog(options)` after mounting AppProvider or AlertDialogProvider. It resolves to a boolean. This is the default example.\n\n### Composition API\nImport AlertDialog and its parts from the same entry point. No provider is required; control `open` to close after confirmation. This component does not have a single-component Props API.",
      },
    },
  },
} satisfies Meta<typeof AlertDialogExample>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  name: "Function API",
};
export const Destructive: Story = {
  args: {
    title: "Delete project?",
    description: "This action cannot be undone.",
    variant: "destructive",
    confirmText: "Delete project",
    icon: <Trash2 />,
  },
};
export const Small: Story = { args: { size: "sm" } };
export const CustomLabels: Story = {
  args: {
    title: "Sign out?",
    confirmText: "Sign out",
    cancelText: "Stay signed in",
  },
};
export const CustomContent: Story = {
  args: {
    content: (
      <p className="bg-muted rounded-md p-3 text-sm">
        3 files will be saved to the project.
      </p>
    ),
  },
};
export const Confirm: Story = {
  globals: { locale: "en" },
  play: async ({ canvas, canvasElement, userEvent }) => {
    await userEvent.click(
      canvas.getByRole("button", { name: "Open confirmation" }),
    );
    const body = within(canvasElement.ownerDocument.body);
    const dialog = await body.findByRole("alertdialog");
    await userEvent.click(
      within(dialog).getByRole("button", { name: "Confirm" }),
    );
    await expect(canvas.getByRole("status")).toHaveTextContent("Confirmed");
    await waitFor(() =>
      expect(body.queryByRole("alertdialog")).not.toBeInTheDocument(),
    );
  },
};
export const Cancel: Story = {
  globals: { locale: "en" },
  play: async ({ canvas, canvasElement, userEvent }) => {
    await userEvent.click(
      canvas.getByRole("button", { name: "Open confirmation" }),
    );
    const dialog = await within(canvasElement.ownerDocument.body).findByRole(
      "alertdialog",
    );
    await userEvent.click(
      within(dialog).getByRole("button", { name: "Cancel" }),
    );
    await expect(canvas.getByRole("status")).toHaveTextContent("Canceled");
  },
};

export const Composition: Story = {
  name: "Composition API",
  parameters: {
    docs: {
      source: { code: compositionSource, language: "tsx" },
      description: {
        story:
          "Compose the exported AlertDialog parts without a provider. Cancel closes automatically; the confirm handler closes the controlled dialog after the action succeeds.",
      },
    },
  },
  render: CompositionExample,
  play: async ({ canvas, canvasElement, userEvent }) => {
    const trigger = canvas.getByRole("button", { name: "Open confirmation" });
    const body = within(canvasElement.ownerDocument.body);
    for (const [action, result] of [
      ["Cancel", "Canceled"],
      ["Confirm", "Confirmed"],
    ]) {
      await userEvent.click(trigger);
      const dialog = await body.findByRole("alertdialog", {
        name: "Save changes?",
      });
      await expect(dialog).toHaveAccessibleDescription(
        "Confirm to save your current changes.",
      );
      await userEvent.click(
        within(dialog).getByRole("button", { name: action }),
      );
      await expect(canvas.getByRole("status")).toHaveTextContent(result);
      await waitFor(() =>
        expect(body.queryByRole("alertdialog")).not.toBeInTheDocument(),
      );
      await expect(trigger).toHaveFocus();
    }
  },
};
