import { FormLayout, FormLayoutItem } from "@/components/thread-ui/form-layout";
import { Input } from "@/components/thread-ui/input";
import { Textarea } from "@/components/thread-ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Example() {
  return (
    <Card className="w-full max-w-3xl">
      <CardHeader>
        <CardTitle>Contact details</CardTitle>
      </CardHeader>
      <CardContent>
        <FormLayout>
          <FormLayoutItem span="1/2">
            <Input label="First name" name="firstName" />
          </FormLayoutItem>
          <FormLayoutItem span="1/2">
            <Input label="Last name" name="lastName" />
          </FormLayoutItem>
          <FormLayoutItem>
            <Input label="Email" name="email" type="email" />
          </FormLayoutItem>
          <FormLayoutItem>
            <Textarea label="Notes" name="notes" rows={3} />
          </FormLayoutItem>
        </FormLayout>
      </CardContent>
    </Card>
  );
}
