import { CheckboxGroup, CheckboxGroupItem } from "@repo/checkbox-group";
import {
  Field,
  FieldContent,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@repo/shadcn-ui/components/ui/field";

const Example = () => (
  <FieldSet>
    <FieldLegend variant="label">Disabled Group</FieldLegend>
    <CheckboxGroup disabled defaultValue={["option1"]}>
      <Field orientation="horizontal">
        <CheckboxGroupItem name="option1" />
        <FieldContent>
          <FieldLabel>Option 1</FieldLabel>
        </FieldContent>
      </Field>
      <Field orientation="horizontal">
        <CheckboxGroupItem name="option2" />
        <FieldContent>
          <FieldLabel>Option 2</FieldLabel>
        </FieldContent>
      </Field>
      <Field orientation="horizontal">
        <CheckboxGroupItem name="option3" />
        <FieldContent>
          <FieldLabel>Option 3</FieldLabel>
        </FieldContent>
      </Field>
    </CheckboxGroup>
  </FieldSet>
);

export default Example;
