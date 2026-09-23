import type { Meta, StoryObj } from "@storybook/react-vite";
import { FormLayout, FormLayoutItem } from "@/components/thread-ui/form-layout";
import { Input } from "@/components/thread-ui/input";
import { Textarea } from "@/components/thread-ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const meta = {
  id: "components-formlayout",
  title: "Forms/FormLayout",
  component: FormLayout,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Compose form fields with FormLayoutItem. Items are full width by default; halves share a row from a 32rem container width, and thirds/two-thirds from 48rem. Narrow containers stack fields in source order. The default gap is 1rem. FormLayout does not create a form, labels, validation, or submit behavior.",
      },
    },
  },
  render: (args) => (
    <Card>
      <CardHeader>
        <CardTitle>Contact details</CardTitle>
      </CardHeader>
      <CardContent>
        <FormLayout {...args}>
          <FormLayoutItem span="1/2">
            <Input defaultValue="Alex" label="First name" name="firstName" />
          </FormLayoutItem>
          <FormLayoutItem span="1/2">
            <Input defaultValue="Morgan" label="Last name" name="lastName" />
          </FormLayoutItem>
          <FormLayoutItem>
            <Input
              defaultValue="alex@example.com"
              description="We'll use this address for account notifications."
              label="Email"
              name="email"
              type="email"
            />
          </FormLayoutItem>
          <FormLayoutItem>
            <Textarea label="Notes" name="notes" rows={3} />
          </FormLayoutItem>
        </FormLayout>
      </CardContent>
    </Card>
  ),
} satisfies Meta<typeof FormLayout>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { name: "Composition API" };
export const MixedColumns: Story = {
  render: (args) => (
    <Card>
      <CardHeader>
        <CardTitle>Shipping address</CardTitle>
      </CardHeader>
      <CardContent>
        <FormLayout {...args}>
          <FormLayoutItem span="2/3">
            <Input label="Street address" name="street" />
          </FormLayoutItem>
          <FormLayoutItem span="1/3">
            <Input label="Apartment" name="apartment" />
          </FormLayoutItem>
          <FormLayoutItem span="1/3">
            <Input label="City" name="city" />
          </FormLayoutItem>
          <FormLayoutItem span="1/3">
            <Input label="State or province" name="province" />
          </FormLayoutItem>
          <FormLayoutItem span="1/3">
            <Input label="Postal code" name="postalCode" />
          </FormLayoutItem>
          <FormLayoutItem>
            <Textarea
              label="Delivery instructions"
              name="instructions"
              rows={3}
            />
          </FormLayoutItem>
        </FormLayout>
      </CardContent>
    </Card>
  ),
};
