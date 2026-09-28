import {
  CircleHelpIcon,
  CreditCardIcon,
  LanguagesIcon,
  LockKeyholeIcon,
  LogOutIcon,
  PlusIcon,
  SunMoonIcon,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { I18nextProvider, useTranslation } from "react-i18next";
import type { ComponentProps } from "react";
import type {
  SidebarUserMenuProps,
  Workspace,
} from "@/components/thread-ui/sidebar-user-menu";
import {
  SidebarUserMenu,
  SidebarUserMenuContent,
  SidebarUserMenuItem,
  SidebarUserMenuRadioGroup,
  SidebarUserMenuRadioItem,
  SidebarUserMenuSeparator,
  SidebarUserMenuSub,
  SidebarUserMenuSubContent,
  SidebarUserMenuSubTrigger,
  SidebarUserMenuTrigger,
  SidebarUserMenuUser,
  SidebarUserMenuWorkspaceGroup,
  SidebarUserMenuWorkspaceItem,
  SidebarUserMenuWorkspaceLabel,
} from "@/components/thread-ui/sidebar-user-menu";

export const workspaces = [
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

export type SidebarUserMenuExampleProps = Omit<
  SidebarUserMenuProps,
  "children"
> & {
  workspaces?: readonly Workspace[];
  value?: string | null;
  onValueChange?: (value: string) => void;
  onCreateWorkspace?: () => void;
  onProfile?: () => void;
  onHelp?: () => void;
  onSignOut?: () => void;
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
export function SidebarUserMenuExample(args: SidebarUserMenuExampleProps) {
  const { i18n } = useTranslation();
  const instance = useMemo(() => i18n.cloneInstance(), [i18n]);
  return (
    <I18nextProvider i18n={instance}>
      <MenuExampleContent {...args} />
    </I18nextProvider>
  );
}

/** Only the demo owns recent-workspace data and application navigation. */
function MenuExampleContent({
  workspaces = [],
  currentWorkspace,
  value: initialValue,
  onValueChange,
  onCreateWorkspace,
  onProfile,
  onHelp,
  onSignOut,
  linkItems = false,
  ...args
}: SidebarUserMenuExampleProps) {
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
  const [value, setValue] = useState(initialValue);
  const [message, setMessage] = useState("");
  const selected = [currentWorkspace, ...workspaces].find(
    (item) => item?.id === value,
  );
  // The application supplies recent tenants; include the current one and cap at three.
  const recent = [
    ...new Map(
      [
        ...(selected ? [selected] : []),
        ...workspaces.filter((item) => item.id !== selected?.id),
      ].map((item) => [item.id, item]),
    ).values(),
  ].slice(0, 3);
  const hasWorkspaceSection = recent.length > 0 || Boolean(onCreateWorkspace);
  const action = (message: string, callback?: () => void) => {
    setMessage(message);
    callback?.();
  };
  return (
    <div className="w-64 max-w-full space-y-4">
      <SidebarUserMenu {...args} currentWorkspace={selected}>
        <SidebarUserMenuTrigger />
        <SidebarUserMenuContent>
          {recent.length > 0 && (
            <SidebarUserMenuWorkspaceGroup
              value={value ?? ""}
              onValueChange={(next: string) => {
                if (next !== value) {
                  setValue(next);
                  onValueChange?.(next);
                }
              }}
            >
              <SidebarUserMenuWorkspaceLabel />
              {recent.map((workspace) => (
                <SidebarUserMenuWorkspaceItem
                  key={workspace.id}
                  workspace={workspace}
                  render={
                    linkItems
                      ? (props, state) => (
                          <DemoLink
                            {...props}
                            data-selected={state.checked || undefined}
                            to={`#workspace-${workspace.id}`}
                          />
                        )
                      : undefined
                  }
                />
              ))}
            </SidebarUserMenuWorkspaceGroup>
          )}
          {onCreateWorkspace && (
            <>
              {recent.length > 0 && <SidebarUserMenuSeparator />}
              <SidebarUserMenuItem
                className="min-h-10"
                onClick={() =>
                  action("Create workspace requested", onCreateWorkspace)
                }
              >
                <PlusIcon aria-hidden="true" />
                {t("sidebarUserMenu.create")}
              </SidebarUserMenuItem>
            </>
          )}
          {args.user && (
            <>
              {hasWorkspaceSection && <SidebarUserMenuSeparator />}
              <SidebarUserMenuUser
                render={linkItems ? <DemoLink to="#profile" /> : undefined}
                onClick={
                  onProfile
                    ? () => action("Profile requested", onProfile)
                    : undefined
                }
              />
              <SidebarUserMenuSeparator />
            </>
          )}
          {linkItems && (
            <>
              {!args.user && <SidebarUserMenuSeparator />}
              <SidebarUserMenuItem
                className="min-h-10"
                render={(props) => <DemoLink {...props} to="#billing" />}
                onClick={() => action("Billing requested")}
              >
                <CreditCardIcon aria-hidden="true" />
                Billing
              </SidebarUserMenuItem>
              <SidebarUserMenuItem
                disabled
                className="min-h-10"
                render={<DemoLink to="#audit" />}
              >
                <LockKeyholeIcon aria-hidden="true" />
                Audit log
              </SidebarUserMenuItem>
            </>
          )}
          {!args.user && !linkItems && <SidebarUserMenuSeparator />}
          <SidebarUserMenuSub>
            <SidebarUserMenuSubTrigger className="min-h-10">
              <LanguagesIcon aria-hidden="true" />
              {t("sidebarUserMenu.language")}
            </SidebarUserMenuSubTrigger>
            <SidebarUserMenuSubContent>
              <SidebarUserMenuRadioGroup
                value={i18n.resolvedLanguage ?? "en"}
                onValueChange={(next: string) => {
                  void i18n.changeLanguage(next);
                }}
              >
                <SidebarUserMenuRadioItem
                  closeOnClick
                  className="min-h-10"
                  value="en"
                >
                  English
                </SidebarUserMenuRadioItem>
                <SidebarUserMenuRadioItem
                  closeOnClick
                  className="min-h-10"
                  value="zh"
                >
                  中文
                </SidebarUserMenuRadioItem>
              </SidebarUserMenuRadioGroup>
            </SidebarUserMenuSubContent>
          </SidebarUserMenuSub>
          <SidebarUserMenuSub>
            <SidebarUserMenuSubTrigger className="min-h-10">
              <SunMoonIcon aria-hidden="true" />
              {t("sidebarUserMenu.theme")}
            </SidebarUserMenuSubTrigger>
            <SidebarUserMenuSubContent>
              <SidebarUserMenuRadioGroup
                value={theme}
                onValueChange={(next: string) =>
                  document.documentElement.classList.toggle(
                    "dark",
                    next === "dark",
                  )
                }
              >
                <SidebarUserMenuRadioItem
                  closeOnClick
                  className="min-h-10"
                  value="light"
                >
                  {i18n.language === "zh" ? "浅色" : "Light"}
                </SidebarUserMenuRadioItem>
                <SidebarUserMenuRadioItem
                  closeOnClick
                  className="min-h-10"
                  value="dark"
                >
                  {i18n.language === "zh" ? "深色" : "Dark"}
                </SidebarUserMenuRadioItem>
              </SidebarUserMenuRadioGroup>
            </SidebarUserMenuSubContent>
          </SidebarUserMenuSub>
          {onHelp && (
            <SidebarUserMenuItem
              className="min-h-10"
              render={linkItems ? <DemoLink to="#help" /> : undefined}
              onClick={onHelp}
            >
              <CircleHelpIcon aria-hidden="true" />
              {t("sidebarUserMenu.help")}
            </SidebarUserMenuItem>
          )}
          {onSignOut && (
            <>
              <SidebarUserMenuSeparator />
              <SidebarUserMenuItem className="min-h-10" onClick={onSignOut}>
                <LogOutIcon aria-hidden="true" />
                {t("sidebarUserMenu.signOut")}
              </SidebarUserMenuItem>
            </>
          )}
        </SidebarUserMenuContent>
      </SidebarUserMenu>
      {message && <p role="status">{message}</p>}
    </div>
  );
}
SidebarUserMenuExample.displayName = "SidebarUserMenuExample";

export function SidebarUserMenuLinksExample(args: SidebarUserMenuExampleProps) {
  return <SidebarUserMenuExample {...args} linkItems />;
}
SidebarUserMenuLinksExample.displayName = "SidebarUserMenuLinksExample";
