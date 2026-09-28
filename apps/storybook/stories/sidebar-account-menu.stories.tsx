import { expect, userEvent, waitFor, within } from "storybook/test";
import { testOnly } from "./utils/test-only";
import { SidebarAccountMenuExample } from "./examples/sidebar-account-menu";
import { SidebarAccountMenuEmptyExample } from "./examples/sidebar-account-menu-empty";
import { SidebarAccountMenuUserOnlyExample } from "./examples/sidebar-account-menu-user-only";
import { SidebarAccountMenuLinksExample } from "./examples/sidebar-account-menu-links";
import implementation from "./examples/sidebar-account-menu.tsx?raw";
import emptyImplementation from "./examples/sidebar-account-menu-empty.tsx?raw";
import userOnlyImplementation from "./examples/sidebar-account-menu-user-only.tsx?raw";
import linksImplementation from "./examples/sidebar-account-menu-links.tsx?raw";
import sharedImplementation from "./examples/sidebar-account-menu-shared.tsx?raw";
import { withExampleSource } from "./utils/example-source";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { SidebarAccountMenu } from "@/components/thread-ui/sidebar-account-menu";

// Include only this scenario and its shared utilities, keeping copied code standalone.
function accountMenuSource(source: string) {
  const standalone = source.replace(
    /import\s+(?:type\s+)?\{[^}]*\}\s+from\s+["']\.\/sidebar-account-menu-shared["'];?\s*/g,
    "",
  );
  return withExampleSource(
    `${standalone}\n// Shared example helpers (not component API).\n${sharedImplementation}`,
  );
}

const meta = {
  id: "components-sidebaraccountmenu",
  title: "Layout/SidebarAccountMenu",
  component: SidebarAccountMenu,
  args: {
    children: undefined,
    user: { name: "Alex Morgan", email: "alex@example.com" },
    loading: false,
    disabled: false,
  },
  argTypes: {
    children: { control: false },
    loading: { control: "boolean" },
    disabled: { control: "boolean" },
  },
  render: (args) => <SidebarAccountMenuExample {...args} />,
  parameters: {
    controls: { include: ["user", "loading", "disabled"] },
    docs: {
      source: accountMenuSource(implementation),
      description: {
        component:
          "Workspace and user identity use props. The trigger, popup and identity rows are built in; children compose additional menu items. Use workspace, workspaces and onWorkspaceChange for controlled switching; user.onClick/render configures the profile row. Help, sign-out and other actions use onClick/render on SidebarAccountMenuItem. Controls expose user, loading and disabled while demo data and handlers stay local.",
      },
    },
  },
} satisfies Meta<typeof SidebarAccountMenu>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  name: "Props and composed actions",
  globals: { locale: "en" },
  parameters: {
    docs: {
      description: {
        story:
          "Complete workspace and account menu: switch workspaces or open workspace management, open the personal center, change language/theme, get help, and sign out. The current workspace is supplied separately from recent tenants and appears first among at most three entries. Use Controls for user, loading and disabled. Each business action is explicitly composed as a menu item with its own handler.",
      },
    },
  },
  play: testOnly(async ({ canvas, canvasElement, step }) => {
    await step("Account identity", async () => {
      const body = within(canvasElement.ownerDocument.body);
      const trigger = canvas.getByRole("button", {
        name: "Workspace and account: North Studio",
      });
      await expect(trigger).toHaveTextContent("North Studio");
      await expect(trigger).toHaveTextContent("Production workspace");
      await expect(trigger).not.toHaveTextContent("Alex Morgan");
      await expect(
        trigger.querySelector('[data-slot="user-avatar"]'),
      ).toBeNull();
      await expect(
        trigger.querySelector('[data-slot="workspace-icon"]'),
      ).toHaveTextContent(/^N$/);
      await userEvent.click(trigger);
      await waitFor(() => expect(body.getByRole("menu")).toBeVisible());
      const rows = body.getAllByRole("menuitemradio");
      await expect(rows).toHaveLength(3);
      await expect(rows[0]).toHaveAccessibleName("North Studio");
      await expect(rows[0]).toHaveAttribute("aria-checked", "true");
      await expect(body.queryByRole("textbox")).not.toBeInTheDocument();
      await expect(
        within(body.getByRole("menu")).getByText("Alex Morgan"),
      ).toBeVisible();
      await expect(body.getByText("alex@example.com")).toBeVisible();
      await expect(
        body
          .getByRole("menuitem", { name: "Open profile: Alex Morgan" })
          .querySelector('[aria-hidden="true"]'),
      ).toHaveTextContent(/^A$/);
      await expect(
        body.getByRole("menuitemradio", { name: "North Studio" }),
      ).toHaveAttribute("aria-checked", "true");
      await userEvent.keyboard("{Escape}");
      await waitFor(() =>
        expect(body.queryByRole("menu")).not.toBeInTheDocument(),
      );
    });
    await step("Profile, help, and sign out", async () => {
      const body = within(canvasElement.ownerDocument.body);
      const trigger = canvas.getByRole("button", {
        name: "Workspace and account: North Studio",
      });
      for (const [name, message] of [
        ["Open profile: Alex Morgan", "Profile requested"],
        ["Help center", "Help requested"],
        ["Sign out", "Sign out requested"],
      ] as const) {
        await userEvent.click(trigger);
        await userEvent.click(await body.findByRole("menuitem", { name }));
        await expect(canvas.getByRole("status")).toHaveTextContent(message);
        await waitFor(() =>
          expect(body.queryByRole("menu")).not.toBeInTheDocument(),
        );
        await expect(trigger).toHaveFocus();
      }
    });
    await step("Switch workspace", async () => {
      const body = within(canvasElement.ownerDocument.body);
      await expect(
        canvas.getByRole("button", {
          name: "Workspace and account: North Studio",
        }),
      ).toHaveTextContent("N");
      await userEvent.click(
        canvas.getByRole("button", {
          name: "Workspace and account: North Studio",
        }),
      );
      await expect(
        await body.findByRole("menuitemradio", { name: "North Studio" }),
      ).toHaveAttribute("aria-checked", "true");
      await expect(
        body.getByRole("menuitemradio", { name: "Archived Studio" }),
      ).toHaveAttribute("aria-disabled", "true");
      const destination = body.getByRole("menuitemradio", {
        name: "Night Market",
      });
      const avatar = destination.querySelector('[data-slot="workspace-icon"]')!;
      await expect(avatar).toHaveTextContent(/^N$/);
      const foreground = getComputedStyle(avatar).color;
      await userEvent.hover(destination);
      await expect(getComputedStyle(avatar).color).toBe(foreground);
      destination.focus();
      await expect(getComputedStyle(avatar).color).toBe(foreground);
      await userEvent.click(
        body.getByRole("menuitemradio", { name: "Night Market" }),
      );
      await waitFor(() =>
        expect(body.queryByRole("menu")).not.toBeInTheDocument(),
      );
      await expect(
        canvas.getByRole("button", {
          name: "Workspace and account: Night Market",
        }),
      ).toHaveFocus();
    });
    await step("Workspaces", async () => {
      await userEvent.click(
        canvas.getByRole("button", {
          name: "Workspace and account: Night Market",
        }),
      );
      await userEvent.click(
        await within(canvasElement.ownerDocument.body).findByRole("menuitem", {
          name: "Workspaces",
        }),
      );
      await expect(canvas.getByRole("status")).toHaveTextContent(
        "Workspaces requested",
      );
      await expect(canvasElement.ownerDocument.defaultView!.location.hash).toBe(
        "#workspaces",
      );
      await waitFor(() =>
        expect(
          within(canvasElement.ownerDocument.body).queryByRole("menu"),
        ).not.toBeInTheDocument(),
      );
    });
    await step("Theme and language submenus", async () => {
      const body = within(canvasElement.ownerDocument.body);
      const root = canvasElement.ownerDocument.documentElement;
      const trigger = canvas.getByRole("button", { name: /Night Market/ });
      const wasDark = root.classList.contains("dark");
      for (const dark of [!wasDark, wasDark]) {
        await userEvent.click(trigger);
        (await body.findByRole("menuitem", { name: "Theme" })).focus();
        await userEvent.keyboard("{ArrowRight}");
        const choice = await body.findByRole("menuitemradio", {
          name: dark ? "Dark" : "Light",
        });
        await waitFor(() => expect(choice).toBeVisible());
        choice.focus();
        await userEvent.keyboard("{Enter}");
        await waitFor(() => expect(root.classList.contains("dark")).toBe(dark));
        await waitFor(() =>
          expect(body.queryByRole("menu")).not.toBeInTheDocument(),
        );
        await expect(trigger).toHaveFocus();
      }
      await userEvent.click(trigger);
      (await body.findByRole("menuitem", { name: "Language" })).focus();
      await userEvent.keyboard("{ArrowRight}");
      const chinese = await body.findByRole("menuitemradio", { name: "中文" });
      await waitFor(() => expect(chinese).toBeVisible());
      chinese.focus();
      await userEvent.keyboard("{Enter}");
      await waitFor(() =>
        expect(body.queryByRole("menu")).not.toBeInTheDocument(),
      );
      await userEvent.click(trigger);
      await waitFor(() =>
        expect(body.getByText("最近的工作空间")).toBeVisible(),
      );
      (await body.findByRole("menuitem", { name: "语言" })).focus();
      await userEvent.keyboard("{ArrowRight}");
      await expect(
        await body.findByRole("menuitemradio", { name: "中文" }),
      ).toHaveAttribute("aria-checked", "true");
      const english = body.getByRole("menuitemradio", { name: "English" });
      english.focus();
      await userEvent.keyboard("{Enter}");
      await waitFor(() =>
        expect(body.queryByRole("menu")).not.toBeInTheDocument(),
      );
      await expect(trigger).toHaveAccessibleName(
        "Workspace and account: Night Market",
      );
      await expect(trigger).toHaveFocus();
    });
  }),
};

export const Empty: Story = {
  parameters: { docs: { source: accountMenuSource(emptyImplementation) } },
  render: (args) => <SidebarAccountMenuEmptyExample {...args} />,
  globals: { locale: "en" },
  play: testOnly(async ({ canvas, canvasElement }) => {
    await userEvent.click(
      canvas.getByRole("button", { name: "Account: Alex Morgan" }),
    );
    const body = within(canvasElement.ownerDocument.body);
    await waitFor(() => expect(body.getByRole("menu")).toBeVisible());
    await expect(body.queryByRole("menuitemradio")).not.toBeInTheDocument();
    await expect(body.queryByText("Recent workspaces")).not.toBeInTheDocument();
    await userEvent.click(body.getByRole("menuitem", { name: "Workspaces" }));
    await expect(canvas.getByRole("status")).toHaveTextContent(
      "Workspaces requested",
    );
    await waitFor(() =>
      expect(body.queryByRole("menu")).not.toBeInTheDocument(),
    );
    await expect(
      canvas.getByRole("button", { name: "Account: Alex Morgan" }),
    ).toHaveFocus();
  }),
};

export const UserOnly: Story = {
  name: "User only",
  render: (args) => <SidebarAccountMenuUserOnlyExample {...args} />,
  globals: { locale: "en" },
  parameters: {
    docs: {
      source: accountMenuSource(userOnlyImplementation),
      description: {
        story:
          "Account menu without workspaces. The trigger shows the user's avatar and name; the menu includes the profile, language, theme, help, and sign-out actions.",
      },
    },
  },
  play: testOnly(async ({ canvas, canvasElement }) => {
    const trigger = canvas.getByRole("button", {
      name: "Account: Alex Morgan",
    });
    await expect(trigger).toHaveTextContent("Alex Morgan");
    await expect(
      trigger.querySelector('[data-slot="user-avatar"]'),
    ).toHaveTextContent(/^A$/);
    await expect(
      trigger.querySelector('[data-slot="workspace-icon"]'),
    ).toBeNull();
    const body = within(canvasElement.ownerDocument.body);
    await userEvent.click(trigger);
    await waitFor(() => expect(body.getByRole("menu")).toBeVisible());
    await expect(body.queryByRole("menuitemradio")).not.toBeInTheDocument();
    await expect(body.queryByText("Recent workspaces")).not.toBeInTheDocument();
    await expect(
      body.queryByText("No workspaces available"),
    ).not.toBeInTheDocument();
    await expect(
      body.queryByRole("menuitem", { name: "Workspaces" }),
    ).not.toBeInTheDocument();
    for (const name of ["Language", "Theme", "Help center", "Sign out"]) {
      await expect(body.getByRole("menuitem", { name })).toBeVisible();
    }
    await userEvent.click(
      body.getByRole("menuitem", { name: "Open profile: Alex Morgan" }),
    );
    await expect(canvas.getByRole("status")).toHaveTextContent(
      "Profile requested",
    );
    await waitFor(() =>
      expect(body.queryByRole("menu")).not.toBeInTheDocument(),
    );
    await expect(trigger).toHaveFocus();
  }),
};

export const Links: Story = {
  parameters: { docs: { source: accountMenuSource(linksImplementation) } },
  name: "Framework links",
  render: (args) => <SidebarAccountMenuLinksExample {...args} />,
  globals: { locale: "en" },
  play: testOnly(async ({ canvas, canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body);
    const trigger = canvas.getByRole("button", {
      name: "Workspace and account: North Studio",
    });
    await userEvent.click(trigger);
    await waitFor(() => expect(body.getByRole("menu")).toBeVisible());
    await expect(
      body.getByRole("menuitemradio", { name: "North Studio" }),
    ).toHaveAttribute("data-selected", "true");
    await expect(
      body.getByRole("menuitem", { name: "Audit log" }),
    ).toHaveAttribute("aria-disabled", "true");
    body.getByRole("menuitemradio", { name: "Night Market" }).focus();
    await userEvent.keyboard("{Enter}");
    await expect(canvasElement.ownerDocument.defaultView!.location.hash).toBe(
      "#workspace-market",
    );
    await waitFor(() =>
      expect(body.queryByRole("menu")).not.toBeInTheDocument(),
    );
    const selected = canvas.getByRole("button", {
      name: "Workspace and account: Night Market",
    });
    await expect(selected).toHaveFocus();
    await userEvent.click(selected);
    (await body.findByRole("menuitem", { name: "Billing" })).focus();
    await userEvent.keyboard("{Enter}");
    await expect(canvasElement.ownerDocument.defaultView!.location.hash).toBe(
      "#billing",
    );
    await waitFor(() =>
      expect(body.queryByRole("menu")).not.toBeInTheDocument(),
    );
    await userEvent.click(selected);
    await userEvent.click(
      await body.findByRole("menuitem", { name: "Open profile: Alex Morgan" }),
    );
    await expect(canvas.getByRole("status")).toHaveTextContent(
      "Profile requested",
    );
    await expect(canvasElement.ownerDocument.defaultView!.location.hash).toBe(
      "#profile",
    );
    await waitFor(() =>
      expect(body.queryByRole("menu")).not.toBeInTheDocument(),
    );
    await expect(selected).toHaveFocus();
  }),
};
