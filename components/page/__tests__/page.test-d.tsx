import {
  PageActions,
  PageBackAction,
  PageHeader,
  PagePrimaryAction,
  PageSecondaryAction,
} from "../index";

const PageButtonApi = () => (
  <PageHeader>
    <PageBackAction aria-label="Back" />
    <PageActions>
      <PageSecondaryAction onAction={() => undefined}>
        Duplicate
      </PageSecondaryAction>
      <PagePrimaryAction type="submit">Save</PagePrimaryAction>
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
  </>
);

export { PageActionPropLimits, PageButtonApi };
