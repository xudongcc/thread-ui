import { CircleHelpIcon, LayoutGridIcon, LogOutIcon } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  AccountMenuExampleProvider,
  AccountMenuPreferences,
  DemoLink,
} from "./sidebar-account-menu-shared";
import type { SidebarAccountMenuExampleProps } from "./sidebar-account-menu-shared";
import {
  SidebarAccountMenu,
  SidebarAccountMenuItem,
  SidebarAccountMenuSeparator,
} from "@/components/thread-ui/sidebar-account-menu";

export function SidebarAccountMenuEmptyExample(
  props: SidebarAccountMenuExampleProps,
) {
  return (
    <AccountMenuExampleProvider>
      <SidebarAccountMenuEmptyExampleContent {...props} />
    </AccountMenuExampleProvider>
  );
}
SidebarAccountMenuEmptyExample.displayName = "SidebarAccountMenuEmptyExample";

function SidebarAccountMenuEmptyExampleContent({
  user,
  loading,
  disabled,
}: SidebarAccountMenuExampleProps) {
  const { t } = useTranslation("thread-ui");
  const [message, setMessage] = useState("");
  return (
    <div className="w-64 max-w-full space-y-4">
      <SidebarAccountMenu
        disabled={disabled}
        loading={loading}
        workspaces={[]}
        user={
          user && {
            ...user,
            onClick: () => setMessage("Profile requested"),
          }
        }
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
