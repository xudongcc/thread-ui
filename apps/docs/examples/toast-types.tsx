"use client";

import { toast } from "@/components/thread-ui/toast";
import { Button } from "@/components/ui/button";

const Example = () => (
  <div className="flex flex-wrap gap-2">
    <Button
      variant="outline"
      onClick={() => toast.add({ title: "Default toast" })}
    >
      Default
    </Button>
    <Button
      variant="outline"
      onClick={() => toast.add({ title: "Success!", type: "success" })}
    >
      Success
    </Button>
    <Button
      variant="outline"
      onClick={() => toast.add({ title: "Did you know?", type: "info" })}
    >
      Info
    </Button>
    <Button
      variant="outline"
      onClick={() => toast.add({ title: "Be careful!", type: "warning" })}
    >
      Warning
    </Button>
    <Button
      variant="outline"
      onClick={() =>
        toast.add({ title: "Something went wrong", type: "error" })
      }
    >
      Error
    </Button>
  </div>
);

export default Example;
