import {
  PageLayout,
  PageLayoutSection,
} from "@/components/thread-ui/page-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Metric = ({ label, value }: { label: string; value: string }) => (
  <Card>
    <CardHeader>
      <CardTitle>{label}</CardTitle>
    </CardHeader>
    <CardContent className="text-2xl font-semibold">{value}</CardContent>
  </Card>
);

const Example = () => (
  <PageLayout className="w-full max-w-5xl">
    <PageLayoutSection span="1/2">
      <Metric label="Online store" value="$8,940" />
    </PageLayoutSection>
    <PageLayoutSection span="1/2">
      <Metric label="Retail store" value="$3,540" />
    </PageLayoutSection>
    <PageLayoutSection span="1/3">
      <Metric label="Orders" value="148" />
    </PageLayoutSection>
    <PageLayoutSection span="1/3">
      <Metric label="Customers" value="96" />
    </PageLayoutSection>
    <PageLayoutSection span="1/3">
      <Metric label="Conversion" value="3.2%" />
    </PageLayoutSection>
  </PageLayout>
);

export default Example;
