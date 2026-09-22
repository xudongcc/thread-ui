import { expect, userEvent, waitFor, within } from "storybook/test";
import { testOnly } from "./utils/test-only";
import { TopbarExample } from "./examples/topbar";
import implementation from "./examples/topbar.tsx?raw";
import { withExampleSource } from "./utils/example-source";
import type { Meta, StoryObj } from "@storybook/react-vite";

const meta = {
  id: "components-topbar",
  title: "Layout/Topbar",
  component: TopbarExample,
  args: { withLogo: false },
  argTypes: {
    variant: {
      control: "inline-radio",
      options: ["auto", "light", "dark"],
      mapping: { auto: undefined },
      description: "Omit to follow the global theme; light/dark override it.",
    },
  },
  render: (args) => <TopbarExample {...args} />,
  parameters: {
    layout: "fullscreen",
    docs: {
      source: withExampleSource(implementation),
      description: {
        component:
          "Responsive top bar composed with TopbarBrand, TopbarNavigationTrigger, TopbarActionGroup, TopbarAction, and TopbarMenu. It follows the global theme unless variant is set. The brand is hidden below 768px, and the navigation trigger is hidden on desktop.",
      },
    },
  },
} satisfies Meta<typeof TopbarExample>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  name: "Composition API",
  globals: { locale: "en" },
  play: testOnly(async ({ canvas, canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body);
    await userEvent.click(
      canvas.getByRole("button", { name: "Notifications" }),
    );
    await expect(canvas.getByRole("status")).toHaveTextContent(
      "Notifications requested",
    );
    await userEvent.click(
      canvas.getByRole("button", {
        name: "Workspace and account: North Studio",
      }),
    );
    await userEvent.click(
      await body.findByRole("menuitemradio", { name: "Night Market" }),
    );
    await waitFor(() =>
      expect(body.queryByRole("menu")).not.toBeInTheDocument(),
    );
    await expect(
      canvas.getByRole("button", {
        name: "Workspace and account: Night Market",
      }),
    ).toHaveFocus();
    await expect(canvas.getByRole("status")).toHaveTextContent(
      "Workspace changed",
    );
  }),
};

export const WithLogo: Story = {
  name: "With Logo",
  args: { withLogo: true },
  globals: { locale: "en" },
  parameters: {
    docs: {
      description: {
        story:
          "Site logo and name using the same brand treatment as Layout. Place the logo and text inside TopbarBrand. The entire brand remains hidden below 768px.",
      },
    },
  },
  play: Default.play,
};

export const Light: Story = {
  args: { variant: "light" },
  globals: { locale: "en" },
  parameters: {
    docs: {
      description: {
        story:
          "White header with dark text, matching action buttons and account trigger. Its appearance is independent of the application's light/dark theme.",
      },
    },
  },
  play: Default.play,
};

export const Dark: Story = {
  args: { variant: "dark" },
  globals: { locale: "en" },
  play: Default.play,
};
