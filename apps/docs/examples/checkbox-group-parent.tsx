"use client";

import { CheckboxGroup, CheckboxGroupItem } from "@repo/checkbox-group";
import {
  Field,
  FieldContent,
  FieldLabel,
  FieldSet,
} from "@repo/shadcn-ui/components/ui/field";
import { useState } from "react";

const Example = () => {
  const [value, setValue] = useState<string[]>([]);

  return (
    <FieldSet>
      <CheckboxGroup
        allValues={["read", "write", "delete"]}
        value={value}
        onValueChange={setValue}
      >
        <Field orientation="horizontal">
          <CheckboxGroupItem parent />
          <FieldContent>
            <FieldLabel>All permissions</FieldLabel>
          </FieldContent>
        </Field>
        <Field orientation="horizontal">
          <CheckboxGroupItem name="read" />
          <FieldContent>
            <FieldLabel>Read</FieldLabel>
          </FieldContent>
        </Field>
        <Field orientation="horizontal">
          <CheckboxGroupItem name="write" />
          <FieldContent>
            <FieldLabel>Write</FieldLabel>
          </FieldContent>
        </Field>
        <Field orientation="horizontal">
          <CheckboxGroupItem name="delete" />
          <FieldContent>
            <FieldLabel>Delete</FieldLabel>
          </FieldContent>
        </Field>
      </CheckboxGroup>
    </FieldSet>
  );
};

export default Example;
