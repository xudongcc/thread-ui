import { CheckboxGroup, CheckboxGroupItem } from "@repo/checkbox-group";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@repo/shadcn-ui/components/ui/field";

const Example = () => (
  <FieldSet>
    <FieldLegend variant="label">Notifications</FieldLegend>
    <FieldDescription>
      Select the notifications you want to receive.
    </FieldDescription>
    <CheckboxGroup defaultValue={["email"]}>
      <Field orientation="horizontal">
        <CheckboxGroupItem name="email" />
        <FieldContent>
          <FieldLabel>Email notifications</FieldLabel>
          <FieldDescription>Receive notifications via email.</FieldDescription>
        </FieldContent>
      </Field>
      <Field orientation="horizontal">
        <CheckboxGroupItem name="sms" />
        <FieldContent>
          <FieldLabel>SMS notifications</FieldLabel>
          <FieldDescription>Receive notifications via SMS.</FieldDescription>
        </FieldContent>
      </Field>
      <Field orientation="horizontal">
        <CheckboxGroupItem name="push" />
        <FieldContent>
          <FieldLabel>Push notifications</FieldLabel>
          <FieldDescription>
            Receive push notifications on your device.
          </FieldDescription>
        </FieldContent>
      </Field>
    </CheckboxGroup>
  </FieldSet>
);

export default Example;
