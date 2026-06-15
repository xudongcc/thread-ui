import {
  CheckboxGroup,
  CheckboxGroupItem,
} from "@/components/thread-ui/checkbox-group";

const Example = () => (
  <CheckboxGroup
    allValues={["email", "sms", "push"]}
    defaultValue={["email"]}
    description="Select the notifications you want to receive."
    label="Notifications"
  >
    <CheckboxGroupItem parent>All notifications</CheckboxGroupItem>
    <CheckboxGroupItem
      description="Receive notifications via email."
      value="email"
    >
      Email notifications
    </CheckboxGroupItem>
    <CheckboxGroupItem description="Receive notifications via SMS." value="sms">
      SMS notifications
    </CheckboxGroupItem>
    <CheckboxGroupItem value="push">Push notifications</CheckboxGroupItem>
  </CheckboxGroup>
);

export default Example;
