"use client";

import dayjs from "dayjs";
import { ChevronDownIcon } from "lucide-react";
import type { ComponentProps, FC } from "react";

import { DatePicker } from "@/components/thread-ui/date-picker";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { cn } from "@/lib/utils";

export interface DateInputProps
  extends
    Omit<ComponentProps<typeof DatePicker>, "render">,
    Pick<ComponentProps<typeof Button>, "disabled"> {
  label?: string;
  description?: string;
  error?: string;
  format?: string;
  disabled?: boolean;
  placeholder?: string;
}

export const DateInput: FC<DateInputProps> = ({
  className,
  label,
  description,
  error,
  format,
  disabled,
  placeholder,
  ...props
}) => {
  return (
    <Field
      className={cn(className)}
      data-disabled={disabled}
      data-invalid={!!error}
    >
      {label && <FieldLabel htmlFor={props.id}>{label}</FieldLabel>}

      <DatePicker
        render={
          <Button
            aria-invalid={!!error}
            data-empty={!props.selected}
            disabled={disabled}
            variant="outline"
            className={cn(
              "data-[empty=true]:text-muted-foreground w-full justify-between text-left font-normal",
              className,
            )}
          >
            <span className="flex flex-1 text-left">
              {props.selected
                ? dayjs(props.selected).format(format ?? "YYYY-MM-DD")
                : placeholder}
            </span>

            <ChevronDownIcon data-icon="inline-end" />
          </Button>
        }
        {...props}
      />

      {(error || description) && (
        <FieldDescription className={cn(error && "text-destructive")}>
          {error || description}
        </FieldDescription>
      )}
    </Field>
  );
};
