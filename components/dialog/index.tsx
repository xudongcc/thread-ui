"use client";

import { XIcon } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { ComponentProps, FC } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DialogClose,
  DialogContent as DialogContentComponent,
  DialogFooter as DialogFooterComponent,
} from "@/components/ui/dialog";

export const DialogContent: FC<
  ComponentProps<typeof DialogContentComponent>
> = ({ className, children, showCloseButton = true, ...props }) => {
  const { t } = useTranslation("thread-ui");
  return (
    <DialogContentComponent
      className={cn(
        className,
        "top-auto right-0 bottom-0 left-0 max-h-[80vh] max-w-full translate-0",
        "sm:top-1/2 sm:right-auto sm:bottom-auto sm:left-1/2 sm:-translate-1/2",
      )}
      {...props}
      showCloseButton={false}
    >
      {children}
      {showCloseButton && (
        <DialogClose
          render={
            <Button
              className="absolute top-4 right-4"
              size="icon-sm"
              variant="ghost"
            />
          }
        >
          <XIcon />
          <span className="sr-only">{t("dialog.close", "Close")}</span>
        </DialogClose>
      )}
    </DialogContentComponent>
  );
};

export const DialogFooter: FC<ComponentProps<typeof DialogFooterComponent>> = ({
  children,
  showCloseButton = false,
  ...props
}) => {
  const { t } = useTranslation("thread-ui");
  return (
    <DialogFooterComponent {...props} showCloseButton={false}>
      {children}
      {showCloseButton && (
        <DialogClose render={<Button variant="outline" />}>
          {t("dialog.close", "Close")}
        </DialogClose>
      )}
    </DialogFooterComponent>
  );
};

export {
  Dialog,
  DialogClose,
  DialogDescription,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
