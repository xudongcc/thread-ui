import {
  CircleHelpIcon,
  CreditCardIcon,
  LayoutGridIcon,
  LockKeyholeIcon,
  LogOutIcon,
} from "lucide-react";
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
];

export function SidebarAccountMenuLinksExample(
  props: SidebarAccountMenuExampleProps,
) {
  return (
    <AccountMenuExampleProvider>
      <SidebarAccountMenuLinksExampleContent {...props} />
    </AccountMenuExampleProvider>
  );
}
SidebarAccountMenuLinksExample.displayName = "SidebarAccountMenuLinksExample";

function SidebarAccountMenuLinksExampleContent({
  user,
  loading,
  disabled,
}: SidebarAccountMenuExampleProps) {
  const { t } = useTranslation("thread-ui");
  const [message, setMessage] = useState("");
  const [workspaceId, setWorkspaceId] = useState("north");
  return (
    <div className="w-64 max-w-full space-y-4">
      <SidebarAccountMenu
        disabled={disabled}
        loading={loading}
        workspace={workspaces.find((item) => item.id === workspaceId)}
        user={
          user && {
            ...user,
            render: <DemoLink to="#profile" />,
            onClick: () => setMessage("Profile requested"),
          }
        }
        workspaces={workspaces.map((workspace) => ({
          ...workspace,
          render: (props, state) => (
            <DemoLink
              {...props}
              data-selected={state.checked || undefined}
              to={`#workspace-${workspace.id}`}
            />
          ),
        }))}
        onWorkspaceChange={setWorkspaceId}
      >
        <SidebarAccountMenuItem
          className="min-h-10"
          render={<DemoLink to="#workspaces" />}
          onClick={() => setMessage("Workspaces requested")}
        >
          <LayoutGridIcon aria-hidden="true" />
          {t("sidebarAccountMenu.workspaces")}
        </SidebarAccountMenuItem>
        <SidebarAccountMenuItem
          className="min-h-10"
          render={(props) => <DemoLink {...props} to="#billing" />}
          onClick={() => setMessage("Billing requested")}
        >
          <CreditCardIcon aria-hidden="true" />
          Billing
        </SidebarAccountMenuItem>
        <SidebarAccountMenuItem
          disabled
          className="min-h-10"
          render={<DemoLink to="#audit" />}
        >
          <LockKeyholeIcon aria-hidden="true" />
          Audit log
        </SidebarAccountMenuItem>
        <AccountMenuPreferences />
        <SidebarAccountMenuItem
          className="min-h-10"
          render={<DemoLink to="#help" />}
          onClick={() => setMessage("Help requested")}
        >
          <CircleHelpIcon aria-hidden="true" />
          {t("sidebarAccountMenu.help")}
        </SidebarAccountMenuItem>
        <SidebarAccountMenuSeparator />
        <SidebarAccountMenuItem
          className="min-h-10"
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
