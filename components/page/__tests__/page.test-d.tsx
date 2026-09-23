import { createRef } from "react";
import {
  BreadcrumbAction,
  BreadcrumbActions,
  PageActions,
  PageHeader,
  PageNextAction,
  PagePagination,
  PagePreviousAction,
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
    <BreadcrumbActions>
      <BreadcrumbAction aria-label="Back" className="custom-back">
        Projects
      </BreadcrumbAction>
    </BreadcrumbActions>
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
    {/* @ts-expect-error BreadcrumbAction only supports string class names. */}
    <BreadcrumbAction className={() => "custom-action"}>
      Projects
    </BreadcrumbAction>
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
  <BreadcrumbActions>
    <BreadcrumbAction
      ref={createRef<HTMLAnchorElement>()}
      render={<a href="/" />}
    >
      Home
    </BreadcrumbAction>
  </BreadcrumbActions>
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

export const pagination = (
  <PagePagination
    ref={createRef<HTMLDivElement>()}
    aria-label="Product navigation"
  >
    <PagePreviousAction ref={createRef<HTMLButtonElement>()} disabled />
    <PageNextAction
      aria-label="Next product"
      render={<a href="/products/next" />}
    />
  </PagePagination>
);
