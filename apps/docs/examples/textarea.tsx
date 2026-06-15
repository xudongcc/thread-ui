"use client";

import { useState } from "react";

import { Textarea } from "@/components/thread-ui/textarea";

const Example = () => {
  const [value, setValue] = useState("");

  return (
    <Textarea
      label="Message"
      placeholder="Enter your message"
      value={value}
      onChange={(event) => setValue(event.target.value)}
    />
  );
};

export default Example;
