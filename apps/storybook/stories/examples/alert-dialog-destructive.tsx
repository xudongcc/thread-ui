import { Trash2 } from "lucide-react";
import { AlertDialogExample } from "./alert-dialog";
import type { AlertDialogOptions } from "@/components/thread-ui/alert-dialog";

export function DestructiveAlertDialogExample(options: AlertDialogOptions) {
  return <AlertDialogExample {...options} icon={<Trash2 />} />;
}

DestructiveAlertDialogExample.displayName = "DestructiveAlertDialogExample";
