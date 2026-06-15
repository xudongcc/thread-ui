"use client";

import { useState } from "react";

import { DateInput } from "@/components/thread-ui/date-input";

const Example = () => {
  const [selected, setSelected] = useState<Date | undefined>(undefined);

  return (
    <DateInput
      description="Select your date of birth"
      label="Birth Date"
      placeholder="Pick a date"
      selected={selected}
      onSelect={setSelected}
    />
  );
};

export default Example;
