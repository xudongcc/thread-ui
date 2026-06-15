"use client";

import { Trash2Icon } from "lucide-react";

import { alertDialog } from "@/components/thread-ui/alert-dialog";
import { Button } from "@/components/ui/button";

const Example = () => {
  const handleDelete = async () => {
    const confirmed = await alertDialog({
      title: "Delete this item?",
      description:
        "This action cannot be undone. This will permanently delete the item from our servers.",
      icon: <Trash2Icon />,
      confirmText: "Delete",
      variant: "destructive",
    });

    if (confirmed) {
      // Handle delete action
    }
  };

  return (
    <Button variant="destructive" onClick={handleDelete}>
      Delete Item
    </Button>
  );
};

export default Example;
