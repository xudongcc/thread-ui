"use client";

import dayjs from "dayjs";
import { ChevronDownIcon } from "lucide-react";
import { useId } from "react";
import type { ComponentProps, FC } from "react";

import { DatePicker } from "@/components/thread-ui/date-picker";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { cn } from "@/lib/utils";

export interface DateInputProps
  extends
    Omit<
      ComponentProps<typeof DatePicker>,
      "aria-describedby" | "aria-label" | "id" | "render"
    >,
    Pick<ComponentProps<typeof Button>, "disabled"> {
  id?: string;
  "aria-describedby"?: string;
  "aria-label"?: string;
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
  id: idProp,
  "aria-describedby": ariaDescribedBy,
  "aria-label": ariaLabel,
  ...props
}) => {
  const generatedId = useId();
  const id = idProp ?? generatedId;
  const descriptionId = `${id}-description`;
  const describedBy =
    [ariaDescribedBy, error || description ? descriptionId : undefined]
      .filter(Boolean)
      .join(" ") || undefined;

  return (
    <Field
      className={cn(className)}
      data-disabled={disabled}
      data-invalid={!!error}
    >
      {label && <FieldLabel htmlFor={id}>{label}</FieldLabel>}

      <DatePicker
        render={
          <Button
            aria-describedby={describedBy}
            aria-invalid={!!error}
            aria-label={ariaLabel}
            data-empty={!props.selected}
            disabled={disabled}
            id={id}
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
        <FieldDescription
          className={cn(error && "text-destructive")}
          id={descriptionId}
          role={error ? "alert" : undefined}
        >
          {error || description}
        </FieldDescription>
      )}
    </Field>
  );
};
