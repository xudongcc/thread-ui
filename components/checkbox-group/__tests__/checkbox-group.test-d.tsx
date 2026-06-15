import { CheckboxGroup, CheckboxGroupItem } from "../index";
import type {
  CheckboxGroupOptionProps,
  CheckboxGroupParentProps,
  CheckboxGroupProps,
} from "../index";

const checkboxItems: Array<CheckboxGroupOptionProps<"email" | "sms" | "push">> =
  [
    {
      value: "email",
      label: "Email notifications",
      description: "Receive notifications via email.",
    },
    { value: "sms", label: "SMS notifications" },
    { value: "push", label: "Push notifications", disabled: true },
  ];

const checkboxParent: CheckboxGroupParentProps = {
  label: "All notifications",
};

const CheckboxGroupApi = () => (
  <CheckboxGroup
    defaultValue={["email"]}
    description="Select the notifications you want to receive."
    items={checkboxItems}
    label="Notifications"
    parent={checkboxParent}
  />
);

const CheckboxGroupCompoundApi = () => (
  <CheckboxGroup
    allValues={["email", "sms", "push"]}
    defaultValue={["email"]}
    description="Select the notifications you want to receive."
    label="Notifications"
  >
    <CheckboxGroupItem parent>All notifications</CheckboxGroupItem>
    <CheckboxGroupItem value="email">Email notifications</CheckboxGroupItem>
    <CheckboxGroupItem description="Receive notifications via SMS." value="sms">
      SMS notifications
    </CheckboxGroupItem>
    <CheckboxGroupItem value="push">Push notifications</CheckboxGroupItem>
  </CheckboxGroup>
);

const checkboxGroupProps: CheckboxGroupProps<string> = {
  defaultValue: ["email"],
  description: "Select options.",
  items: checkboxItems,
  label: "Notifications",
  onValueChange: () => undefined,
};

const checkboxGroupCompoundProps: CheckboxGroupProps<string> = {
  allValues: ["email"],
  children: <CheckboxGroupItem value="email">Email</CheckboxGroupItem>,
  defaultValue: ["email"],
  description: "Select options.",
  label: "Notifications",
};

// @ts-expect-error items are unavailable when children are supplied.
const checkboxGroupMixedProps: CheckboxGroupProps<string> = {
  children: <CheckboxGroupItem value="email">Email</CheckboxGroupItem>,
  items: checkboxItems,
  label: "Notifications",
};

// @ts-expect-error allValues is derived from items in props-first mode.
const checkboxGroupItemsAllValuesProps: CheckboxGroupProps<string> = {
  allValues: ["email"],
  items: checkboxItems,
  label: "Notifications",
};

export {
  CheckboxGroupApi,
  CheckboxGroupCompoundApi,
  checkboxGroupCompoundProps,
  checkboxGroupItemsAllValuesProps,
  checkboxGroupMixedProps,
  checkboxGroupProps,
};
