"use client";

import { toast } from "@/components/thread-ui/toast";
import { Button } from "@/components/ui/button";

const Example = () => (
  <Button
    variant="outline"
    onClick={() => {
      toast("File deleted", {
        description: "Your file has been permanently deleted.",
        action: {
          label: "Undo",
          onClick: () => toast.success("File restored!"),
        },
      });
    }}
  >
    Show Toast with Action
  </Button>
);

export default Example;
