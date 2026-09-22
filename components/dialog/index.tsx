import type { ComponentProps, FC } from "react";
import { cn } from "@/lib/utils";
import { DialogContent as DialogContentComponent } from "@/components/ui/dialog";

export const DialogContent: FC<
  ComponentProps<typeof DialogContentComponent>
> = ({ className, ...props }) => (
  <DialogContentComponent
    className={cn(
      className,
      "top-auto right-2 bottom-2 left-2 max-h-[80vh] w-auto max-w-full translate-0 overflow-y-auto",
      "sm:top-1/2 sm:right-auto sm:bottom-auto sm:left-1/2 sm:w-full sm:-translate-1/2",
    )}
    {...props}
  />
);

export {
  Dialog,
  DialogClose,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
