"use client";

import { Building2Icon, ChevronsUpDownIcon } from "lucide-react";
import { createContext, useContext } from "react";
import { useTranslation } from "react-i18next";
import type { ComponentProps, ReactNode } from "react";
import { buttonVariants } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

export type Workspace = {
  id: string;
  name: string;
  description?: string;
  icon?: ReactNode;
  disabled?: boolean;
};

export type SidebarUserMenuProps = Pick<
  ComponentProps<typeof DropdownMenu>,
  "open" | "defaultOpen" | "onOpenChange" | "onOpenChangeComplete"
> & {
  children: ReactNode;
  currentWorkspace?: Workspace;
  user?: { name: string; email?: string; avatar?: ReactNode };
  disabled?: boolean;
  loading?: boolean;
};

function getInitial(name: string) {
  return Array.from(name.trim().toUpperCase())[0] ?? "?";
}

function WorkspaceIcon({ workspace }: { workspace?: Workspace }) {
  return (
    <Avatar
      aria-hidden="true"
      className="bg-primary text-primary-foreground items-center justify-center overflow-hidden [&_img]:size-full [&_img]:object-cover [&_svg]:size-4"
      data-slot="workspace-icon"
    >
      {workspace?.icon}
      <AvatarFallback
        className="bg-primary text-primary-foreground text-xs font-semibold"
        // Icons leave the image idle; AvatarImage reports loading/error/loaded.
        render={(props: ComponentProps<"span">, state) => (
          <span
            {...props}
            className={cn(
              props.className,
              workspace?.icon != null &&
                state.imageLoadingStatus === "idle" &&
                "hidden",
            )}
          />
        )}
      >
        {workspace ? getInitial(workspace.name) : <Building2Icon />}
      </AvatarFallback>
    </Avatar>
  );
}

function UserAvatar({
  user,
}: {
  user: NonNullable<SidebarUserMenuProps["user"]>;
}) {
  return (
    <Avatar
      aria-hidden="true"
      className="bg-muted text-foreground items-center justify-center overflow-hidden [&_img]:size-full [&_img]:object-cover [&_svg]:size-4"
      data-slot="user-avatar"
    >
      {user.avatar}
      <AvatarFallback
        className="text-foreground text-xs font-semibold"
        render={(props: ComponentProps<"span">, state) => (
          <span
            {...props}
            className={cn(
              props.className,
              user.avatar != null &&
                state.imageLoadingStatus === "idle" &&
                "hidden",
            )}
          />
        )}
      >
        {getInitial(user.name)}
      </AvatarFallback>
    </Avatar>
  );
}

type MenuContextValue = {
  props: SidebarUserMenuProps;
  selected?: Workspace;
};
const MenuContext = createContext<MenuContextValue | null>(null);
function useSidebarUserMenu() {
  const context = useContext(MenuContext);
  if (!context)
    throw new Error("SidebarUserMenu parts must be inside SidebarUserMenu.");
  return context;
}

/** Composition only: children explicitly declare the trigger and menu. */
export function SidebarUserMenu(props: SidebarUserMenuProps) {
  const selected = props.currentWorkspace;
  return (
    <MenuContext.Provider value={{ props, selected }}>
      <DropdownMenu
        defaultOpen={props.defaultOpen}
        open={props.open}
        onOpenChange={props.onOpenChange}
        onOpenChangeComplete={props.onOpenChangeComplete}
      >
        {props.children}
      </DropdownMenu>
    </MenuContext.Provider>
  );
}

export type SidebarUserMenuTriggerProps = Omit<
  ComponentProps<typeof DropdownMenuTrigger>,
  "className"
> & { className?: string };
export function SidebarUserMenuTrigger({
  children,
  className,
  ...props
}: SidebarUserMenuTriggerProps) {
  const { t } = useTranslation("thread-ui");
  const { props: config, selected } = useSidebarUserMenu();
  const user = config.user;
  const label =
    selected?.name ??
    config.user?.name ??
    t("sidebarUserMenu.choose", "Choose workspace");
  return (
    <DropdownMenuTrigger
      aria-busy={config.loading || undefined}
      aria-haspopup="menu"
      aria-label={t(
        !selected && user
          ? "sidebarUserMenu.userMenu"
          : config.user
            ? "sidebarUserMenu.accountMenu"
            : "sidebarUserMenu.switch",
        {
          defaultValue:
            !selected && user
              ? "Account: {{name}}"
              : config.user
                ? "Workspace and account: {{name}}"
                : "Switch workspace: {{name}}",
          name: label,
        },
      )}
      {...props}
      data-loading={config.loading}
      disabled={config.disabled || config.loading || props.disabled}
      className={cn(
        buttonVariants({ variant: "ghost" }),
        "bg-sidebar text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground aria-expanded:bg-sidebar-accent aria-expanded:text-sidebar-accent-foreground relative h-12 w-full justify-start gap-2 rounded-lg px-2 text-left group-data-[collapsible=icon]:size-8 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-0",
        className,
      )}
    >
      <span className="absolute inset-0 hidden items-center justify-center group-data-[loading=true]/button:flex">
        <Spinner />
      </span>
      <span className="contents group-data-[loading=true]/button:invisible">
        {children !== undefined ? (
          children
        ) : (
          <>
            {user ? (
              <UserAvatar user={user} />
            ) : (
              <WorkspaceIcon workspace={selected} />
            )}
            <span className="min-w-0 flex-1 group-data-[collapsible=icon]:hidden">
              <span className="block truncate">
                {config.user?.name ?? label}
              </span>
              {config.user && (selected || config.user.email) && (
                <span className="text-muted-foreground block truncate text-xs font-normal">
                  {selected?.name ?? config.user?.email}
                </span>
              )}
            </span>
            <ChevronsUpDownIcon
              aria-hidden="true"
              className="size-4 shrink-0 group-data-[collapsible=icon]:hidden"
            />
          </>
        )}
      </span>
    </DropdownMenuTrigger>
  );
}

export type SidebarUserMenuContentProps = ComponentProps<
  typeof DropdownMenuContent
>;
export function SidebarUserMenuContent({
  className,
  ...props
}: SidebarUserMenuContentProps) {
  const isMobile = useIsMobile();
  return (
    <DropdownMenuContent
      align={isMobile ? "start" : "end"}
      side={isMobile ? "top" : "right"}
      sideOffset={8}
      {...props}
      className={cn(
        "w-72 max-w-[calc(100vw-2rem)] overflow-x-hidden overflow-y-auto overscroll-contain",
        className,
      )}
    />
  );
}

/** Workspace choices use native shadcn radio items as children. */
export type SidebarUserMenuWorkspaceGroupProps = ComponentProps<
  typeof DropdownMenuRadioGroup
>;
export function SidebarUserMenuWorkspaceGroup(
  props: SidebarUserMenuWorkspaceGroupProps,
) {
  const { t } = useTranslation("thread-ui");
  return (
    <DropdownMenuGroup>
      <DropdownMenuRadioGroup
        aria-label={t("sidebarUserMenu.recentWorkspaces", "Recent workspaces")}
        {...props}
      />
    </DropdownMenuGroup>
  );
}

export type SidebarUserMenuWorkspaceLabelProps = ComponentProps<
  typeof DropdownMenuLabel
>;
export function SidebarUserMenuWorkspaceLabel({
  children,
  ...props
}: SidebarUserMenuWorkspaceLabelProps) {
  const { t } = useTranslation("thread-ui");
  return (
    <DropdownMenuLabel {...props}>
      {children === undefined
        ? t("sidebarUserMenu.recentWorkspaces", "Recent workspaces")
        : children}
    </DropdownMenuLabel>
  );
}

export type SidebarUserMenuWorkspaceItemProps = Omit<
  ComponentProps<typeof DropdownMenuRadioItem>,
  "value"
> & {
  workspace: Workspace;
};
export function SidebarUserMenuWorkspaceItem({
  workspace,
  children,
  className,
  disabled,
  ...props
}: SidebarUserMenuWorkspaceItemProps) {
  return (
    <DropdownMenuRadioItem
      closeOnClick
      aria-label={workspace.name}
      {...props}
      disabled={workspace.disabled || disabled}
      value={workspace.id}
      className={cn(
        "focus:[&_[data-slot=workspace-icon]]:text-primary-foreground focus:[&_[data-slot=workspace-icon]_*]:text-primary-foreground min-h-12 gap-2",
        className,
      )}
    >
      {children ?? (
        <>
          <WorkspaceIcon workspace={workspace} />
          <span className="min-w-0 flex-1">
            <span className="block truncate font-medium">{workspace.name}</span>
            {workspace.description && (
              <span className="text-muted-foreground block truncate text-xs">
                {workspace.description}
              </span>
            )}
          </span>
        </>
      )}
    </DropdownMenuRadioItem>
  );
}

export type SidebarUserMenuUserProps = Omit<
  ComponentProps<typeof DropdownMenuItem>,
  "children" | "className"
> & {
  user?: SidebarUserMenuProps["user"];
  className?: string;
};
export function SidebarUserMenuUser({
  user: suppliedUser,
  className,
  render,
  onClick,
  "aria-label": ariaLabel,
  ...props
}: SidebarUserMenuUserProps) {
  const { t } = useTranslation("thread-ui");
  const {
    props: { user: contextUser },
  } = useSidebarUserMenu();
  const user = suppliedUser ?? contextUser;
  if (!user) return null;
  const interactive = Boolean(onClick || render);
  const rowClassName = cn(
    "text-foreground flex min-h-12 items-center gap-2 px-2 py-1.5",
    className,
  );
  const content = (
    <>
      <UserAvatar user={user} />
      <span className="min-w-0">
        <span className="block truncate text-sm font-medium">{user.name}</span>
        {user.email && (
          <span className="text-muted-foreground block truncate text-xs font-normal">
            {user.email}
          </span>
        )}
      </span>
    </>
  );
  // The informational row forwards DOM props without leaking menu-item options.
  const {
    disabled,
    closeOnClick: _closeOnClick,
    label: _label,
    nativeButton: _nativeButton,
    variant: _variant,
    style,
    ...labelProps
  } = props;
  const informationalProps = interactive
    ? undefined
    : {
        ...labelProps,
        style:
          typeof style === "function"
            ? style({ disabled: disabled ?? false, highlighted: false })
            : style,
      };
  return (
    <DropdownMenuGroup>
      {interactive ? (
        <DropdownMenuItem
          {...props}
          className={rowClassName}
          render={render}
          aria-label={
            ariaLabel ??
            t("sidebarUserMenu.profile", {
              defaultValue: "Open profile: {{name}}",
              name: user.name,
            })
          }
          onClick={onClick}
        >
          {content}
        </DropdownMenuItem>
      ) : (
        <DropdownMenuLabel
          {...informationalProps}
          aria-label={ariaLabel}
          className={rowClassName}
        >
          {content}
        </DropdownMenuLabel>
      )}
    </DropdownMenuGroup>
  );
}

export { DropdownMenuSeparator as SidebarUserMenuSeparator };
export type SidebarUserMenuSeparatorProps = ComponentProps<
  typeof DropdownMenuSeparator
>;

export { DropdownMenuItem as SidebarUserMenuItem };
export type SidebarUserMenuItemProps = ComponentProps<typeof DropdownMenuItem>;

export {
  DropdownMenuSub as SidebarUserMenuSub,
  DropdownMenuSubTrigger as SidebarUserMenuSubTrigger,
  DropdownMenuSubContent as SidebarUserMenuSubContent,
  DropdownMenuRadioGroup as SidebarUserMenuRadioGroup,
  DropdownMenuRadioItem as SidebarUserMenuRadioItem,
};
export type SidebarUserMenuSubProps = ComponentProps<typeof DropdownMenuSub>;
export type SidebarUserMenuSubTriggerProps = ComponentProps<
  typeof DropdownMenuSubTrigger
>;
export type SidebarUserMenuSubContentProps = ComponentProps<
  typeof DropdownMenuSubContent
>;
export type SidebarUserMenuRadioGroupProps = ComponentProps<
  typeof DropdownMenuRadioGroup
>;
export type SidebarUserMenuRadioItemProps = ComponentProps<
  typeof DropdownMenuRadioItem
>;
