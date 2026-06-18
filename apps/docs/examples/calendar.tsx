"use client";

import { useState } from "react";

import { Calendar } from "@/components/thread-ui/calendar";

const Example = () => {
  const [selected, setSelected] = useState<Date | undefined>(
    new Date("2025-03-15"),
  );

  return (
    <Calendar
      captionLayout="dropdown"
      mode="single"
      selected={selected}
      onSelect={setSelected}
    />
  );
};

export default Example;
