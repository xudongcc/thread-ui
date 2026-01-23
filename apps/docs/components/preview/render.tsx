import type { ReactNode } from "react";

interface PreviewRenderProps {
  children: ReactNode;
}

export const PreviewRender = ({ children }: PreviewRenderProps) => {
  return (
    <div className="relative flex size-full flex-col items-center justify-center gap-4 overflow-hidden p-8 [--primary-foreground:oklch(0.985_0_0)] [--primary:oklch(0.205_0_0)] dark:[--primary-foreground:oklch(0.205_0_0)] dark:[--primary:oklch(0.985_0_0)]">
      <div className="border-border/50 absolute top-8 right-0 left-0 -translate-y-px border border-dashed" />
      <div className="border-border/50 absolute right-0 bottom-8 left-0 translate-y-px border border-dashed" />
      <div className="border-border/50 absolute top-0 bottom-0 left-8 -translate-x-px border border-dashed" />
      <div className="border-border/50 absolute top-0 right-8 bottom-0 translate-x-px border border-dashed" />
      {children}
    </div>
  );
};
