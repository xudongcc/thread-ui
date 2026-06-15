"use client";

import { useState } from "react";

import { DateInput } from "@/components/thread-ui/date-input";

const Example = () => {
  const [selected, setSelected] = useState<Date | undefined>(undefined);

  return (
    <DateInput
      label="Date"
      placeholder="Select a date"
      selected={selected}
      onSelect={setSelected}
    />
  );
};

export default Example;
