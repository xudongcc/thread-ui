import { createRef } from "react";
import { PageLayout, PageLayoutSection } from "../index";
import type { PageLayoutProps, PageLayoutSectionProps } from "../index";

const layoutProps: PageLayoutProps = {
  "aria-label": "Account settings",
  className: "gap-4",
};

const sectionProps: PageLayoutSectionProps = {
  id: "primary-content",
  span: "2/3",
};

const PageLayoutApi = () => {
  const ref = createRef<HTMLDivElement>();

  return (
    <PageLayout {...layoutProps} ref={ref}>
      <PageLayoutSection {...sectionProps}>Primary</PageLayoutSection>
      <PageLayoutSection span="1/3">Secondary</PageLayoutSection>
    </PageLayout>
  );
};

export { PageLayoutApi };
