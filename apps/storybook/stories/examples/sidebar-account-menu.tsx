import { CircleHelpIcon, LayoutGridIcon, LogOutIcon } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  AccountMenuExampleProvider,
  AccountMenuPreferences,
  DemoLink,
} from "./sidebar-account-menu-shared";
import type { Workspace } from "@/components/thread-ui/sidebar-account-menu";
import type { SidebarAccountMenuExampleProps } from "./sidebar-account-menu-shared";
import {
  SidebarAccountMenu,
  SidebarAccountMenuItem,
  SidebarAccountMenuSeparator,
} from "@/components/thread-ui/sidebar-account-menu";

const workspaces: readonly Workspace[] = [
  { id: "north", name: "North Studio", description: "Production workspace" },
  { id: "market", name: "Night Market", description: "Commerce workspace" },
  {
    id: "archive",
    name: "Archived Studio",
    description: "Access suspended",
    disabled: true,
  },
  { id: "east", name: "East Studio", description: "Design workspace" },
  { id: "west", name: "West Studio", description: "Research workspace" },
];

export function SidebarAccountMenuExample(
  props: SidebarAccountMenuExampleProps,
) {
  return (
    <AccountMenuExampleProvider>
      <SidebarAccountMenuExampleContent {...props} />
    </AccountMenuExampleProvider>
  );
}
SidebarAccountMenuExample.displayName = "SidebarAccountMenuExample";

function SidebarAccountMenuExampleContent({
  user,
  loading,
  disabled,
  maxWorkspaces,
}: SidebarAccountMenuExampleProps) {
  const { t } = useTranslation("thread-ui");
  const [message, setMessage] = useState("");
  const [workspaceId, setWorkspaceId] = useState("north");
  return (
    <div className="w-64 max-w-full space-y-4">
      <SidebarAccountMenu
        disabled={disabled}
        loading={loading}
        maxWorkspaces={maxWorkspaces}
        workspace={workspaces.find((item) => item.id === workspaceId)}
        workspaces={workspaces}
        user={
          user && {
            ...user,
            onClick: () => setMessage("Profile requested"),
          }
        }
        onWorkspaceChange={setWorkspaceId}
      >
        <SidebarAccountMenuItem
          render={<DemoLink to="#workspaces" />}
          onClick={() => setMessage("Workspaces requested")}
        >
          <LayoutGridIcon aria-hidden="true" />
          {t("sidebarAccountMenu.workspaces")}
        </SidebarAccountMenuItem>
        <AccountMenuPreferences />
        <SidebarAccountMenuItem onClick={() => setMessage("Help requested")}>
          <CircleHelpIcon aria-hidden="true" />
          {t("sidebarAccountMenu.help")}
        </SidebarAccountMenuItem>
        <SidebarAccountMenuSeparator />
        <SidebarAccountMenuItem
          onClick={() => setMessage("Sign out requested")}
        >
          <LogOutIcon aria-hidden="true" />
          {t("sidebarAccountMenu.signOut")}
        </SidebarAccountMenuItem>
      </SidebarAccountMenu>
      {message && <p role="status">{message}</p>}
    </div>
  );
}
