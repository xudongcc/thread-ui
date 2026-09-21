"use client";

import { toast } from "@/components/thread-ui/toast";
import { Button } from "@/components/ui/button";

const Example = () => (
  <Button
    variant="outline"
    onClick={() => {
      toast.add({
        title: "File deleted",
        description: "Your file has been permanently deleted.",
        actionProps: {
          children: "Undo",
          onClick: () =>
            toast.add({ title: "File restored!", type: "success" }),
        },
      });
    }}
  >
    Show Toast with Action
  </Button>
);

export default Example;
