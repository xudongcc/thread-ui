import type { ReactNode } from "react";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { cn } from "@/lib/utils";

interface PreviewContentProps {
  children: ReactNode;
  id: string;
  type: "component" | "block";
}

export const PreviewContent = ({ children, id, type }: PreviewContentProps) => {
  const groupId = `preview-${id}`;

  return (
    <ResizablePanelGroup
      className="size-full"
      id={groupId}
      orientation="horizontal"
    >
      <ResizablePanel
        defaultSize="100%"
        id={`${groupId}-content`}
        maxSize="100%"
        minSize="40%"
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
        id={`${groupId}-handle`}
      />
      <ResizablePanel
        className="bg-background border-none"
        defaultSize="0%"
        id={`${groupId}-spacer`}
        maxSize="70%"
        minSize="0%"
      />
    </ResizablePanelGroup>
  );
};
