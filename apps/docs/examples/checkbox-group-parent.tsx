"use client";

import { useState } from "react";
import { CheckboxGroup } from "@/components/thread-ui/checkbox-group";

const Example = () => {
  const [value, setValue] = useState<string[]>([]);

  return (
    <CheckboxGroup
      label="Permissions"
      parent={{ label: "All permissions" }}
      value={value}
      items={[
        { value: "read", label: "Read" },
        { value: "write", label: "Write" },
        { value: "delete", label: "Delete" },
      ]}
      onValueChange={setValue}
    />
  );
};

export default Example;
