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
  SettingsIcon,
  ShoppingBagIcon,
  SparklesIcon,
  StoreIcon,
  SunMoonIcon,
  TagIcon,
  UsersIcon,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { I18nextProvider, useTranslation } from "react-i18next";
import type { LayoutProps } from "@/components/thread-ui/layout";
import {
  Layout,
  LayoutContent,
  LayoutSidebar,
  LayoutSidebarHeader,
  LayoutSidebarLogo,
  LayoutSidebarTitle,
} from "@/components/thread-ui/layout";
import {
  SidebarAccountMenu,
  SidebarAccountMenuItem,
  SidebarAccountMenuRadioGroup,
  SidebarAccountMenuRadioItem,
  SidebarAccountMenuSeparator,
  SidebarAccountMenuSub,
  SidebarAccountMenuSubContent,
  SidebarAccountMenuSubTrigger,
} from "@/components/thread-ui/sidebar-account-menu";
import { Button } from "@/components/thread-ui/button";
import { Page } from "@/components/thread-ui/page";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  PageLayout,
  PageLayoutSection,
} from "@/components/thread-ui/page-layout";
import {
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
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
  { id: "orders", label: "Orders", icon: <ShoppingBagIcon /> },
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
  const { isMobile, setOpenMobile } = useSidebar();
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
  const brand = (
    <svg
      aria-hidden="true"
      className="text-primary"
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
  );
  return (
    <>
      <LayoutSidebar collapsible="icon">
        <LayoutSidebarHeader>
          <LayoutSidebarLogo>{brand}</LayoutSidebarLogo>
          <LayoutSidebarTitle>Thread UI</LayoutSidebarTitle>
        </LayoutSidebarHeader>
        <SidebarContent>
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
                          aria-label={item.label}
                          className="h-10 md:h-9"
                          isActive={item.active}
                          tooltip={item.label}
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
                          <span className="truncate group-data-[collapsible=icon]:hidden">
                            {item.label}
                          </span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            ))}
          </nav>
        </SidebarContent>
        <SidebarFooter>
          <SidebarAccountMenu
            recentWorkspaces={workspaces}
            workspace={current}
            workspaceLabel={null}
            user={{
              name: "Alex Morgan",
              email: "alex@example.com",
              onClick: () => {
                setPage("profile");
                if (isMobile) setOpenMobile(false);
              },
            }}
            onWorkspaceChange={(next) => {
              setWorkspace(next);
              setPage(initialPage);
            }}
          >
            <SidebarAccountMenuItem
              render={<a href="#workspaces" />}
              onClick={(event) => {
                if (
                  event.button !== 0 ||
                  event.metaKey ||
                  event.ctrlKey ||
                  event.shiftKey ||
                  event.altKey
                )
                  return;
                event.preventDefault();
                setPage("workspaces");
                if (isMobile) setOpenMobile(false);
              }}
            >
              <LayoutGridIcon aria-hidden="true" />
              {t("sidebarAccountMenu.workspaces")}
            </SidebarAccountMenuItem>
            <SidebarAccountMenuItem
              onClick={() =>
                toast.add({
                  title: "You're all caught up",
                  description: "No new notifications.",
                })
              }
            >
              <BellIcon aria-hidden="true" />
              Notifications
            </SidebarAccountMenuItem>
            <SidebarAccountMenuSeparator />
            <SidebarAccountMenuSub>
              <SidebarAccountMenuSubTrigger>
                <LanguagesIcon aria-hidden="true" />
                {t("sidebarAccountMenu.language")}
              </SidebarAccountMenuSubTrigger>
              <SidebarAccountMenuSubContent>
                <SidebarAccountMenuRadioGroup
                  value={i18n.resolvedLanguage ?? "en"}
                  onValueChange={(next: string) => {
                    void i18n.changeLanguage(next);
                  }}
                >
                  <SidebarAccountMenuRadioItem closeOnClick value="en">
                    English
                  </SidebarAccountMenuRadioItem>
                  <SidebarAccountMenuRadioItem closeOnClick value="zh">
                    中文
                  </SidebarAccountMenuRadioItem>
                </SidebarAccountMenuRadioGroup>
              </SidebarAccountMenuSubContent>
            </SidebarAccountMenuSub>
            <SidebarAccountMenuSub>
              <SidebarAccountMenuSubTrigger>
                <SunMoonIcon aria-hidden="true" />
                {t("sidebarAccountMenu.theme")}
              </SidebarAccountMenuSubTrigger>
              <SidebarAccountMenuSubContent>
                <SidebarAccountMenuRadioGroup
                  value={theme}
                  onValueChange={(next: string) =>
                    document.documentElement.classList.toggle(
                      "dark",
                      next === "dark",
                    )
                  }
                >
                  <SidebarAccountMenuRadioItem closeOnClick value="light">
                    {i18n.language === "zh" ? "浅色" : "Light"}
                  </SidebarAccountMenuRadioItem>
                  <SidebarAccountMenuRadioItem closeOnClick value="dark">
                    {i18n.language === "zh" ? "深色" : "Dark"}
                  </SidebarAccountMenuRadioItem>
                </SidebarAccountMenuRadioGroup>
              </SidebarAccountMenuSubContent>
            </SidebarAccountMenuSub>
            <SidebarAccountMenuItem
              onClick={() =>
                toast.add({
                  title: "Help center",
                  description: "Demo: open your application's help center.",
                })
              }
            >
              <CircleHelpIcon aria-hidden="true" />
              {t("sidebarAccountMenu.help")}
            </SidebarAccountMenuItem>
            <SidebarAccountMenuSeparator />
            <SidebarAccountMenuItem
              onClick={() =>
                toast.add({
                  title: "Sign out requested",
                  description:
                    "Demo only. Connect this callback to your authentication service.",
                })
              }
            >
              <LogOutIcon aria-hidden="true" />
              {t("sidebarAccountMenu.signOut")}
            </SidebarAccountMenuItem>
          </SidebarAccountMenu>
        </SidebarFooter>
      </LayoutSidebar>
      <LayoutContent>
        {page === "workspaces" ? (
          <Page title={t("sidebarAccountMenu.workspaces")} variant="compact">
            <PageLayout>
              <PageLayoutSection>
                <Card>
                  <CardHeader>
                    <CardTitle>{t("sidebarAccountMenu.workspaces")}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col gap-2">
                      {workspaces.map((item) => (
                        <Button
                          key={item.id}
                          variant="ghost"
                          onClick={() => {
                            setWorkspace(item.id);
                            setPage(initialPage);
                          }}
                        >
                          <LayoutGridIcon aria-hidden="true" />
                          {item.name}
                        </Button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </PageLayoutSection>
            </PageLayout>
          </Page>
        ) : page === "profile" ? (
          <Page className="max-w-3xl" variant="full">
            <PageLayout>
              <PageLayoutSection className="flex flex-col">
                <h1 className="text-2xl font-semibold">
                  {i18n.language === "zh" ? "个人中心" : "Profile"}
                </h1>
                <Card>
                  <CardHeader>
                    <div
                      aria-hidden="true"
                      className="bg-muted flex size-14 items-center justify-center rounded-full font-semibold"
                    >
                      A
                    </div>
                    <CardTitle>
                      <h2>Alex Morgan</h2>
                    </CardTitle>
                    <CardDescription>alex@example.com</CardDescription>
                  </CardHeader>
                </Card>
                <Button variant="outline" onClick={() => setPage("home")}>
                  {i18n.language === "zh" ? "返回首页" : "Back to home"}
                </Button>
              </PageLayoutSection>
            </PageLayout>
          </Page>
        ) : children && page === initialPage ? (
          <div key={workspace} className="flex min-w-0 flex-1 flex-col">
            {children}
          </div>
        ) : (
          <Page className="max-w-6xl" variant="full">
            <PageLayout>
              <PageLayoutSection>
                <div className="text-muted-foreground flex flex-wrap items-center justify-between gap-2 text-sm">
                  <span>Last 30 days · All channels</span>
                  <span>Store is live</span>
                </div>
              </PageLayoutSection>
              <PageLayoutSection>
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
              </PageLayoutSection>
              <PageLayoutSection>
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
                    <Button
                      variant="secondary"
                      onClick={() => setPage("store")}
                    >
                      <StoreIcon />
                      View store
                    </Button>
                  </div>
                </section>
              </PageLayoutSection>
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
              <PageLayoutSection>
                <p className="text-muted-foreground pb-4 text-center text-xs">
                  Everything you need to grow, in one place.
                </p>
              </PageLayoutSection>
            </PageLayout>
          </Page>
        )}
      </LayoutContent>
    </>
  );
}

LayoutExample.displayName = "LayoutExample";
