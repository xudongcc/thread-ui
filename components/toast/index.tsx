"use client";

import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import type { ComponentProps, FC } from "react";

import {
  Toast,
  ToastAction,
  ToastClose,
  ToastContent,
  ToastDescription,
  ToastPortal,
  ToastProvider as ToastProviderComponent,
  ToastTitle,
  ToastViewport,
  toast,
  useToastManager,
} from "@/components/ui/toast";

export type ToastProviderProps = ComponentProps<typeof ToastProviderComponent>;

const toastIcons = {
  success: CircleCheckIcon,
  info: InfoIcon,
  warning: TriangleAlertIcon,
  error: OctagonXIcon,
  loading: Loader2Icon,
};

const ToastList = () => {
  const { t } = useTranslation("thread-ui");
  const { toasts } = useToastManager();
  return toasts.map((item) => {
    const Icon =
      item.type && Object.hasOwn(toastIcons, item.type)
        ? toastIcons[item.type as keyof typeof toastIcons]
        : undefined;
    return (
      <Toast key={item.id} toast={item}>
        <ToastContent>
          {Icon && (
            <span
              className="shrink-0 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4"
              data-slot="toast-icon"
            >
              <Icon
                aria-hidden="true"
                className={
                  item.type === "loading"
                    ? "animate-spin"
                    : item.type === "error"
                      ? "text-destructive"
                      : undefined
                }
              />
            </span>
          )}
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <ToastTitle />
            <ToastDescription />
          </div>
          <ToastAction />
          <ToastClose aria-label={t("toast.close", "Close toast")} />
        </ToastContent>
      </Toast>
    );
  });
};

export const ToastProvider: FC<ToastProviderProps> = ({
  children,
  toastManager = toast,
  ...props
}) => {
  const { t } = useTranslation("thread-ui");
  return (
    <ToastProviderComponent {...props} toastManager={toastManager}>
      {children}
      <ToastPortal>
        <ToastViewport aria-label={t("toast.notifications", "Notifications")}>
          <ToastList />
        </ToastViewport>
      </ToastPortal>
    </ToastProviderComponent>
  );
};

export { toast };
