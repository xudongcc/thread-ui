import { useState } from "react";
import type { AlertDialogOptions } from "@/components/thread-ui/alert-dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/thread-ui/alert-dialog";
import { Button } from "@/components/thread-ui/button";

export default function CompositionExample(args: AlertDialogOptions) {
  const [open, setOpen] = useState(false);
  const [result, setResult] = useState("Not answered");
  return (
    <div className="space-y-3">
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogTrigger render={<Button>Open confirmation</Button>} />
        <AlertDialogContent size={args.size}>
          <AlertDialogHeader>
            <AlertDialogTitle>{args.title}</AlertDialogTitle>
            <AlertDialogDescription>{args.description}</AlertDialogDescription>
          </AlertDialogHeader>
          {args.content}
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setResult("Canceled")}>
              {args.cancelText ?? "Cancel"}
            </AlertDialogCancel>
            <AlertDialogAction
              variant={args.variant}
              onClick={() => {
                setResult("Confirmed");
                setOpen(false);
              }}
            >
              {args.confirmText ?? "Confirm"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <p role="status">{result}</p>
    </div>
  );
}
