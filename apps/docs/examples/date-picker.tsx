"use client";

import { useState } from "react";

import { DatePicker } from "@/components/thread-ui/date-picker";
import { Button } from "@/components/ui/button";

const Example = () => {
  const [selected, setSelected] = useState<Date | undefined>(undefined);

  return (
    <DatePicker
      selected={selected}
      render={
        <Button variant="outline">
          {selected ? selected.toLocaleDateString() : "Pick a date"}
        </Button>
      }
      onSelect={setSelected}
    />
  );
};

export default Example;
