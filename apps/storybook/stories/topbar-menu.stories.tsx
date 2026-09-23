import { expect, fn, userEvent, waitFor, within } from "storybook/test";
import { testOnly } from "./utils/test-only";
import {
  TopbarMenuExample,
  TopbarMenuLinksExample,
  workspaces,
} from "./examples/topbar-menu";
import implementation from "./examples/topbar-menu.tsx?raw";
import { withExampleSource } from "./utils/example-source";
import type { Meta, StoryObj } from "@storybook/react-vite";
import type { TopbarMenuExampleProps } from "./examples/topbar-menu";

const accountArgs = {
  user: { name: "Alex Morgan", email: "alex@example.com" },
  onProfile: fn(),
  onHelp: fn(),
  onSignOut: fn(),
};

const meta = {
  id: "components-topbarmenu",
  title: "Layout/TopbarMenu",
  component: TopbarMenuExample,
  args: {
    ...accountArgs,
    workspaces,
    value: "north",
    onValueChange: fn(),
    onCreateWorkspace: fn(),
    loading: false,
    disabled: false,
  },
  argTypes: {
    value: { control: false },
    loading: { control: "boolean" },
    disabled: { control: "boolean" },
  },
  render: (args) => <TopbarMenuExample {...args} />,
  parameters: {
    docs: {
      source: withExampleSource(implementation),
      description: {
        component:
          "Composition-only workspace/account menu. Compose TopbarMenuTrigger, TopbarMenuContent, TopbarMenuWorkspaceGroup and TopbarMenuUser with shadcn radio items, menu items and separators. This demo shows at most three recent tenants including the current tenant. No search or generated menu content.",
      },
    },
  },
} satisfies Meta<TopbarMenuExampleProps>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  name: "Composition API",
  args: {
    currentWorkspace: workspaces[0],
    workspaces: workspaces.slice(1),
  },
  globals: { locale: "en" },
  parameters: {
    docs: {
      description: {
        story:
          "Complete workspace and account menu: switch or create a workspace, open the personal center, change language/theme, get help, and sign out. The current workspace is supplied separately from recent tenants and appears first among at most three entries. Use Controls for loading, disabled, and optional actions.",
      },
    },
  },
  play: testOnly(async ({ args, canvas, canvasElement, step }) => {
    await step("Account identity", async () => {
      const body = within(canvasElement.ownerDocument.body);
      await userEvent.click(
        canvas.getByRole("button", {
          name: "Workspace and account: North Studio",
        }),
      );
      await waitFor(() => expect(body.getByRole("menu")).toBeVisible());
      const rows = body.getAllByRole("menuitemradio");
      await expect(rows).toHaveLength(3);
      await expect(rows[0]).toHaveAccessibleName("North Studio");
      await expect(rows[0]).toHaveAttribute("aria-checked", "true");
      await expect(body.queryByRole("textbox")).not.toBeInTheDocument();
      await expect(body.getByText("Alex Morgan")).toBeVisible();
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
      for (const [name, callback] of [
        ["Open profile: Alex Morgan", args.onProfile],
        ["Help center", args.onHelp],
        ["Sign out", args.onSignOut],
      ] as const) {
        await userEvent.click(trigger);
        await userEvent.click(await body.findByRole("menuitem", { name }));
        await expect(callback).toHaveBeenCalledOnce();
        await waitFor(() =>
          expect(body.queryByRole("menu")).not.toBeInTheDocument(),
        );
        await expect(trigger).toHaveFocus();
      }
      await expect(args.onValueChange).not.toHaveBeenCalled();
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
      await expect(args.onValueChange).toHaveBeenCalledWith("market");
      await waitFor(() =>
        expect(body.queryByRole("menu")).not.toBeInTheDocument(),
      );
      await expect(
        canvas.getByRole("button", {
          name: "Workspace and account: Night Market",
        }),
      ).toHaveFocus();
    });
    await step("Create workspace", async () => {
      await userEvent.click(
        canvas.getByRole("button", {
          name: "Workspace and account: Night Market",
        }),
      );
      await userEvent.click(
        await within(canvasElement.ownerDocument.body).findByRole("menuitem", {
          name: "Create workspace",
        }),
      );
      await expect(args.onCreateWorkspace).toHaveBeenCalled();
      await expect(canvas.getByRole("status")).toHaveTextContent(
        "Create workspace requested",
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

export const Empty: Story = { args: { workspaces: [], value: null } };

export const UserOnly: Story = {
  name: "User only",
  args: {
    workspaces: [],
    currentWorkspace: undefined,
    value: null,
    onCreateWorkspace: undefined,
    onValueChange: undefined,
  },
  globals: { locale: "en" },
  parameters: {
    docs: {
      description: {
        story:
          "Account menu without workspaces. The trigger shows the user's avatar and name; the menu includes the profile, language, theme, help, and sign-out actions.",
      },
    },
  },
  play: testOnly(async ({ args, canvas, canvasElement }) => {
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
      body.queryByRole("menuitem", { name: "Create workspace" }),
    ).not.toBeInTheDocument();
    for (const name of ["Language", "Theme", "Help center", "Sign out"]) {
      await expect(body.getByRole("menuitem", { name })).toBeVisible();
    }
    await userEvent.click(
      body.getByRole("menuitem", { name: "Open profile: Alex Morgan" }),
    );
    await expect(args.onProfile).toHaveBeenCalled();
    await waitFor(() =>
      expect(body.queryByRole("menu")).not.toBeInTheDocument(),
    );
    await expect(trigger).toHaveFocus();
  }),
};

export const Links: Story = {
  name: "Framework links",
  render: (args) => <TopbarMenuLinksExample {...args} />,
  globals: { locale: "en" },
  play: testOnly(async ({ args, canvas, canvasElement }) => {
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
    await expect(args.onValueChange).toHaveBeenCalledWith("market");
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
    await expect(args.onProfile).toHaveBeenCalledOnce();
    await expect(canvasElement.ownerDocument.defaultView!.location.hash).toBe(
      "#profile",
    );
    await waitFor(() =>
      expect(body.queryByRole("menu")).not.toBeInTheDocument(),
    );
    await expect(selected).toHaveFocus();
  }),
};
