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
  SidebarAccountMenuProps,
  Workspace,
} from "@/components/thread-ui/sidebar-account-menu";
import {
  SidebarAccountMenu,
  SidebarAccountMenuContent,
  SidebarAccountMenuItem,
  SidebarAccountMenuRadioGroup,
  SidebarAccountMenuRadioItem,
  SidebarAccountMenuSeparator,
  SidebarAccountMenuSub,
  SidebarAccountMenuSubContent,
  SidebarAccountMenuSubTrigger,
  SidebarAccountMenuTrigger,
  SidebarAccountMenuUser,
  SidebarAccountMenuWorkspaceGroup,
  SidebarAccountMenuWorkspaceItem,
  SidebarAccountMenuWorkspaceLabel,
} from "@/components/thread-ui/sidebar-account-menu";

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

export type SidebarAccountMenuExampleProps = Omit<
  SidebarAccountMenuProps,
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
export function SidebarAccountMenuExample(
  args: SidebarAccountMenuExampleProps,
) {
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
}: SidebarAccountMenuExampleProps) {
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
      <SidebarAccountMenu {...args} currentWorkspace={selected}>
        <SidebarAccountMenuTrigger />
        <SidebarAccountMenuContent>
          {recent.length > 0 && (
            <SidebarAccountMenuWorkspaceGroup
              value={value ?? ""}
              onValueChange={(next: string) => {
                if (next !== value) {
                  setValue(next);
                  onValueChange?.(next);
                }
              }}
            >
              <SidebarAccountMenuWorkspaceLabel />
              {recent.map((workspace) => (
                <SidebarAccountMenuWorkspaceItem
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
            </SidebarAccountMenuWorkspaceGroup>
          )}
          {onCreateWorkspace && (
            <>
              {recent.length > 0 && <SidebarAccountMenuSeparator />}
              <SidebarAccountMenuItem
                className="min-h-10"
                onClick={() =>
                  action("Create workspace requested", onCreateWorkspace)
                }
              >
                <PlusIcon aria-hidden="true" />
                {t("sidebarAccountMenu.create")}
              </SidebarAccountMenuItem>
            </>
          )}
          {args.user && (
            <>
              {hasWorkspaceSection && <SidebarAccountMenuSeparator />}
              <SidebarAccountMenuUser
                render={linkItems ? <DemoLink to="#profile" /> : undefined}
                onClick={
                  onProfile
                    ? () => action("Profile requested", onProfile)
                    : undefined
                }
              />
              <SidebarAccountMenuSeparator />
            </>
          )}
          {linkItems && (
            <>
              {!args.user && <SidebarAccountMenuSeparator />}
              <SidebarAccountMenuItem
                className="min-h-10"
                render={(props) => <DemoLink {...props} to="#billing" />}
                onClick={() => action("Billing requested")}
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
          {!args.user && !linkItems && <SidebarAccountMenuSeparator />}
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
          {onHelp && (
            <SidebarAccountMenuItem
              className="min-h-10"
              render={linkItems ? <DemoLink to="#help" /> : undefined}
              onClick={onHelp}
            >
              <CircleHelpIcon aria-hidden="true" />
              {t("sidebarAccountMenu.help")}
            </SidebarAccountMenuItem>
          )}
          {onSignOut && (
            <>
              <SidebarAccountMenuSeparator />
              <SidebarAccountMenuItem className="min-h-10" onClick={onSignOut}>
                <LogOutIcon aria-hidden="true" />
                {t("sidebarAccountMenu.signOut")}
              </SidebarAccountMenuItem>
            </>
          )}
        </SidebarAccountMenuContent>
      </SidebarAccountMenu>
      {message && <p role="status">{message}</p>}
    </div>
  );
}
SidebarAccountMenuExample.displayName = "SidebarAccountMenuExample";

export function SidebarAccountMenuLinksExample(
  args: SidebarAccountMenuExampleProps,
) {
  return <SidebarAccountMenuExample {...args} linkItems />;
}
SidebarAccountMenuLinksExample.displayName = "SidebarAccountMenuLinksExample";
