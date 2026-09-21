import {
  PageLayout,
  PageLayoutSection,
} from "@/components/thread-ui/page-layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const Example = () => (
  <PageLayout className="w-full max-w-5xl">
    <PageLayoutSection>
      <Card className="bg-muted/40" size="sm">
        <CardHeader>
          <CardTitle>Summer sale is live</CardTitle>
          <CardDescription>
            Review your storefront and inventory before sharing the campaign.
          </CardDescription>
        </CardHeader>
      </Card>
    </PageLayoutSection>

    <PageLayoutSection span="2/3">
      <Card>
        <CardHeader>
          <CardTitle>Orders</CardTitle>
          <CardDescription>Recent activity from your store.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {[
            ["#1048", "Paid", "$86.00"],
            ["#1047", "Fulfilled", "$124.00"],
            ["#1046", "Paid", "$42.00"],
          ].map(([order, status, total]) => (
            <div
              key={order}
              className="grid grid-cols-[1fr_auto_auto] gap-4 border-b py-2 last:border-0"
            >
              <span className="font-medium">{order}</span>
              <span className="text-muted-foreground">{status}</span>
              <span>{total}</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </PageLayoutSection>

    <PageLayoutSection span="1/3">
      <Card>
        <CardHeader>
          <CardTitle>Store summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <p className="text-muted-foreground text-sm">Gross sales</p>
            <p className="text-2xl font-semibold">$12,480</p>
          </div>
          <div>
            <p className="text-muted-foreground text-sm">Returning customers</p>
            <p className="font-medium">31%</p>
          </div>
        </CardContent>
      </Card>
    </PageLayoutSection>
  </PageLayout>
);

export default Example;
