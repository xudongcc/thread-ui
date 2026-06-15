"use client";

import { toast } from "@/components/thread-ui/toast";
import { Button } from "@/components/ui/button";

const Example = () => (
  <div className="flex flex-wrap gap-2">
    <Button variant="outline" onClick={() => toast("Default toast")}>
      Default
    </Button>
    <Button variant="outline" onClick={() => toast.success("Success!")}>
      Success
    </Button>
    <Button variant="outline" onClick={() => toast.info("Did you know?")}>
      Info
    </Button>
    <Button variant="outline" onClick={() => toast.warning("Be careful!")}>
      Warning
    </Button>
    <Button
      variant="outline"
      onClick={() => toast.error("Something went wrong")}
    >
      Error
    </Button>
  </div>
);

export default Example;
