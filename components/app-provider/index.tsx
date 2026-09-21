"use client";

import { I18nextProvider } from "react-i18next";
import type { FC, PropsWithChildren } from "react";
import type { i18n as I18nInstance } from "i18next";

import type { ToastProviderProps } from "@/components/thread-ui/toast";
import { AlertDialogProvider } from "@/components/thread-ui/alert-dialog";
import { ToastProvider } from "@/components/thread-ui/toast";

export type AppProviderProps = PropsWithChildren<{
  /** Override the inherited i18next instance when provided. */
  i18n?: I18nInstance;
  toast?: ToastProviderProps;
}>;

export const AppProvider: FC<AppProviderProps> = ({
  children,
  i18n,
  toast,
}) => {
  const content = (
    <AlertDialogProvider>
      <ToastProvider {...toast}>{children}</ToastProvider>
    </AlertDialogProvider>
  );

  return i18n ? (
    <I18nextProvider i18n={i18n}>{content}</I18nextProvider>
  ) : (
    content
  );
};
