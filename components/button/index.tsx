"use client";

import { useTranslation } from "react-i18next";

import type { ComponentProps, FC } from "react";

import { Button as ButtonComponent } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
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
  const { t } = useTranslation("thread-ui");
  return (
    <ButtonComponent
      className={cn("group/button relative", className)}
      data-loading={loading}
      disabled={loading || disabled}
      {...props}
    >
      <span className="absolute inset-0 hidden items-center justify-center group-data-[loading=true]/button:flex">
        <Spinner aria-label={t("button.loading", "Loading")} />
      </span>

      <span className="contents group-data-[loading=true]/button:invisible">
        {children}
      </span>
    </ButtonComponent>
  );
};
