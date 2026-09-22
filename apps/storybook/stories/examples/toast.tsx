import { toast } from "@/components/thread-ui/toast";
import { Button } from "@/components/thread-ui/button";

export function ToastExample(options: Parameters<typeof toast.add>[0]) {
  return (
    <Button variant="outline" onClick={() => toast.add(options)}>
      Show notification
    </Button>
  );
}

export function restoreFile() {
  toast.add({ title: "File restored", type: "success" });
}

// Keep Code panel component names stable in production builds.
ToastExample.displayName = "ToastExample";
