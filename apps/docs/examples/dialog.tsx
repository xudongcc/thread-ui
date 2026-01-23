import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@repo/dialog";
import { Button } from "@repo/shadcn-ui/components/ui/button";

const Example = () => (
  <Dialog>
    <DialogTrigger asChild>
      <Button variant="outline">Open Dialog</Button>
    </DialogTrigger>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Dialog Title</DialogTitle>
        <DialogDescription>
          This is a responsive dialog component. It displays as a Dialog on
          desktop and automatically switches to a Drawer on mobile devices.
        </DialogDescription>
      </DialogHeader>
      <div className="py-4">
        <p className="text-muted-foreground text-sm">
          Add your dialog content here.
        </p>
      </div>
    </DialogContent>
  </Dialog>
);

export default Example;
