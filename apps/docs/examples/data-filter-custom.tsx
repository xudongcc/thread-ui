"use client";

import { useState } from "react";
import type {
  DataFilterItemProps,
  DataFilterValues,
} from "@/components/thread-ui/data-filter";
import { DataFilter } from "@/components/thread-ui/data-filter";
import { Select } from "@/components/thread-ui/select";
import { DatePicker } from "@/components/thread-ui/date-picker";
import { Button } from "@/components/ui/button";

const formatDate = (value: Date | string) => {
  const date = value instanceof Date ? value : new Date(value);
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");

  return `${year}-${month}-${day}`;
};

export default function DataFilterCustomExample() {
  const [values, setValues] = useState<DataFilterValues>({});

  const filters: DataFilterItemProps[] = [
    {
      field: "role",
      label: "User Role",
      type: "input",
      render: ({ field: { value, onChange } }) => (
        <div className="min-w-48 p-2">
          <Select
            placeholder="Select role"
            value={value}
            items={[
              { value: "admin", label: "Admin" },
              { value: "editor", label: "Editor" },
              { value: "viewer", label: "Viewer" },
            ]}
            onValueChange={(nextValue) => {
              onChange(nextValue ?? undefined);
            }}
          />
        </div>
      ),
      renderValue: ({ value }) => {
        const roles: Record<string, string> = {
          admin: "Admin",
          editor: "Editor",
          viewer: "Viewer",
        };
        return roles[value as string] || value;
      },
    },
    {
      field: "createdAt",
      label: "Created After",
      type: "date-picker",
      render: ({ field: { value, onChange } }) => {
        const selectedValue =
          value instanceof Date || typeof value === "string"
            ? value
            : undefined;

        return (
          <div className="min-w-48 p-2">
            <DatePicker
              selected={selectedValue ? new Date(selectedValue) : undefined}
              render={
                <Button
                  className="w-full justify-start text-left font-normal"
                  variant="outline"
                >
                  {selectedValue ? formatDate(selectedValue) : "Pick a date"}
                </Button>
              }
              onSelect={(date) =>
                onChange(date ? date.toISOString() : undefined)
              }
            />
          </div>
        );
      },
      renderValue: ({ value }) => {
        const selectedValue =
          value instanceof Date || typeof value === "string"
            ? value
            : undefined;

        return selectedValue ? formatDate(selectedValue) : "";
      },
    },
  ];

  return (
    <div className="w-full space-y-4 rounded-lg border p-4">
      <DataFilter filters={filters} values={values} onChange={setValues} />
      <div className="bg-muted mt-4 rounded-md p-4 text-sm">
        <strong>Filter Output:</strong>
        <pre>{JSON.stringify(values, null, 2)}</pre>
      </div>
    </div>
  );
}
