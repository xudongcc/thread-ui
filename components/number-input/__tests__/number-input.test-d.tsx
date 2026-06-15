import { NumberInput } from "../index";
import type { NumberInputProps } from "../index";

const NumberInputApi = () => (
  <NumberInput
    allowNegative={false}
    decimalScale={2}
    placeholder="Amount"
    prefix="$"
    thousandSeparator=","
    value={1200}
    onValueChange={() => undefined}
  />
);

const numberInputProps: NumberInputProps = {
  decimalScale: 2,
  disabled: true,
  placeholder: "Amount",
  value: 1200,
};

export { NumberInputApi, numberInputProps };
