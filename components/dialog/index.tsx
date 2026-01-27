import type { ComponentProps, FC } from "react";
import { cn } from "@/lib/utils";
import { DialogContent as DialogContentComponent } from "@/components/ui/dialog";

export const DialogContent: FC<
  ComponentProps<typeof DialogContentComponent>
> = ({ className, ...props }) => (
  <DialogContentComponent
    className={cn(
      className,
      "top-auto right-0 bottom-0 left-0 max-w-full translate-0",
      "sm:top-1/2 sm:right-auto sm:bottom-auto sm:left-1/2 sm:-translate-1/2",
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
