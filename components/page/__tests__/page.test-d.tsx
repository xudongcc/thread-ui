import {
  PageActions,
  PageBackAction,
  PageHeader,
  PagePrimaryAction,
  PageSecondaryAction,
} from "../index";
import type { HTMLAttributes } from "react";
import type { PageActionProps } from "../index";

const PageActionTypeApi = (props: PageActionProps) => {
  const htmlAttributes: HTMLAttributes<HTMLElement> = props;
  const loadingActionProps: PageActionProps = {
    children: "Save",
    loading: true,
  };

  return (
    <>
      <PagePrimaryAction {...htmlAttributes}>Save</PagePrimaryAction>
      <PagePrimaryAction {...loadingActionProps} />
    </>
  );
};

const PageActionApi = () => (
  <PageHeader>
    <PageBackAction loading aria-label="Back" />
    <PageActions>
      <PageSecondaryAction onAction={() => undefined}>
        Duplicate
      </PageSecondaryAction>
      <PagePrimaryAction loading aria-label="Save">
        Save
      </PagePrimaryAction>
    </PageActions>
  </PageHeader>
);

const PageActionPropLimits = () => (
  <>
    {/* @ts-expect-error PagePrimaryAction owns its visual size. */}
    <PagePrimaryAction size="sm">Save</PagePrimaryAction>
    {/* @ts-expect-error PagePrimaryAction owns its visual variant. */}
    <PagePrimaryAction variant="secondary">Save</PagePrimaryAction>
    {/* @ts-expect-error PagePrimaryAction uses generic HTML attributes, not button-only attributes. */}
    <PagePrimaryAction type="submit">Save</PagePrimaryAction>
    {/* @ts-expect-error PageSecondaryAction is an action description, not a Button. */}
    <PageSecondaryAction variant="secondary">Duplicate</PageSecondaryAction>
  </>
);

export { PageActionApi, PageActionPropLimits, PageActionTypeApi };
