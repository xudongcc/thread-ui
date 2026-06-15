"use client";

import { useState } from "react";

import { DateInput } from "@/components/thread-ui/date-input";

const Example = () => {
  const [selected, setSelected] = useState<Date | undefined>(undefined);

  return (
    <div className="space-y-4">
      <DateInput
        format="MMMM D, YYYY"
        placeholder="Select a date"
        selected={selected}
        onSelect={setSelected}
      />

      {selected && (
        <p className="text-muted-foreground text-sm">
          Selected:{" "}
          <span className="font-medium">{selected.toLocaleDateString()}</span>
        </p>
      )}
    </div>
  );
};

export default Example;
