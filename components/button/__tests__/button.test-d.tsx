import { Button } from "../index";
import type { ComponentProps } from "react";

import type { ButtonProps } from "../index";

const ButtonApi = () => (
  <div>
    <Button>Default</Button>
    <Button loading>Loading</Button>
    <Button disabled loading={false}>
      Disabled
    </Button>
    <Button size="sm" type="submit" variant="outline">
      Submit
    </Button>
  </div>
);

const buttonProps: ButtonProps = {
  children: "Save",
  loading: true,
  variant: "default",
};

const buttonComponentProps: ComponentProps<typeof Button> = buttonProps;

export { ButtonApi, buttonComponentProps };
