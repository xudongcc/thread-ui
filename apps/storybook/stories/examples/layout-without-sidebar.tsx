import type { LayoutProps } from "@/components/thread-ui/layout";
import { Layout, LayoutContent } from "@/components/thread-ui/layout";
import {
  Page,
  PageContent,
  PageDescription,
  PageHeader,
  PageTitle,
} from "@/components/thread-ui/page";
import { Input } from "@/components/thread-ui/input";
import { FormLayout, FormLayoutItem } from "@/components/thread-ui/form-layout";
import { Card, CardContent } from "@/components/ui/card";
import {
  PageLayout,
  PageLayoutSection,
} from "@/components/thread-ui/page-layout";

export function LayoutWithoutSidebarExample(args: LayoutProps) {
  return (
    <Layout {...args}>
      <LayoutContent id="account-content">
        <Page variant="full">
          <PageHeader>
            <PageTitle>Profile</PageTitle>
            <PageDescription>Manage your account details.</PageDescription>
          </PageHeader>
          <PageContent>
            <PageLayout>
              <PageLayoutSection>
                <Card>
                  <CardContent>
                    <FormLayout>
                      <FormLayoutItem span="1/2">
                        <Input defaultValue="Alex Morgan" label="Name" />
                      </FormLayoutItem>
                      <FormLayoutItem span="1/2">
                        <Input defaultValue="alex@example.com" label="Email" />
                      </FormLayoutItem>
                    </FormLayout>
                  </CardContent>
                </Card>
              </PageLayoutSection>
            </PageLayout>
          </PageContent>
        </Page>
      </LayoutContent>
    </Layout>
  );
}

LayoutWithoutSidebarExample.displayName = "LayoutWithoutSidebarExample";
