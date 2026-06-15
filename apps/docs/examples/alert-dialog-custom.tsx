"use client";

import { alertDialog } from "@/components/thread-ui/alert-dialog";
import { Button } from "@/components/ui/button";

const Example = () => {
  const handleLogout = async () => {
    const confirmed = await alertDialog({
      title: "Sign out?",
      description: "You will need to sign in again to access your account.",
      cancelText: "Stay signed in",
      confirmText: "Sign out",
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
