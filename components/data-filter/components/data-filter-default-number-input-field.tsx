import { getDataFilterBetweenValue } from "../utils";
import type { DataFilterDefaultNumberInputFieldProps } from "../interfaces/data-filter-default-number-input-field-props";
import type { FC } from "react";
import { NumberInput } from "@/components/thread-ui/number-input";

export const DataFilterDefaultNumberInputField: FC<
  DataFilterDefaultNumberInputFieldProps
> = ({ item, operator, value, onChange }) => {
  if (operator === "$between") {
    const range = getDataFilterBetweenValue(value);

    return (
      <div className="grid gap-2 px-2 pb-2">
        <NumberInput
          aria-label={`${item.label} minimum`}
          decimalScale={item.decimalScale}
          fixedDecimalScale={item.fixedDecimalScale}
          max={item.max}
          min={item.min}
          step={item.step}
          value={typeof range.$gte === "number" ? range.$gte : ""}
          onValueChange={({ floatValue }) => {
            onChange({
              ...range,
              $gte: floatValue,
            });
          }}
        />

        <NumberInput
          aria-label={`${item.label} maximum`}
          decimalScale={item.decimalScale}
          fixedDecimalScale={item.fixedDecimalScale}
          max={item.max}
          min={item.min}
          step={item.step}
          value={typeof range.$lte === "number" ? range.$lte : ""}
          onValueChange={({ floatValue }) => {
            onChange({
              ...range,
              $lte: floatValue,
            });
          }}
        />
      </div>
    );
  }

  return (
    <div className="px-2 pb-2">
      <NumberInput
        decimalScale={item.decimalScale}
        fixedDecimalScale={item.fixedDecimalScale}
        max={item.max}
        min={item.min}
        placeholder={item.placeholder}
        step={item.step}
        value={typeof value === "number" ? value : ""}
        onValueChange={({ floatValue }) => {
          onChange(floatValue);
        }}
      />
    </div>
  );
};
