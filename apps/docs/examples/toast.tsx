"use client";

import { toast } from "@/components/thread-ui/toast";
import { Button } from "@/components/ui/button";

const Example = () => (
  <Button
    variant="outline"
    onClick={() => {
      toast.add({ title: "Event has been created." });
    }}
  >
    Show Toast
  </Button>
);

export default Example;
