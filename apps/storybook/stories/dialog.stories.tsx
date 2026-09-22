import { expect, waitFor, within } from "storybook/test";
import { testOnly } from "./utils/test-only";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { Button } from "@/components/thread-ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/thread-ui/dialog";
import { Input } from "@/components/thread-ui/input";

const meta = {
  id: "components-dialog",
  title: "Feedback/Dialog",
  component: DialogContent,
  parameters: {
    docs: {
      description: {
        component:
          "A responsive dialog: centered on desktop and positioned near the bottom with an 8px inset on the left, right, and bottom on small screens.",
      },
    },
  },
  render: (args) => (
    <Dialog>
      <DialogTrigger render={<Button variant="outline">Edit profile</Button>} />
      <DialogContent {...args}>
        <DialogHeader>
          <DialogTitle>Edit profile</DialogTitle>
          <DialogDescription>Update your display name.</DialogDescription>
        </DialogHeader>
        <Input defaultValue="Alex" label="Display name" />
        <DialogFooter>
          <DialogClose render={<Button variant="outline">Cancel</Button>} />
          <DialogClose render={<Button>Save changes</Button>} />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
} satisfies Meta<typeof DialogContent>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  name: "Composition API",
};
export const OpenAndClose: Story = {
  play: testOnly(async ({ canvas, canvasElement, userEvent }) => {
    const trigger = canvas.getByRole("button", { name: "Edit profile" });
    await userEvent.click(trigger);
    const body = within(canvasElement.ownerDocument.body);
    const dialog = await body.findByRole("dialog", { name: "Edit profile" });
    await expect(
      within(dialog).getByRole("textbox", { name: "Display name" }),
    ).toHaveValue("Alex");
    await userEvent.click(
      within(dialog).getByRole("button", { name: "Cancel" }),
    );
    await waitFor(() =>
      expect(body.queryByRole("dialog")).not.toBeInTheDocument(),
    );
    await expect(trigger).toHaveFocus();
  }),
};

export const WithoutCloseButton: Story = { args: { showCloseButton: false } };
export const LongContent: Story = {
  render: (args) => (
    <Dialog>
      <DialogTrigger render={<Button>Read terms</Button>} />
      <DialogContent {...args}>
        <DialogHeader>
          <DialogTitle>Terms of use</DialogTitle>
          <DialogDescription>Review before continuing.</DialogDescription>
        </DialogHeader>
        <div className="min-h-0 overflow-y-auto">
          {Array.from({ length: 12 }, (_, index) => (
            <p key={index} className="mb-4">
              Section {index + 1}: Project members can collaborate, share files,
              and manage access to their workspace.
            </p>
          ))}
        </div>
        <DialogFooter>
          <DialogClose render={<Button>Done</Button>} />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
};
