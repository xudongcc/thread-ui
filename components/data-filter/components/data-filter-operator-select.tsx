import { ChevronDown } from "lucide-react";
import {
  getDataFilterBetweenValue,
  getDataFilterOperatorLabel,
  getDataFilterOperators,
} from "../utils";
import type { FC } from "react";

import type { DataFilterOperatorSelectProps } from "../interfaces";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const DataFilterOperatorSelect: FC<DataFilterOperatorSelectProps> = ({
  item,
  operator,
  value,
  onChange,
}) => {
  const operators = getDataFilterOperators(item);
  const selectedOperatorLabel =
    value === null && operator === "$eq"
      ? "is empty"
      : value === null && operator === "$ne"
        ? "is not empty"
        : getDataFilterOperatorLabel(operator);

  const getNextValue = (nextOperator: string) => {
    if (value === null) {
      return undefined;
    }

    if (operator === "$between") {
      const range = getDataFilterBetweenValue(value);

      return nextOperator === "$lt" || nextOperator === "$lte"
        ? (range.$lte ?? range.$gte)
        : (range.$gte ?? range.$lte);
    }

    if (nextOperator === "$between") {
      return operator === "$lt" || operator === "$lte"
        ? {
            $lte: value,
          }
        : {
            $gte: value,
          };
    }

    return value;
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button size="xs" type="button" variant="ghost">
            <span>{item.label}</span>
            <span>{selectedOperatorLabel}</span>
            <ChevronDown />
          </Button>
        }
      />

      <DropdownMenuContent align="start" className="w-64">
        {operators.map((itemOperator) => {
          return (
            <DropdownMenuItem
              key={itemOperator}
              onClick={() => {
                onChange(itemOperator, getNextValue(itemOperator));
              }}
            >
              {getDataFilterOperatorLabel(itemOperator)}
            </DropdownMenuItem>
          );
        })}

        <DropdownMenuItem
          onClick={() => {
            onChange("$eq", null);
          }}
        >
          is empty
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => {
            onChange("$ne", null);
          }}
        >
          is not empty
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
