"use client";

import { alertDialog } from "@/components/thread-ui/alert-dialog";
import { Button } from "@/components/ui/button";

const Example = () => {
  const handleClick = async () => {
    const confirmed = await alertDialog({
      title: "Are you sure?",
      description: "This will save your changes to the server.",
    });

    if (confirmed) {
      // Handle confirmed action
    }
  };

  return (
    <Button variant="outline" onClick={handleClick}>
      Show Dialog
    </Button>
  );
};

export default Example;
