"use client";

import { useState } from "react";

import { NumberInput } from "@/components/thread-ui/number-input";

export default function NumberInputExample() {
  const [value, setValue] = useState("1200");

  return (
    <div className="w-full max-w-sm space-y-3 rounded-lg border p-4">
      <NumberInput
        allowNegative={false}
        decimalScale={2}
        placeholder="Amount"
        prefix="$"
        thousandSeparator=","
        value={value}
        onValueChange={(values) => setValue(values.value)}
      />

      <div className="bg-muted rounded-md p-3 text-sm">
        <strong>Raw Value:</strong> {value || "empty"}
      </div>
    </div>
  );
}
