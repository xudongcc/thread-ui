import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@repo/shadcn-ui/components/ui/resizable";
import { cn } from "@repo/shadcn-ui/lib/utils";
import type { ReactNode } from "react";

interface PreviewContentProps {
  children: ReactNode;
  type: "component" | "block";
}

export const PreviewContent = ({ children, type }: PreviewContentProps) => {
  return (
    <ResizablePanelGroup className="size-full" direction="horizontal">
      <ResizablePanel
        defaultSize={100}
        maxSize={100}
        minSize={40}
        className={cn(
          "not-fumadocs-codeblock peer size-full",
          type === "component" ? "overflow-hidden!" : "overflow-auto!",
        )}
      >
        {children}
      </ResizablePanel>
      <ResizableHandle
        withHandle
        className="peer-data-[panel-size=100.0]:w-0"
      />
      <ResizablePanel
        className="bg-background border-none"
        defaultSize={0}
        maxSize={70}
        minSize={0}
      />
    </ResizablePanelGroup>
  );
};
