"use client";

import { LogOutIcon } from "lucide-react";

import { alertDialog } from "@/components/thread-ui/alert-dialog";
import { Button } from "@/components/ui/button";

const Example = () => {
  const handleLogout = async () => {
    const confirmed = await alertDialog({
      title: "Sign out?",
      icon: <LogOutIcon />,
      size: "sm",
    });

    if (confirmed) {
      // Handle sign out
    }
  };

  return (
    <Button variant="outline" onClick={handleLogout}>
      Sign Out
    </Button>
  );
};

export default Example;
