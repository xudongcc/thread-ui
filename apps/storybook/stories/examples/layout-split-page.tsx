import { StoreIcon } from "lucide-react";
import { useState } from "react";
import { LayoutExample } from "./layout";
import type { LayoutProps } from "@/components/thread-ui/layout";
import { Button } from "@/components/thread-ui/button";
import {
  Page,
  PageActions,
  PageContent,
  PageDescription,
  PageHeader,
  PagePrimaryAction,
  PageSecondaryAction,
  PageTitle,
} from "@/components/thread-ui/page";
import { Input } from "@/components/thread-ui/input";
import { FormLayout, FormLayoutItem } from "@/components/thread-ui/form-layout";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/thread-ui/badge";
import { Select } from "@/components/thread-ui/select";
import { Textarea } from "@/components/thread-ui/textarea";
import {
  PageLayout,
  PageLayoutSection,
} from "@/components/thread-ui/page-layout";

const collectionProducts = [
  {
    id: "vase",
    name: "Nordic ceramic vase",
    price: "$48.00",
    image:
      "https://placehold.co/600x450/fef3c7/92400e?text=Nordic+ceramic+vase",
  },
  {
    id: "bag",
    name: "Everyday canvas tote",
    price: "$32.00",
    image:
      "https://placehold.co/600x450/dbeafe/1d4ed8?text=Everyday+canvas+tote",
  },
  {
    id: "tray",
    name: "Oak serving tray",
    price: "$56.00",
    image: "https://placehold.co/600x450/d1fae5/065f46?text=Oak+serving+tray",
  },
];

const initialCollection = {
  title: "Summer essentials",
  description: "Thoughtful pieces for a lighter, brighter everyday.",
  status: "active",
  template: "default",
  products: ["vase", "bag"],
};

function CollectionPage() {
  const [draft, setDraft] = useState(initialCollection);
  const [saved, setSaved] = useState(initialCollection);
  const [message, setMessage] = useState("");
  const dirty = JSON.stringify(draft) !== JSON.stringify(saved);
  const update = (changes: Partial<typeof initialCollection>) => {
    setDraft((current) => ({ ...current, ...changes }));
    setMessage("");
  };
  const nextProduct = collectionProducts.find(
    (product) => !draft.products.includes(product.id),
  );
  return (
    <Page className="max-w-6xl min-w-0" variant="full">
      <PageHeader>
        <PageTitle aria-level={1}>
          {draft.title || "Untitled collection"}
        </PageTitle>
        <PageDescription>
          Collections · {dirty ? "Unsaved changes" : "All changes saved"}
        </PageDescription>
        <PageActions>
          <PagePrimaryAction
            disabled={!dirty || !draft.title.trim()}
            onClick={() => {
              setSaved(draft);
              setMessage("Collection saved");
            }}
          >
            Save
          </PagePrimaryAction>
          <PageSecondaryAction
            disabled={!dirty}
            onAction={() => {
              setDraft(saved);
              setMessage("Changes discarded");
            }}
          >
            Discard changes
          </PageSecondaryAction>
        </PageActions>
      </PageHeader>
      <PageContent>
        <PageLayout>
          <PageLayoutSection span="2/3">
            <Card aria-label="Collection details" role="region">
              <CardHeader>
                <CardTitle>
                  <h2>Collection details</h2>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <FormLayout>
                  <FormLayoutItem>
                    <Input
                      label="Title"
                      value={draft.title}
                      onChange={(event) =>
                        update({ title: event.target.value })
                      }
                    />
                  </FormLayoutItem>
                  <FormLayoutItem>
                    <Textarea
                      label="Description"
                      rows={3}
                      value={draft.description}
                      onChange={(event) =>
                        update({ description: event.target.value })
                      }
                    />
                  </FormLayoutItem>
                </FormLayout>
              </CardContent>
            </Card>
            <Card aria-label="Collection products" role="region">
              <CardHeader>
                <CardTitle>
                  <h2>
                    Products{" "}
                    <span className="text-muted-foreground ml-1 font-normal">
                      {draft.products.length}
                    </span>
                  </h2>
                </CardTitle>
                <CardAction>
                  <Button
                    disabled={!nextProduct}
                    variant="outline"
                    onClick={() => {
                      if (nextProduct)
                        update({
                          products: [...draft.products, nextProduct.id],
                        });
                    }}
                  >
                    Add product
                  </Button>
                </CardAction>
              </CardHeader>
              <CardContent>
                {draft.products.length > 0 ? (
                  <div className="grid grid-cols-2 gap-4">
                    {draft.products.map((id) => {
                      const product = collectionProducts.find(
                        (item) => item.id === id,
                      )!;
                      return (
                        <Card key={id} role="article">
                          <img
                            alt={product.name}
                            className="aspect-4/3 w-full object-cover"
                            height={450}
                            src={product.image}
                            width={600}
                          />
                          <CardHeader>
                            <CardTitle>
                              <h3>{product.name}</h3>
                            </CardTitle>
                            <CardDescription>{product.price}</CardDescription>
                          </CardHeader>
                          <CardFooter>
                            <Button
                              aria-label={`Remove ${product.name}`}
                              size="sm"
                              variant="ghost"
                              onClick={() =>
                                update({
                                  products: draft.products.filter(
                                    (item) => item !== id,
                                  ),
                                })
                              }
                            >
                              Remove
                            </Button>
                          </CardFooter>
                        </Card>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-sm">
                    Add a product to start this collection.
                  </p>
                )}
              </CardContent>
            </Card>
            <Card aria-label="Theme template" role="region">
              <CardHeader>
                <CardTitle>
                  <h2>Theme template</h2>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Select
                  aria-label="Theme template"
                  value={draft.template}
                  items={[
                    { value: "default", label: "Default collection" },
                    { value: "featured", label: "Featured collection" },
                  ]}
                  onValueChange={(value) => {
                    if (value) update({ template: value });
                  }}
                />
              </CardContent>
            </Card>
            <Card aria-label="Search engine listing" role="region">
              <CardHeader>
                <CardTitle>
                  <h2>Search engine listing</h2>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-muted-foreground text-xs break-all">
                    north.example.com / collections / summer-essentials
                  </p>
                  <p className="text-primary text-lg font-medium">
                    {draft.title || "Untitled collection"}
                  </p>
                  <p className="text-muted-foreground text-sm">
                    {draft.description}
                  </p>
                </div>
              </CardContent>
            </Card>
          </PageLayoutSection>
          <PageLayoutSection span="1/3">
            <Card aria-label="Collection status" role="region">
              <CardHeader>
                <CardTitle>
                  <h2>Status</h2>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <FormLayout>
                  <FormLayoutItem>
                    <Select
                      aria-label="Collection status"
                      description="Draft collections are hidden from your storefront."
                      value={draft.status}
                      items={[
                        { value: "active", label: "Active" },
                        { value: "draft", label: "Draft" },
                      ]}
                      onValueChange={(value) => {
                        if (value) update({ status: value });
                      }}
                    />
                  </FormLayoutItem>
                </FormLayout>
              </CardContent>
            </Card>
            <Card aria-label="Publishing" role="region">
              <CardHeader>
                <CardTitle>
                  <h2>Publishing</h2>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
                    <span className="flex items-center gap-2">
                      <StoreIcon aria-hidden="true" className="size-4" />
                      Online store
                    </span>
                    <Badge color={draft.status === "active" ? "green" : "zinc"}>
                      {draft.status === "active" ? "Active" : "Draft"}
                    </Badge>
                  </div>
                  <p className="text-muted-foreground text-sm">
                    {draft.products.length} products in this collection.
                  </p>
                </div>
              </CardContent>
            </Card>
            <p className="text-muted-foreground min-h-5 text-sm" role="status">
              {message}
            </p>
          </PageLayoutSection>
        </PageLayout>
      </PageContent>
    </Page>
  );
}

export function LayoutSplitPageExample(args: LayoutProps) {
  return (
    <LayoutExample {...args} initialPage="products">
      <CollectionPage />
    </LayoutExample>
  );
}

LayoutSplitPageExample.displayName = "LayoutSplitPageExample";
