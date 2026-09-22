import { useState } from "react";
import type { AlertDialogOptions } from "@/components/thread-ui/alert-dialog";
import { alertDialog } from "@/components/thread-ui/alert-dialog";
import { Button } from "@/components/thread-ui/button";

export default function AlertDialogExample(options: AlertDialogOptions) {
  const [result, setResult] = useState("Not answered");
  return (
    <div className="space-y-3">
      <Button
        onClick={async () =>
          setResult((await alertDialog(options)) ? "Confirmed" : "Canceled")
        }
      >
        Open confirmation
      </Button>
      <p role="status">{result}</p>
    </div>
  );
}
