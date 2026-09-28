import { CircleHelpIcon, LogOutIcon } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  AccountMenuExampleProvider,
  AccountMenuPreferences,
} from "./sidebar-account-menu-shared";
import type { SidebarAccountMenuExampleProps } from "./sidebar-account-menu-shared";
import {
  SidebarAccountMenu,
  SidebarAccountMenuItem,
  SidebarAccountMenuSeparator,
} from "@/components/thread-ui/sidebar-account-menu";

export function SidebarAccountMenuUserOnlyExample(
  props: SidebarAccountMenuExampleProps,
) {
  return (
    <AccountMenuExampleProvider>
      <SidebarAccountMenuUserOnlyExampleContent {...props} />
    </AccountMenuExampleProvider>
  );
}
SidebarAccountMenuUserOnlyExample.displayName =
  "SidebarAccountMenuUserOnlyExample";

function SidebarAccountMenuUserOnlyExampleContent({
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
        user={
          user && {
            ...user,
            onClick: () => setMessage("Profile requested"),
          }
        }
      >
        <AccountMenuPreferences />
        <SidebarAccountMenuItem
          className="min-h-10"
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
