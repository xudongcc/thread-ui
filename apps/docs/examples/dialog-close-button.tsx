"use client";

import { CopyIcon } from "lucide-react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/thread-ui/dialog";

const Example = () => (
  <Dialog>
    <DialogTrigger className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex h-9 items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium whitespace-nowrap shadow-xs outline-none focus-visible:ring-1">
      Share
    </DialogTrigger>
    <DialogContent className="sm:max-w-md" showCloseButton={false}>
      <DialogHeader>
        <DialogTitle>Share link</DialogTitle>
        <DialogDescription>
          Anyone who has this link will be able to view this.
        </DialogDescription>
      </DialogHeader>
      <div className="flex items-center gap-2">
        <div className="grid flex-1">
          <input
            readOnly
            className="border-input bg-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-9 w-full rounded-md border px-3 py-1 text-sm shadow-xs focus-visible:ring-1 focus-visible:outline-none"
            defaultValue="https://ui.shadcn.com/docs/installation"
            id="link"
          />
        </div>
        <button
          className="border-input bg-background hover:bg-accent hover:text-accent-foreground inline-flex size-9 shrink-0 items-center justify-center rounded-md border text-sm font-medium shadow-xs"
          type="button"
        >
          <CopyIcon className="size-4" />
          <span className="sr-only">Copy</span>
        </button>
      </div>
      <DialogFooter className="sm:justify-start">
        <DialogClose className="border-input bg-background hover:bg-accent hover:text-accent-foreground inline-flex h-9 items-center justify-center gap-2 rounded-md border px-4 py-2 text-sm font-medium whitespace-nowrap shadow-xs outline-none focus-visible:ring-1">
          Close
        </DialogClose>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);

export default Example;
