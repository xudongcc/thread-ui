import { BellIcon, LogOutIcon } from "lucide-react";
import { useState } from "react";
import type { TopbarProps } from "@/components/thread-ui/topbar";
import {
  Topbar,
  TopbarAction,
  TopbarActionGroup,
  TopbarBrand,
  TopbarMenu,
  TopbarMenuContent,
  TopbarMenuItem,
  TopbarMenuSeparator,
  TopbarMenuTrigger,
  TopbarMenuUser,
  TopbarMenuWorkspaceGroup,
  TopbarMenuWorkspaceItem,
} from "@/components/thread-ui/topbar";

const workspaces = [
  { id: "north", name: "North Studio", description: "north.example.com" },
  { id: "market", name: "Night Market", description: "market.example.com" },
  { id: "east", name: "East Studio", description: "east.example.com" },
];

export type TopbarExampleProps = Omit<TopbarProps, "children"> & {
  withLogo?: boolean;
};

/** Compose the header without a Layout or SidebarProvider. */
export function TopbarExample({
  withLogo = false,
  ...props
}: TopbarExampleProps) {
  const [workspace, setWorkspace] = useState("north");
  const [message, setMessage] = useState("");
  return (
    <div className="min-h-64">
      <Topbar {...props}>
        <TopbarBrand>
          <span className="inline-flex items-center gap-2.5 align-middle">
            {withLogo && (
              <svg
                aria-hidden="true"
                className="text-primary size-8 shrink-0"
                fill="none"
                viewBox="0 0 32 32"
              >
                <rect fill="currentColor" height="32" rx="9" width="32" />
                <path
                  className="text-primary-foreground"
                  d="M8 10h16M11 15h10M16 10v14"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2.5"
                />
              </svg>
            )}
            <span>Thread UI</span>
          </span>
        </TopbarBrand>
        <TopbarActionGroup>
          <TopbarAction
            aria-label="Notifications"
            onClick={() => setMessage("Notifications requested")}
          >
            <BellIcon />
          </TopbarAction>
        </TopbarActionGroup>
        <TopbarMenu
          currentWorkspace={workspaces.find((item) => item.id === workspace)}
          user={{ name: "Alex Morgan", email: "alex@example.com" }}
        >
          <TopbarMenuTrigger />
          <TopbarMenuContent>
            <TopbarMenuWorkspaceGroup
              value={workspace}
              onValueChange={(next: string) => {
                setWorkspace(next);
                setMessage("Workspace changed");
              }}
            >
              {[...workspaces]
                .sort(
                  (a, b) =>
                    Number(b.id === workspace) - Number(a.id === workspace),
                )
                .map((item) => (
                  <TopbarMenuWorkspaceItem key={item.id} workspace={item} />
                ))}
            </TopbarMenuWorkspaceGroup>
            <TopbarMenuSeparator />
            <TopbarMenuUser onClick={() => setMessage("Profile requested")} />
            <TopbarMenuSeparator />
            <TopbarMenuItem
              className="min-h-10"
              onClick={() => setMessage("Sign out requested")}
            >
              <LogOutIcon aria-hidden="true" />
              Sign out
            </TopbarMenuItem>
          </TopbarMenuContent>
        </TopbarMenu>
      </Topbar>
      <p className="text-muted-foreground p-4 text-sm" role="status">
        {message}
      </p>
    </div>
  );
}
TopbarExample.displayName = "TopbarExample";
