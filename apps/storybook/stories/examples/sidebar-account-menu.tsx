import {
  CircleHelpIcon,
  CreditCardIcon,
  LanguagesIcon,
  LayoutGridIcon,
  LockKeyholeIcon,
  LogOutIcon,
  SunMoonIcon,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { I18nextProvider, useTranslation } from "react-i18next";
import type { ComponentProps } from "react";
import type {
  SidebarAccountMenuProps,
  Workspace,
} from "@/components/thread-ui/sidebar-account-menu";
import {
  SidebarAccountMenu,
  SidebarAccountMenuItem,
  SidebarAccountMenuRadioGroup,
  SidebarAccountMenuRadioItem,
  SidebarAccountMenuSeparator,
  SidebarAccountMenuSub,
  SidebarAccountMenuSubContent,
  SidebarAccountMenuSubTrigger,
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
  { id: "cn", name: "上海工作室", description: "shanghai.example.com" },
  { id: "east", name: "East Studio", description: "east.example.com" },
  { id: "west", name: "West Studio", description: "west.example.com" },
];

// Controls expose only actual root props. Business actions are composed below.
export type SidebarAccountMenuExampleProps = Pick<
  SidebarAccountMenuProps,
  "user" | "loading" | "disabled"
>;

// Private demo scenarios, not SidebarAccountMenu API.
type DemoOptions = {
  recentWorkspaces?: readonly Workspace[];
  initialWorkspace?: Workspace | null;
  showWorkspaces?: boolean;
  linkItems?: boolean;
};

// A router-like Link for this standalone demo. In an app, import your router's Link.
// React 19 passes ref as a prop; forward all received props to the anchor.
function DemoLink({
  to,
  onClick,
  ...props
}: ComponentProps<"a"> & { to: string }) {
  return (
    <a
      {...props}
      href={to}
      onClick={(event) => {
        onClick?.(event);
        if (
          !event.defaultPrevented &&
          event.button === 0 &&
          !event.metaKey &&
          !event.ctrlKey &&
          !event.shiftKey &&
          !event.altKey
        ) {
          event.preventDefault();
          // Simulate client-side routing without navigating the Storybook/test host.
          window.history.replaceState(null, "", to);
        }
      }}
    />
  );
}

/** Language changes stay local to this example, including portaled submenus. */
function MenuExample({
  options,
  ...props
}: SidebarAccountMenuExampleProps & { options?: DemoOptions }) {
  const { i18n } = useTranslation();
  const instance = useMemo(() => i18n.cloneInstance(), [i18n]);
  return (
    <I18nextProvider i18n={instance}>
      <MenuExampleContent {...props} {...options} />
    </I18nextProvider>
  );
}

/** Only the demo owns recent-workspace data and application navigation. */
function MenuExampleContent({
  recentWorkspaces = workspaces.slice(1),
  initialWorkspace = workspaces[0],
  showWorkspaces = true,
  linkItems = false,
  user,
  loading,
  disabled,
}: SidebarAccountMenuExampleProps & DemoOptions) {
  const { t, i18n } = useTranslation("thread-ui");
  const [theme, setTheme] = useState("light");
  useEffect(() => {
    const root = document.documentElement;
    const original = root.classList.contains("dark");
    const sync = () =>
      setTheme(root.classList.contains("dark") ? "dark" : "light");
    sync();
    const observer = new MutationObserver(sync);
    observer.observe(root, { attributes: true, attributeFilter: ["class"] });
    return () => {
      observer.disconnect();
      root.classList.toggle("dark", original);
    };
  }, []);
  const [value, setValue] = useState(
    showWorkspaces ? initialWorkspace : undefined,
  );
  const [message, setMessage] = useState("");
  // Include the current tenant and cap the recent list at three.
  const recent = showWorkspaces
    ? [
        ...new Map(
          [
            ...(value ? [value] : []),
            ...(initialWorkspace ? [initialWorkspace] : []),
            ...recentWorkspaces,
          ].map((workspace) => [workspace.id, workspace]),
        ).values(),
      ].slice(0, 3)
    : [];
  return (
    <div className="w-64 max-w-full space-y-4">
      <SidebarAccountMenu
        disabled={disabled}
        loading={loading}
        workspace={value ?? undefined}
        user={
          user && {
            ...user,
            render: linkItems ? <DemoLink to="#profile" /> : undefined,
            onClick: () => setMessage("Profile requested"),
          }
        }
        workspaces={recent.map((workspace) => ({
          ...workspace,
          render: linkItems
            ? (props, state) => (
                <DemoLink
                  {...props}
                  data-selected={state.checked || undefined}
                  to={`#workspace-${workspace.id}`}
                />
              )
            : undefined,
        }))}
        onWorkspaceChange={(next) => {
          const workspace = recent.find((item) => item.id === next);
          if (workspace) setValue(workspace);
        }}
      >
        {showWorkspaces && (
          <SidebarAccountMenuItem
            className="min-h-10"
            render={<DemoLink to="#workspaces" />}
            onClick={() => setMessage("Workspaces requested")}
          >
            <LayoutGridIcon aria-hidden="true" />
            {t("sidebarAccountMenu.workspaces")}
          </SidebarAccountMenuItem>
        )}
        {linkItems && (
          <>
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
          </>
        )}
        <SidebarAccountMenuSub>
          <SidebarAccountMenuSubTrigger className="min-h-10">
            <LanguagesIcon aria-hidden="true" />
            {t("sidebarAccountMenu.language")}
          </SidebarAccountMenuSubTrigger>
          <SidebarAccountMenuSubContent>
            <SidebarAccountMenuRadioGroup
              value={i18n.resolvedLanguage ?? "en"}
              onValueChange={(next: string) => {
                void i18n.changeLanguage(next);
              }}
            >
              <SidebarAccountMenuRadioItem
                closeOnClick
                className="min-h-10"
                value="en"
              >
                English
              </SidebarAccountMenuRadioItem>
              <SidebarAccountMenuRadioItem
                closeOnClick
                className="min-h-10"
                value="zh"
              >
                中文
              </SidebarAccountMenuRadioItem>
            </SidebarAccountMenuRadioGroup>
          </SidebarAccountMenuSubContent>
        </SidebarAccountMenuSub>
        <SidebarAccountMenuSub>
          <SidebarAccountMenuSubTrigger className="min-h-10">
            <SunMoonIcon aria-hidden="true" />
            {t("sidebarAccountMenu.theme")}
          </SidebarAccountMenuSubTrigger>
          <SidebarAccountMenuSubContent>
            <SidebarAccountMenuRadioGroup
              value={theme}
              onValueChange={(next: string) =>
                document.documentElement.classList.toggle(
                  "dark",
                  next === "dark",
                )
              }
            >
              <SidebarAccountMenuRadioItem
                closeOnClick
                className="min-h-10"
                value="light"
              >
                {i18n.language === "zh" ? "浅色" : "Light"}
              </SidebarAccountMenuRadioItem>
              <SidebarAccountMenuRadioItem
                closeOnClick
                className="min-h-10"
                value="dark"
              >
                {i18n.language === "zh" ? "深色" : "Dark"}
              </SidebarAccountMenuRadioItem>
            </SidebarAccountMenuRadioGroup>
          </SidebarAccountMenuSubContent>
        </SidebarAccountMenuSub>
        <SidebarAccountMenuItem
          className="min-h-10"
          render={linkItems ? <DemoLink to="#help" /> : undefined}
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
export function SidebarAccountMenuExample(
  props: SidebarAccountMenuExampleProps,
) {
  return <MenuExample {...props} />;
}
SidebarAccountMenuExample.displayName = "SidebarAccountMenuExample";

export function SidebarAccountMenuEmptyExample(
  props: SidebarAccountMenuExampleProps,
) {
  return (
    <MenuExample
      {...props}
      options={{ recentWorkspaces: [], initialWorkspace: null }}
    />
  );
}
SidebarAccountMenuEmptyExample.displayName = "SidebarAccountMenuEmptyExample";

export function SidebarAccountMenuUserOnlyExample(
  props: SidebarAccountMenuExampleProps,
) {
  return <MenuExample {...props} options={{ showWorkspaces: false }} />;
}
SidebarAccountMenuUserOnlyExample.displayName =
  "SidebarAccountMenuUserOnlyExample";

export function SidebarAccountMenuLinksExample(
  props: SidebarAccountMenuExampleProps,
) {
  return <MenuExample {...props} options={{ linkItems: true }} />;
}
SidebarAccountMenuLinksExample.displayName = "SidebarAccountMenuLinksExample";
