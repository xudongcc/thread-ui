import { expect, waitFor } from "storybook/test";
import { LayoutSidebarHeaderExample } from "./examples/layout-sidebar-header";
import implementation from "./examples/layout-sidebar-header.tsx?raw";
import { withExampleSource } from "./utils/example-source";
import { testOnly } from "./utils/test-only";
import type { Meta, StoryObj } from "@storybook/react-vite";

const meta = {
  id: "components-layoutsidebarheader",
  title: "Layout/LayoutSidebarHeader",
  component: LayoutSidebarHeaderExample,
  args: { showLogo: true, title: "Thread UI" },
  argTypes: {
    showLogo: { control: "boolean" },
    title: { control: "text" },
  },
  globals: { locale: "en" },
  parameters: {
    layout: "fullscreen",
    docs: {
      source: withExampleSource(implementation),
      story: { inline: false, height: "480px" },
      description: {
        component:
          "Isolated sidebar header examples. Toggle the sidebar to check logo replacement, the fallback without a logo, and title truncation. Controls let you change the logo and title independently.",
      },
    },
  },
  play: testOnly(async ({ canvas, canvasElement, args, userEvent }) => {
    const view = canvasElement.ownerDocument.defaultView!;
    // On mobile the header is inside the drawer, without a desktop toggle.
    if (view.innerWidth < 768) return;
    const logo = canvasElement.querySelector(
      '[data-slot="layout-sidebar-logo"]',
    );
    const title = canvasElement.querySelector(
      '[data-slot="layout-sidebar-title"]',
    );
    await userEvent.click(
      canvas.getByRole("button", { name: "Collapse navigation" }),
    );
    const expand = canvas.getByRole("button", { name: "Expand navigation" });
    const trigger = expand.parentElement!;
    await waitFor(() => {
      if (!args.showLogo)
        expect(view.getComputedStyle(trigger).opacity).toBe("1");
      if (title) expect(title).not.toBeVisible();
    });
    await userEvent.click(expand);
    if (title) await expect(title).toBeVisible();
    if (logo) await expect(logo).toBeVisible();
  }),
} satisfies Meta<typeof LayoutSidebarHeaderExample>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const WithoutLogo: Story = { args: { showLogo: false } };
export const LogoOnly: Story = { args: { title: "" } };
export const TriggerOnly: Story = {
  args: { showLogo: false, title: "" },
};
export const LongTitle: Story = {
  args: { title: "Thread UI — Workspace administration and team settings" },
};
