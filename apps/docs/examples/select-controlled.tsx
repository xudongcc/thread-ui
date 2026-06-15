"use client";

import { useState } from "react";

import { Select } from "@/components/thread-ui/select";

const Example = () => {
  const [value, setValue] = useState<string | null>(null);

  return (
    <div className="space-y-4">
      <Select
        description="Choose your preferred color theme"
        label="Theme"
        placeholder="Select theme"
        value={value}
        items={[
          { value: "light", label: "Light" },
          { value: "dark", label: "Dark" },
          { value: "system", label: "System" },
        ]}
        onValueChange={(newValue) => setValue(newValue)}
      />

      {value && (
        <p className="text-muted-foreground text-sm">
          Selected theme: <span className="font-medium">{value}</span>
        </p>
      )}
    </div>
  );
};

export default Example;
