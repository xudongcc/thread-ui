"use client";

import { Toast as ToastPrimitive } from "@base-ui/react/toast";
import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
  XIcon,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import type { FC } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type ToastProviderProps = ToastPrimitive.Provider.Props;
export const toast = ToastPrimitive.createToastManager();

const toastIcons = {
  success: CircleCheckIcon,
  info: InfoIcon,
  warning: TriangleAlertIcon,
  error: OctagonXIcon,
  loading: Loader2Icon,
};

const toastClassName = cn(
  "group/toast pointer-events-auto absolute right-0 bottom-0 z-[calc(1000-var(--toast-index))] w-full origin-bottom rounded-2xl border bg-popover text-popover-foreground shadow-lg will-change-transform outline-none select-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50",
  "[--gap:0.75rem] [--height:var(--toast-frontmost-height,var(--toast-height))] [--offset-y:calc(var(--toast-offset-y)*-1+calc(var(--toast-index)*var(--gap)*-1)+var(--toast-swipe-movement-y))] [--peek:0.75rem] [--scale:calc(max(0,1-(var(--toast-index)*0.1)))] [--shrink:calc(1-var(--scale))]",
  "h-(--height) [transform:translateX(var(--toast-swipe-movement-x))_translateY(calc(var(--toast-swipe-movement-y)-(var(--toast-index)*var(--peek))-(var(--shrink)*var(--height))))_scale(var(--scale))] [transition:transform_500ms_cubic-bezier(0.22,1,0.36,1),opacity_500ms,height_150ms]",
  "after:absolute after:top-full after:left-0 after:h-[calc(var(--gap)+1px)] after:w-full after:content-['']",
  "data-expanded:h-(--toast-height) data-expanded:[transform:translateX(var(--toast-swipe-movement-x))_translateY(var(--offset-y))]",
  "data-limited:opacity-0 data-starting-style:[transform:translateY(150%)]",
  "[&[data-ending-style]:not([data-limited]):not([data-swipe-direction])]:[transform:translateY(150%)]",
  "data-ending-style:data-[swipe-direction=down]:[transform:translateY(calc(var(--toast-swipe-movement-y)+150%))]",
  "data-ending-style:data-[swipe-direction=left]:[transform:translateX(calc(var(--toast-swipe-movement-x)-150%))_translateY(var(--offset-y))]",
  "data-ending-style:data-[swipe-direction=right]:[transform:translateX(calc(var(--toast-swipe-movement-x)+150%))_translateY(var(--offset-y))]",
  "data-ending-style:data-[swipe-direction=up]:[transform:translateY(calc(var(--toast-swipe-movement-y)-150%))]",
  "data-expanded:data-ending-style:data-[swipe-direction=down]:[transform:translateY(calc(var(--toast-swipe-movement-y)+150%))]",
  "data-expanded:data-ending-style:data-[swipe-direction=left]:[transform:translateX(calc(var(--toast-swipe-movement-x)-150%))_translateY(var(--offset-y))]",
  "data-expanded:data-ending-style:data-[swipe-direction=right]:[transform:translateX(calc(var(--toast-swipe-movement-x)+150%))_translateY(var(--offset-y))]",
  "data-expanded:data-ending-style:data-[swipe-direction=up]:[transform:translateY(calc(var(--toast-swipe-movement-y)-150%))]",
);

const ToastViewport = () => {
  const { t } = useTranslation("thread-ui");
  const { toasts } = ToastPrimitive.useToastManager();
  return (
    <ToastPrimitive.Portal data-slot="toast-portal">
      <ToastPrimitive.Viewport
        aria-label={t("toast.notifications", "Notifications")}
        className="pointer-events-none fixed inset-x-4 bottom-4 z-50 mx-auto w-auto max-w-sm outline-none sm:right-4 sm:left-auto sm:mx-0 sm:w-full"
        data-slot="toast-viewport"
      >
        {toasts.map((item) => {
          const Icon =
            item.type && Object.hasOwn(toastIcons, item.type)
              ? toastIcons[item.type as keyof typeof toastIcons]
              : undefined;
          return (
            <ToastPrimitive.Root
              key={item.id}
              className={toastClassName}
              data-slot="toast"
              toast={item}
            >
              <ToastPrimitive.Content
                className="flex h-full items-center gap-3 overflow-hidden p-4 transition-opacity duration-250 ease-[cubic-bezier(0.22,1,0.36,1)] data-behind:opacity-0 data-expanded:opacity-100"
                data-slot="toast-content"
              >
                {Icon && (
                  <Icon
                    aria-hidden="true"
                    data-slot="toast-icon"
                    className={cn(
                      "pointer-events-none size-4 shrink-0",
                      item.type === "loading" && "animate-spin",
                      item.type === "error" && "text-destructive",
                    )}
                  />
                )}
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  <ToastPrimitive.Title
                    className="text-sm font-medium"
                    data-slot="toast-title"
                  />
                  <ToastPrimitive.Description
                    className="text-muted-foreground text-sm"
                    data-slot="toast-description"
                  />
                </div>
                <ToastPrimitive.Action
                  className="shrink-0"
                  data-slot="toast-action"
                  render={<Button size="sm" variant="outline" />}
                />
                <ToastPrimitive.Close
                  aria-label={t("toast.close", "Close toast")}
                  className="text-muted-foreground hover:text-foreground relative shrink-0 after:absolute after:-inset-2 after:content-['']"
                  data-slot="toast-close"
                  render={<Button size="icon-sm" variant="ghost" />}
                >
                  <XIcon aria-hidden="true" />
                </ToastPrimitive.Close>
              </ToastPrimitive.Content>
            </ToastPrimitive.Root>
          );
        })}
      </ToastPrimitive.Viewport>
    </ToastPrimitive.Portal>
  );
};

export const ToastProvider: FC<ToastProviderProps> = ({
  children,
  toastManager = toast,
  ...props
}) => (
  <ToastPrimitive.Provider {...props} toastManager={toastManager}>
    {children}
    <ToastViewport />
  </ToastPrimitive.Provider>
);
