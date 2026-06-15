"use client";

import { useState } from "react";
import type { ComponentProps, FC } from "react";

import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export interface DatePickerProps
  extends
    Omit<ComponentProps<typeof Calendar>, "mode">,
    Pick<ComponentProps<typeof PopoverTrigger>, "render">,
    Pick<ComponentProps<typeof PopoverContent>, "align"> {
  selected?: Date;
  onSelect?: (date?: Date) => void;
}

export const DatePicker: FC<DatePickerProps> = ({
  render,
  align = "start",
  ...props
}) => {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger render={render} />
      <PopoverContent align={align} className="w-auto overflow-hidden p-0">
        <Calendar
          {...props}
          captionLayout="dropdown"
          defaultMonth={props.selected}
          mode="single"
          selected={props.selected}
          onSelect={(date) => {
            props.onSelect?.(date);
            setOpen(false);
          }}
        />
      </PopoverContent>
    </Popover>
  );
};
