"use client";

import { useState } from "react";

import { Textarea } from "@/components/thread-ui/textarea";

const Example = () => {
  const [value, setValue] = useState("");

  return (
    <Textarea
      description="Please provide detailed feedback about your experience"
      label="Feedback"
      placeholder="Tell us what you think..."
      value={value}
      onChange={(event) => setValue(event.target.value)}
    />
  );
};

export default Example;
