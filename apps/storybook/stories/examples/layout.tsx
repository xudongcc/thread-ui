import {
  BellIcon,
  ChartNoAxesCombinedIcon,
  CircleHelpIcon,
  CreditCardIcon,
  GlobeIcon,
  HouseIcon,
  LanguagesIcon,
  LayoutGridIcon,
  LogOutIcon,
  PackageIcon,
  PlusIcon,
  SettingsIcon,
  ShoppingBagIcon,
  SparklesIcon,
  StoreIcon,
  SunMoonIcon,
  TagIcon,
  UsersIcon,
} from "lucide-react";
import { useEffect, useId, useMemo, useState } from "react";
import { I18nextProvider, useTranslation } from "react-i18next";
import type { LayoutProps } from "@/components/thread-ui/layout";
import type { DataTableColumnProps } from "@/components/thread-ui/data-table";
import type {
  DataFilterConditionValue,
  DataFilterItemProps,
  DataFilterValue,
} from "@/components/thread-ui/data-filter";
import { Layout, LayoutContent } from "@/components/thread-ui/layout";
import {
  Topbar,
  TopbarAction,
  TopbarActionGroup,
  TopbarBrand,
  TopbarMenu,
  TopbarMenuContent,
  TopbarMenuItem,
  TopbarMenuRadioGroup,
  TopbarMenuRadioItem,
  TopbarMenuSeparator,
  TopbarMenuSub,
  TopbarMenuSubContent,
  TopbarMenuSubTrigger,
  TopbarMenuTrigger,
  TopbarMenuUser,
  TopbarMenuWorkspaceGroup,
  TopbarMenuWorkspaceItem,
  TopbarNavigationTrigger,
} from "@/components/thread-ui/topbar";
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
import { DataTable } from "@/components/thread-ui/data-table";
import { DataFilter } from "@/components/thread-ui/data-filter";
import { Input } from "@/components/thread-ui/input";
import {
  Card,
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
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { toast } from "@/components/thread-ui/toast";

const workspaces = [
  {
    id: "north",
    name: "North Studio",
    description: "north.example.com",
  },
  {
    id: "market",
    name: "Night Market",
    description: "market.example.com",
  },
  { id: "east", name: "East Studio", description: "east.example.com" },
];
const pages = [
  { id: "home", label: "Home", icon: <HouseIcon /> },
  { id: "orders", label: "Orders", icon: <ShoppingBagIcon />, badge: "6" },
  { id: "products", label: "Products", icon: <PackageIcon /> },
  { id: "customers", label: "Customers", icon: <UsersIcon /> },
  { id: "marketing", label: "Marketing", icon: <ChartNoAxesCombinedIcon /> },
  { id: "discounts", label: "Discounts", icon: <TagIcon /> },
  { id: "settings", label: "Settings", icon: <SettingsIcon /> },
];

type LayoutExampleProps = LayoutProps & { initialPage?: string };

export function LayoutExample({
  initialPage,
  children,
  ...args
}: LayoutExampleProps) {
  const { i18n } = useTranslation();
  // Keep language changes local to this example, including portaled menus.
  const instance = useMemo(() => i18n.cloneInstance(), [i18n]);
  return (
    <I18nextProvider i18n={instance}>
      <Layout {...args}>
        <ApplicationContent initialPage={initialPage}>
          {children}
        </ApplicationContent>
      </Layout>
    </I18nextProvider>
  );
}

function ApplicationContent({
  initialPage = "home",
  children,
}: LayoutExampleProps) {
  const { isMobile, openMobile, setOpenMobile } = useSidebar();
  const navigationId = useId();
  const { t, i18n } = useTranslation("thread-ui");
  const [theme, setTheme] = useState("light");
  useEffect(() => {
    const root = document.documentElement;
    const original = root.classList.contains("dark");
    const sync = () =>
      setTheme(root.classList.contains("dark") ? "dark" : "light");
    sync();
    const observer = new MutationObserver(sync);
    observer.observe(root, { attributes: true, attributeFilter: ["class"] });
    return () => {
      observer.disconnect();
      root.classList.toggle("dark", original);
    };
  }, []);
  const [workspace, setWorkspace] = useState("north");
  const [page, setPage] = useState(initialPage);
  const current = workspaces.find((item) => item.id === workspace)!;
  const navigation = [
    {
      id: "main",
      items: pages.map((item) => ({
        ...item,
        active: item.id === page,
        onClick: () => setPage(item.id),
      })),
    },
    {
      id: "channels",
      label: "Sales channels",
      items: [
        {
          id: "store",
          label: "Online store",
          icon: <StoreIcon />,
          active: page === "store",
          onClick: () => setPage("store"),
        },
      ],
    },
    {
      id: "apps",
      label: "Apps",
      items: [
        {
          id: "apps",
          label: "Browse apps",
          icon: <LayoutGridIcon />,
          active: page === "apps",
          onClick: () => setPage("apps"),
        },
      ],
    },
  ];
  return (
    <>
      <Topbar>
        <TopbarNavigationTrigger>
          <SidebarTrigger
            aria-controls={isMobile && !openMobile ? undefined : navigationId}
            aria-expanded={openMobile}
            aria-label={t("layout.toggleNavigation", "Toggle navigation")}
            className="text-foreground hover:bg-accent hover:text-accent-foreground focus-visible:ring-ring aria-expanded:bg-accent aria-expanded:text-accent-foreground dark:hover:bg-accent size-10 shrink-0"
          />
        </TopbarNavigationTrigger>
        <TopbarBrand>
          <span className="inline-flex items-center gap-2.5 align-middle">
            <svg
              aria-hidden="true"
              className="text-primary size-8 shrink-0"
              fill="none"
              viewBox="0 0 32 32"
            >
              <rect fill="currentColor" height="32" rx="9" width="32" />
              <path
                className="text-primary-foreground"
                d="M8 10h16M11 15h10M16 10v14"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2.5"
              />
            </svg>
            <span>Thread UI</span>
          </span>
        </TopbarBrand>
        <TopbarActionGroup>
          <TopbarAction
            aria-label="Notifications"
            onClick={() =>
              toast.add({
                title: "You're all caught up",
                description: "No new notifications.",
              })
            }
          >
            <BellIcon />
          </TopbarAction>
        </TopbarActionGroup>
        <TopbarMenu
          currentWorkspace={current}
          user={{ name: "Alex Morgan", email: "alex@example.com" }}
        >
          <TopbarMenuTrigger />
          <TopbarMenuContent>
            <TopbarMenuWorkspaceGroup
              value={workspace}
              onValueChange={(next: string) => {
                setWorkspace(next);
                setPage(initialPage);
              }}
            >
              {[current, ...workspaces.filter((item) => item.id !== current.id)]
                .slice(0, 3)
                .map((item) => (
                  <TopbarMenuWorkspaceItem key={item.id} workspace={item} />
                ))}
            </TopbarMenuWorkspaceGroup>

            <TopbarMenuSeparator />
            <TopbarMenuItem
              className="min-h-10"
              onClick={() =>
                toast.add({
                  title: "Create a workspace",
                  description: "Start a new space for your team.",
                })
              }
            >
              <PlusIcon aria-hidden="true" />
              {t("topbarMenu.create")}
            </TopbarMenuItem>
            <TopbarMenuSeparator />
            <TopbarMenuUser onClick={() => setPage("profile")} />
            <TopbarMenuSeparator />
            <TopbarMenuSub>
              <TopbarMenuSubTrigger className="min-h-10">
                <LanguagesIcon aria-hidden="true" />
                {t("topbarMenu.language")}
              </TopbarMenuSubTrigger>
              <TopbarMenuSubContent>
                <TopbarMenuRadioGroup
                  value={i18n.resolvedLanguage ?? "en"}
                  onValueChange={(next: string) => {
                    void i18n.changeLanguage(next);
                  }}
                >
                  <TopbarMenuRadioItem
                    closeOnClick
                    className="min-h-10"
                    value="en"
                  >
                    English
                  </TopbarMenuRadioItem>
                  <TopbarMenuRadioItem
                    closeOnClick
                    className="min-h-10"
                    value="zh"
                  >
                    中文
                  </TopbarMenuRadioItem>
                </TopbarMenuRadioGroup>
              </TopbarMenuSubContent>
            </TopbarMenuSub>
            <TopbarMenuSub>
              <TopbarMenuSubTrigger className="min-h-10">
                <SunMoonIcon aria-hidden="true" />
                {t("topbarMenu.theme")}
              </TopbarMenuSubTrigger>
              <TopbarMenuSubContent>
                <TopbarMenuRadioGroup
                  value={theme}
                  onValueChange={(next: string) =>
                    document.documentElement.classList.toggle(
                      "dark",
                      next === "dark",
                    )
                  }
                >
                  <TopbarMenuRadioItem
                    closeOnClick
                    className="min-h-10"
                    value="light"
                  >
                    {i18n.language === "zh" ? "浅色" : "Light"}
                  </TopbarMenuRadioItem>
                  <TopbarMenuRadioItem
                    closeOnClick
                    className="min-h-10"
                    value="dark"
                  >
                    {i18n.language === "zh" ? "深色" : "Dark"}
                  </TopbarMenuRadioItem>
                </TopbarMenuRadioGroup>
              </TopbarMenuSubContent>
            </TopbarMenuSub>
            <TopbarMenuItem
              className="min-h-10"
              onClick={() =>
                toast.add({
                  title: "Help center",
                  description: "Demo: open your application's help center.",
                })
              }
            >
              <CircleHelpIcon aria-hidden="true" />
              {t("topbarMenu.help")}
            </TopbarMenuItem>
            <TopbarMenuSeparator />
            <TopbarMenuItem
              className="min-h-10"
              onClick={() =>
                toast.add({
                  title: "Sign out requested",
                  description:
                    "Demo only. Connect this callback to your authentication service.",
                })
              }
            >
              <LogOutIcon aria-hidden="true" />
              {t("topbarMenu.signOut")}
            </TopbarMenuItem>
          </TopbarMenuContent>
        </TopbarMenu>
      </Topbar>
      <Sidebar>
        <SidebarContent className="py-2" id={navigationId}>
          <nav aria-label={t("layout.navigation", "Navigation")}>
            {navigation.map((group) => (
              <SidebarGroup key={group.id}>
                {group.label && (
                  <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
                )}
                <SidebarGroupContent>
                  <SidebarMenu>
                    {group.items.map((item) => (
                      <SidebarMenuItem key={item.id}>
                        <SidebarMenuButton
                          aria-current={item.active ? "page" : undefined}
                          className={`h-10 md:h-9 ${"badge" in item ? "pr-12" : ""}`}
                          isActive={item.active}
                          onClick={() => {
                            item.onClick();
                            if (isMobile) setOpenMobile(false);
                          }}
                        >
                          <span
                            aria-hidden="true"
                            className="shrink-0 [&_svg]:size-4"
                          >
                            {item.icon}
                          </span>
                          <span className="truncate">{item.label}</span>
                        </SidebarMenuButton>
                        {"badge" in item && (
                          <SidebarMenuBadge>{item.badge}</SidebarMenuBadge>
                        )}
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            ))}
          </nav>
        </SidebarContent>
      </Sidebar>
      <LayoutContent>
        {page === "profile" ? (
          <Page
            className="max-w-3xl space-y-4 py-6 md:px-8 md:py-8"
            variant="full"
          >
            <h1 className="text-2xl font-semibold">
              {i18n.language === "zh" ? "个人中心" : "Profile"}
            </h1>
            <Card>
              <CardContent className="space-y-4">
                <div
                  aria-hidden="true"
                  className="bg-muted flex size-14 items-center justify-center rounded-full font-semibold"
                >
                  A
                </div>
                <h2 className="text-lg font-semibold">Alex Morgan</h2>
                <p className="text-muted-foreground">alex@example.com</p>
              </CardContent>
            </Card>
            <Button variant="outline" onClick={() => setPage("home")}>
              {i18n.language === "zh" ? "返回首页" : "Back to home"}
            </Button>
          </Page>
        ) : children && page === initialPage ? (
          <div key={workspace} className="flex min-w-0 flex-1 flex-col">
            {children}
          </div>
        ) : (
          <Page
            className="max-w-6xl space-y-8 py-6 md:px-8 md:py-8"
            variant="full"
          >
            <div className="text-muted-foreground flex flex-wrap items-center justify-between gap-2 text-sm">
              <span>Last 30 days · All channels</span>
              <span>Store is live</span>
            </div>
            <dl className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {[
                ["Visits", "1,284"],
                ["Total sales", "$4,860"],
                ["Orders", "36"],
                ["Conversion", "2.8%"],
              ].map(([label, value]) => (
                <div key={label} className="space-y-1">
                  <dt className="text-muted-foreground text-sm">{label}</dt>
                  <dd className="text-xl font-semibold tracking-tight">
                    {value}
                  </dd>
                </div>
              ))}
            </dl>
            <section className="mx-auto w-full max-w-2xl space-y-5 py-6 text-center md:py-14">
              <p className="text-muted-foreground text-sm font-medium">
                {current.name}
              </p>
              <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                {page === "home"
                  ? "Let's build something great."
                  : (pages.find((item) => item.id === page)?.label ??
                    (page === "store"
                      ? "Online store"
                      : page === "settings"
                        ? "Settings"
                        : "Apps"))}
              </h1>
              <p className="text-muted-foreground">
                Your next chapter starts with a few small steps.
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                <Button variant="outline" onClick={() => setPage("orders")}>
                  <ShoppingBagIcon />
                  Review orders
                  <span className="bg-muted text-foreground rounded-full px-2 text-xs">
                    6
                  </span>
                </Button>
                <Button variant="secondary" onClick={() => setPage("store")}>
                  <StoreIcon />
                  View store
                </Button>
              </div>
            </section>
            <PageLayout>
              {[
                {
                  title: "Make it yours",
                  description:
                    "Create a storefront that feels like your brand.",
                  icon: <SparklesIcon className="size-12" />,
                  action: "Customize store",
                  destination: "store",
                  color:
                    "bg-violet-50 text-violet-700 dark:bg-violet-950 dark:text-violet-300",
                },
                {
                  title: "Get ready to sell",
                  description:
                    "Offer your customers a smooth, secure checkout.",
                  icon: <CreditCardIcon className="size-12" />,
                  action: "Set up payments",
                  destination: "settings",
                  color:
                    "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
                },
                {
                  title: "Find your home online",
                  description: "Connect a domain customers will remember.",
                  icon: <GlobeIcon className="size-12" />,
                  action: "Connect domain",
                  destination: "settings",
                  color:
                    "bg-amber-50 text-amber-800 dark:bg-amber-950 dark:text-amber-200",
                },
              ].map((card) => (
                <PageLayoutSection key={card.title} span="1/3">
                  <Card role="article">
                    <CardHeader>
                      <CardTitle>
                        <h2>{card.title}</h2>
                      </CardTitle>
                      <CardDescription className="min-h-10">
                        {card.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div
                        aria-hidden="true"
                        className={`flex h-32 items-center justify-center rounded-xl ${card.color}`}
                      >
                        {card.icon}
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button
                        variant="outline"
                        onClick={() => setPage(card.destination)}
                      >
                        {card.action}
                      </Button>
                    </CardFooter>
                  </Card>
                </PageLayoutSection>
              ))}
            </PageLayout>
            <p className="text-muted-foreground pb-4 text-center text-xs">
              Everything you need to grow, in one place.
            </p>
          </Page>
        )}
      </LayoutContent>
    </>
  );
}

LayoutExample.displayName = "LayoutExample";

type Order = {
  id: string;
  customer: string;
  email: string;
  status: "Unfulfilled" | "Fulfilled";
  total: number;
};

const initialOrders: Order[] = Array.from({ length: 24 }, (_, index) => ({
  id: String(1001 + index),
  customer: ["Alice Johnson", "Bob Smith", "Charlie Brown", "Diana Prince"][
    index % 4
  ],
  email: [
    "alice@example.com",
    "bob@example.com",
    "charlie@example.com",
    "diana@example.com",
  ][index % 4],
  status: index % 3 === 0 ? "Unfulfilled" : "Fulfilled",
  total: 48 + index * 12.5,
}));

const orderColumns: DataTableColumnProps<Order>[] = [
  {
    id: "id",
    header: "Order",
    accessorKey: "id",
    size: 100,
    cell: ({ row }) => <span className="font-medium">#{row.original.id}</span>,
  },
  {
    id: "customer",
    header: "Customer",
    accessorKey: "customer",
    size: 220,
    cell: ({ row }) => (
      <div className="space-y-1">
        <div className="font-medium">{row.original.customer}</div>
        <div className="text-muted-foreground text-xs">
          {row.original.email}
        </div>
      </div>
    ),
  },
  {
    id: "status",
    header: "Fulfillment",
    accessorKey: "status",
    size: 150,
    cell: ({ row }) => (
      <Badge color={row.original.status === "Fulfilled" ? "green" : "amber"}>
        {row.original.status}
      </Badge>
    ),
  },
  {
    id: "total",
    header: "Total",
    accessorKey: "total",
    size: 110,
    cell: ({ row }) => (
      <span className="tabular-nums">${row.original.total.toFixed(2)}</span>
    ),
  },
];

const orderFilters: DataFilterItemProps[] = [
  {
    field: "status",
    label: "Fulfillment",
    type: "select",
    operators: ["$in"],
    options: [
      { label: "Unfulfilled", value: "Unfulfilled" },
      { label: "Fulfilled", value: "Fulfilled" },
    ],
  },
  {
    field: "total",
    label: "Amount",
    type: "number-input",
    min: 0,
    decimalScale: 2,
    operators: ["$gte", "$lte", "$eq"],
  },
];
const emptyOrderFilter: DataFilterValue = { query: "", filter: {} };

function OrdersPage() {
  const [orders, setOrders] = useState(initialOrders);
  const [filterRevision, setFilterRevision] = useState(0);
  const [filterValue, setFilterValue] =
    useState<DataFilterValue>(emptyOrderFilter);
  const [pageIndex, setPageIndex] = useState(0);
  const [selected, setSelected] = useState<Order[]>([]);
  const [revision, setRevision] = useState(0);
  const pageSize = 8;
  const filtered = orders.filter((order) => {
    const status = filterValue.filter.status as
      | DataFilterConditionValue
      | undefined;
    const total = filterValue.filter.total as
      | DataFilterConditionValue
      | undefined;
    const statuses = status?.$in;
    return (
      `${order.id} ${order.customer} ${order.email}`
        .toLowerCase()
        .includes(filterValue.query.trim().toLowerCase()) &&
      (!Array.isArray(statuses) ||
        statuses.length === 0 ||
        statuses.includes(order.status)) &&
      (typeof total?.$gte !== "number" || order.total >= total.$gte) &&
      (typeof total?.$lte !== "number" || order.total <= total.$lte) &&
      (typeof total?.$eq !== "number" || order.total === total.$eq)
    );
  });
  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(pageIndex, pageCount - 1);
  const visibleOrders = filtered.slice(
    currentPage * pageSize,
    (currentPage + 1) * pageSize,
  );
  const resetSelection = () => {
    setSelected([]);
    setRevision((value) => value + 1);
  };
  const changePage = (next: number) => {
    setPageIndex(next);
    resetSelection();
  };

  return (
    <Page className="max-w-6xl min-w-0 py-6 md:px-8 md:py-8" variant="full">
      <PageHeader>
        <PageTitle aria-level={1}>Orders</PageTitle>
        <PageDescription>
          Manage orders, review customers, and track fulfillment.
        </PageDescription>
        <PageActions>
          <PagePrimaryAction
            onClick={() => {
              const id = String(
                Math.max(...orders.map((order) => Number(order.id))) + 1,
              );
              setOrders([
                {
                  id,
                  customer: "New customer",
                  email: "customer@example.com",
                  status: "Unfulfilled",
                  total: 0,
                },
                ...orders,
              ]);
              setFilterValue(emptyOrderFilter);
              setFilterRevision((value) => value + 1);
              changePage(0);
            }}
          >
            Create order
          </PagePrimaryAction>
          <PageSecondaryAction
            onAction={() => {
              setFilterValue(emptyOrderFilter);
              setFilterRevision((value) => value + 1);
              changePage(0);
            }}
          >
            Reset filters
          </PageSecondaryAction>
        </PageActions>
      </PageHeader>
      <PageContent className="min-w-0 space-y-4">
        <Card>
          <CardContent className="flex flex-col gap-2">
            <DataFilter
              key={`filters-${filterRevision}`}
              filters={orderFilters}
              value={filterValue}
              search={{
                "aria-label": "Search orders",
                placeholder: "Order number, customer, or email",
              }}
              onChange={(value) => {
                setFilterValue(value);
                changePage(0);
              }}
            />
            <DataTable
              // DataTable owns selection; remount when filters/pages change to clear it.
              key={`table-${revision}`}
              columns={orderColumns}
              data={visibleOrders}
              getRowId={(order) => order.id}
              bulkActions={
                <Button
                  size="xs"
                  variant="outline"
                  onClick={() => {
                    const ids = new Set(selected.map((order) => order.id));
                    setOrders((current) =>
                      current.map((order) =>
                        ids.has(order.id)
                          ? { ...order, status: "Fulfilled" }
                          : order,
                      ),
                    );
                    resetSelection();
                  }}
                >
                  Mark fulfilled
                </Button>
              }
              pagination={{
                hasPreviousPage: currentPage > 0,
                hasNextPage: currentPage < pageCount - 1,
                onPreviousPage: () => changePage(currentPage - 1),
                onNextPage: () => changePage(currentPage + 1),
              }}
              onRowSelectionChange={setSelected}
            />
          </CardContent>
        </Card>
      </PageContent>
    </Page>
  );
}

export function LayoutOrdersExample(args: LayoutProps) {
  return (
    <LayoutExample {...args} initialPage="orders">
      <OrdersPage />
    </LayoutExample>
  );
}
LayoutOrdersExample.displayName = "LayoutOrdersExample";

const collectionProducts = [
  {
    id: "vase",
    name: "Nordic ceramic vase",
    price: "$48.00",
    color: "bg-amber-50 text-amber-800 dark:bg-amber-950 dark:text-amber-200",
  },
  {
    id: "bag",
    name: "Everyday canvas tote",
    price: "$32.00",
    color: "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-200",
  },
  {
    id: "tray",
    name: "Oak serving tray",
    price: "$56.00",
    color:
      "bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200",
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
    <Page className="max-w-6xl min-w-0 py-6 md:px-8 md:py-8" variant="full">
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
              <CardContent className="space-y-4">
                <h2 className="font-semibold">Collection details</h2>
                <Input
                  label="Title"
                  value={draft.title}
                  onChange={(event) => update({ title: event.target.value })}
                />
                <Textarea
                  label="Description"
                  rows={3}
                  value={draft.description}
                  onChange={(event) =>
                    update({ description: event.target.value })
                  }
                />
              </CardContent>
            </Card>
            <Card aria-label="Collection products" role="region">
              <CardContent className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h2 className="font-semibold">
                    Products{" "}
                    <span className="text-muted-foreground ml-1 font-normal">
                      {draft.products.length}
                    </span>
                  </h2>
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
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {draft.products.map((id) => {
                    const product = collectionProducts.find(
                      (item) => item.id === id,
                    )!;
                    return (
                      <Card key={id} className="pt-0" role="article">
                        <div
                          aria-hidden="true"
                          className={`flex aspect-4/3 items-center justify-center ${product.color}`}
                        >
                          {id === "bag" ? (
                            <ShoppingBagIcon className="size-12" />
                          ) : (
                            <PackageIcon className="size-12" />
                          )}
                        </div>
                        <CardContent className="space-y-2">
                          <h3 className="text-sm font-medium">
                            {product.name}
                          </h3>
                          <p className="text-muted-foreground text-sm">
                            {product.price}
                          </p>
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
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
                {draft.products.length === 0 && (
                  <p className="text-muted-foreground text-sm">
                    Add a product to start this collection.
                  </p>
                )}
              </CardContent>
            </Card>
            <Card aria-label="Theme template" role="region">
              <CardContent className="space-y-4">
                <h2 className="font-semibold">Theme template</h2>
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
              <CardContent className="space-y-2">
                <h2 className="font-semibold">Search engine listing</h2>
                <p className="text-muted-foreground text-xs break-all">
                  north.example.com / collections / summer-essentials
                </p>
                <p className="text-primary text-lg font-medium">
                  {draft.title || "Untitled collection"}
                </p>
                <p className="text-muted-foreground text-sm">
                  {draft.description}
                </p>
              </CardContent>
            </Card>
          </PageLayoutSection>
          <PageLayoutSection span="1/3">
            <Card aria-label="Collection status" role="region">
              <CardContent className="space-y-4">
                <h2 className="font-semibold">Status</h2>
                <Select
                  aria-label="Collection status"
                  value={draft.status}
                  items={[
                    { value: "active", label: "Active" },
                    { value: "draft", label: "Draft" },
                  ]}
                  onValueChange={(value) => {
                    if (value) update({ status: value });
                  }}
                />
                <p className="text-muted-foreground text-sm">
                  Draft collections are hidden from your storefront.
                </p>
              </CardContent>
            </Card>
            <Card aria-label="Publishing" role="region">
              <CardContent className="space-y-4">
                <h2 className="font-semibold">Publishing</h2>
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

export function LayoutWithoutSidebarExample(args: LayoutProps) {
  return (
    <Layout {...args}>
      <Topbar>
        <TopbarBrand>Thread UI</TopbarBrand>
        <TopbarMenu user={{ name: "Alex Morgan", email: "alex@example.com" }}>
          <TopbarMenuTrigger />
          <TopbarMenuContent>
            <TopbarMenuUser />
          </TopbarMenuContent>
        </TopbarMenu>
      </Topbar>
      <LayoutContent id="account-content">
        <Page className="space-y-4 py-6" variant="full">
          <PageHeader>
            <PageTitle>Profile</PageTitle>
            <PageDescription>Manage your account details.</PageDescription>
          </PageHeader>
          <PageContent>
            <Card>
              <CardContent className="space-y-4">
                <Input defaultValue="Alex Morgan" label="Name" />
                <Input defaultValue="alex@example.com" label="Email" />
              </CardContent>
            </Card>
          </PageContent>
        </Page>
      </LayoutContent>
    </Layout>
  );
}
LayoutWithoutSidebarExample.displayName = "LayoutWithoutSidebarExample";
