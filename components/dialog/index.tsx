import type { ComponentProps, FC } from "react";
import { cn } from "@/lib/utils";
import { DialogContent as DialogContentComponent } from "@/components/ui/dialog";

// bg-background data-open:animate-in data-closed:animate-out data-closed:fade-out-0 data-open:fade-in-0 data-closed:zoom-out-95 data-open:zoom-in-95 ring-foreground/10 grid max-w-[calc(100%-2rem)] gap-6 rounded-xl p-6 text-sm ring-1 duration-100 fixed top-1/2 left-1/2 z-50 w-full -translate-x-1/2 -translate-y-1/2 outline-none sm:max-w-[425px]

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
