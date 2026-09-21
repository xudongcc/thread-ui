"use client";

import { Loader2Icon } from "lucide-react";
import type { ComponentProps, FC } from "react";

import { Button as ButtonComponent } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type ButtonProps = ComponentProps<typeof ButtonComponent> & {
  loading?: boolean;
};

export const Button: FC<ButtonProps> = ({
  loading,
  disabled,
  className,
  children,
  ...props
}) => {
  return (
    <ButtonComponent
      aria-busy={loading || undefined}
      className={cn("relative", className)}
      data-loading={loading}
      disabled={loading || disabled}
      {...props}
    >
      {loading && (
        <Loader2Icon
          aria-hidden="true"
          className="absolute size-4 animate-spin"
        />
      )}
      <span
        className={cn(
          "inline-flex items-center justify-center gap-[inherit]",
          loading && "opacity-0",
        )}
      >
        {children}
      </span>
    </ButtonComponent>
  );
};
