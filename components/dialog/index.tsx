"use client";

import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import { XIcon } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { ComponentProps, FC } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { DialogOverlay } from "@/components/ui/dialog";

export const DialogContent: FC<
  DialogPrimitive.Popup.Props & {
    showCloseButton?: boolean;
  }
> = ({ className, children, showCloseButton = true, ...props }) => {
  const { t } = useTranslation("thread-ui");
  return (
    <DialogPrimitive.Portal data-slot="dialog-portal">
      <DialogOverlay />
      <DialogPrimitive.Popup
        className={cn(
          "bg-popover text-popover-foreground ring-foreground/5 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95 fixed z-50 grid w-full gap-6 rounded-4xl p-6 text-sm ring-1 duration-100 outline-none sm:max-w-md",
          className,
          "top-auto right-0 bottom-0 left-0 max-h-[80vh] max-w-full translate-0",
          "sm:top-1/2 sm:right-auto sm:bottom-auto sm:left-1/2 sm:-translate-1/2",
        )}
        {...props}
        data-slot="dialog-content"
      >
        {children}
        {showCloseButton && (
          <DialogPrimitive.Close
            data-slot="dialog-close"
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
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Popup>
    </DialogPrimitive.Portal>
  );
};

export const DialogFooter: FC<
  ComponentProps<"div"> & { showCloseButton?: boolean }
> = ({ children, showCloseButton = false, className, ...props }) => {
  const { t } = useTranslation("thread-ui");
  return (
    <div
      {...props}
      data-slot="dialog-footer"
      className={cn(
        "flex flex-col-reverse gap-2 sm:flex-row sm:justify-end",
        className,
      )}
    >
      {children}
      {showCloseButton && (
        <DialogPrimitive.Close
          data-slot="dialog-close"
          render={<Button variant="outline" />}
        >
          {t("dialog.close", "Close")}
        </DialogPrimitive.Close>
      )}
    </div>
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
