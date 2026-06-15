"use client";

import { useState } from "react";

import { NumberInput } from "@/components/thread-ui/number-input";

export default function NumberInputPercentageExample() {
  const [value, setValue] = useState("12.5");

  return (
    <NumberInput
      className="max-w-xs"
      decimalScale={2}
      placeholder="Discount"
      suffix="%"
      value={value}
      onValueChange={(values) => setValue(values.value)}
    />
  );
}
