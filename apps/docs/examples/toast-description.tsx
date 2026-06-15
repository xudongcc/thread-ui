"use client";

import { toast } from "@/components/thread-ui/toast";
import { Button } from "@/components/ui/button";

const Example = () => (
  <Button
    variant="outline"
    onClick={() => {
      toast("Event Created", {
        description: "Your event has been scheduled for tomorrow at 10:00 AM.",
      });
    }}
  >
    Show Toast with Description
  </Button>
);

export default Example;
