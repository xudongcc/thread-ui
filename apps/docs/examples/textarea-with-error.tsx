"use client";

import { useState } from "react";

import { Textarea } from "@/components/thread-ui/textarea";

const Example = () => {
  const [value, setValue] = useState("");

  return (
    <Textarea
      error="Bio must be at least 50 characters"
      label="Bio"
      placeholder="Write a short bio..."
      value={value}
      onChange={(event) => setValue(event.target.value)}
    />
  );
};

export default Example;
