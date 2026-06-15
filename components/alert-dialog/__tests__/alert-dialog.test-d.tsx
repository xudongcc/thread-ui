import { AlertDialogProvider, alertDialog } from "../index";
import type { ReactNode } from "react";

import type { AlertDialogOptions } from "../index";

const AlertDialogProviderApi = ({ children }: { children: ReactNode }) => (
  <AlertDialogProvider>{children}</AlertDialogProvider>
);

const alertDialogOptions: AlertDialogOptions = {
  title: "Delete item?",
  description: "This action cannot be undone.",
  content: <div>Additional confirmation copy.</div>,
  icon: <div aria-hidden />,
  size: "sm",
  cancelText: "Cancel",
  confirmText: "Delete",
  variant: "destructive",
};

const alertDialogResult: Promise<boolean> = alertDialog(alertDialogOptions);

export { AlertDialogProviderApi, alertDialogOptions, alertDialogResult };
