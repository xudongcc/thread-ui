import { expect, waitFor, within } from "storybook/test";
import { testOnly } from "./utils/test-only";
import FeedbackExample from "./examples/app-provider";
import exampleSource from "./examples/app-provider.tsx?raw";
import type { Meta, StoryObj } from "@storybook/react-vite";

const meta = {
  title: "Foundations/AppProvider",
  component: FeedbackExample,
  parameters: {
    docs: {
      source: { code: exampleSource, language: "tsx" },
      // Each example needs its own global feedback manager and locale.
      story: { inline: false, height: "360px" },
      description: {
        component:
          "Every story is wrapped in AppProvider. Use the language and theme toolbars to check translated feedback and portalled overlays.",
      },
    },
  },
} satisfies Meta<typeof FeedbackExample>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Feedback: Story = {
  play: testOnly(async ({ canvas, canvasElement, userEvent, globals }) => {
    const isChinese = globals.locale === "zh";
    await userEvent.click(
      canvas.getByRole("button", {
        name: isChinese ? "打开确认框" : "Open confirmation",
      }),
    );
    const body = within(canvasElement.ownerDocument.body);
    const dialog = await body.findByRole("alertdialog");
    await waitFor(() =>
      expect(
        within(dialog).getByRole("button", {
          name: isChinese ? "确认" : "Confirm",
        }),
      ).toBeVisible(),
    );
    await userEvent.click(
      within(dialog).getByRole("button", {
        name: isChinese ? "取消" : "Cancel",
      }),
    );
    await waitFor(() =>
      expect(body.queryByRole("alertdialog")).not.toBeInTheDocument(),
    );
  }),
};
