import { createRef } from "react";
import {
  PageActions,
  PageBackAction,
  PageHeader,
  PagePrimaryAction,
  PageSecondaryAction,
} from "../index";
import type { PageActionProps } from "../index";

const PageActionTypeApi = (props: PageActionProps) => {
  const loadingActionProps: PageActionProps = {
    children: "Save",
    loading: true,
  };
  return (
    <>
      <PagePrimaryAction {...props}>Save</PagePrimaryAction>
      <PagePrimaryAction {...loadingActionProps} />
    </>
  );
};

const PageActionApi = () => (
  <PageHeader>
    <PageBackAction loading aria-label="Back" className="custom-back" />
    <PageActions>
      <PageSecondaryAction
        className="custom-secondary"
        onAction={() => undefined}
      >
        Duplicate
      </PageSecondaryAction>
      <PagePrimaryAction loading aria-label="Save" className="custom-primary">
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
    {/* @ts-expect-error PageSecondaryAction is an action description, not a Button. */}
    <PageSecondaryAction variant="secondary">Duplicate</PageSecondaryAction>
    {/* @ts-expect-error PageSecondaryAction requires children. */}
    <PageSecondaryAction />
    {/* @ts-expect-error PagePrimaryAction only supports string class names. */}
    <PagePrimaryAction className={() => "custom-action"}>
      Save
    </PagePrimaryAction>
    {/* @ts-expect-error PageBackAction only supports string class names. */}
    <PageBackAction className={() => "custom-action"} />
    {/* @ts-expect-error PageSecondaryAction only supports string class names. */}
    <PageSecondaryAction className={() => "custom-action"}>
      Edit
    </PageSecondaryAction>
  </>
);

export { PageActionApi, PageActionPropLimits, PageActionTypeApi };

export const submit = (
  <PagePrimaryAction
    ref={createRef<HTMLButtonElement>()}
    disabled
    form="profile"
    type="submit"
  >
    Save
  </PagePrimaryAction>
);
export const back = (
  <PageBackAction nativeButton={false} render={<a href="/" />} />
);
export const secondary = (
  <PageSecondaryAction
    disabled
    aria-label="Edit profile"
    data-tracking-id="edit"
    title="Edit"
  >
    Edit
  </PageSecondaryAction>
);

export const invalid = (
  // @ts-expect-error Button types must remain restricted to valid HTML button types.
  <PagePrimaryAction type="invalid">Save</PagePrimaryAction>
);
