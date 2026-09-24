import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, expect, it, vi } from "vitest";
import {
  BreadcrumbAction,
  BreadcrumbActions,
  Page,
  PageActions,
  PagePrimaryAction,
  PageSecondaryAction,
} from "../index";

afterEach(cleanup);

it("forwards primary and breadcrumb action properties", async () => {
  const click = vi.fn();
  render(
    <>
      <PagePrimaryAction disabled form="profile" type="submit" onClick={click}>
        Save
      </PagePrimaryAction>
      <BreadcrumbActions>
        <BreadcrumbAction render={<a href="/users" />}>Users</BreadcrumbAction>
      </BreadcrumbActions>
    </>,
  );
  const save = screen.getByRole("button", { name: /Save$/ });
  expect(save.getAttribute("type")).toBe("submit");
  expect(save.getAttribute("form")).toBe("profile");
  await userEvent.click(save);
  expect(click).not.toHaveBeenCalled();
  expect(screen.getByRole("link", { name: "Users" }).getAttribute("href")).toBe(
    "/users",
  );
});

it("preserves secondary action attributes in inline buttons and overflow menus", async () => {
  const click = vi.fn();
  render(
    <PageActions>
      <PageSecondaryAction
        aria-label="Edit profile"
        data-tracking-id="edit"
        title="Edit profile"
        onAction={click}
      >
        Edit
      </PageSecondaryAction>
    </PageActions>,
  );
  const inline = screen.getByRole("button", { name: "Edit profile" });
  expect(inline.getAttribute("data-tracking-id")).toBe("edit");
  await userEvent.click(inline);
  expect(click).toHaveBeenCalledTimes(1);
  await userEvent.click(screen.getByRole("button", { name: /More actions$/ }));
  const item = await screen.findByRole("menuitem", { name: "Edit profile" });
  expect(item.getAttribute("data-tracking-id")).toBe("edit");
  expect(item.getAttribute("title")).toBe("Edit profile");
  await userEvent.click(item);
  expect(click).toHaveBeenCalledTimes(2);
});

it("composes ReactNode headers and forwards action configuration without DOM prop leakage", async () => {
  const save = vi.fn();
  const next = vi.fn();
  const { container } = render(
    <Page
      data-testid="page"
      breadcrumbActions={[
        { label: "Projects", render: <a href="#projects" /> },
      ]}
      description={
        <>
          Manage <a href="#team">your team</a>.
        </>
      }
      paginationActions={{
        previous: { disabled: true },
        next: { onAction: next },
      }}
      primaryAction={{
        label: "Save",
        type: "submit",
        form: "project",
        onAction: save,
      }}
      title={
        <span>
          Project <strong>settings</strong>
        </span>
      }
    >
      <article>Project content</article>
    </Page>,
  );
  expect(screen.getByRole("heading").textContent).toBe("Project settings");
  expect(
    screen.getByRole("link", { name: "your team" }).closest("p"),
  ).not.toBeNull();
  expect(
    screen.getByRole("link", { name: "Projects" }).getAttribute("href"),
  ).toBe("#projects");
  expect(screen.getByTestId("page").hasAttribute("title")).toBe(false);
  expect(
    container.querySelector("article")?.parentElement?.className,
  ).toContain("flex-1");
  const primary = screen.getByRole("button", { name: /Save$/ });
  expect(primary.getAttribute("form")).toBe("project");
  expect(primary.getAttribute("type")).toBe("submit");
  await userEvent.click(primary);
  await userEvent.click(screen.getByRole("button", { name: "Next item" }));
  expect(save).toHaveBeenCalledOnce();
  expect(next).toHaveBeenCalledOnce();
  expect(
    screen
      .getByRole("button", { name: "Previous item" })
      .hasAttribute("disabled"),
  ).toBe(true);
});

it("omits empty configured headers and leaves composition children untouched", () => {
  const { container, rerender } = render(
    <Page breadcrumbActions={[]} paginationActions={{}} secondaryActions={[]}>
      <article>Content</article>
    </Page>,
  );
  expect(container.querySelector("header")).toBeNull();
  expect(container.querySelector('[data-slot="page-actions"]')).toBeNull();
  rerender(
    <Page>
      <article>Composed content</article>
    </Page>,
  );
  expect(
    container
      .querySelector("article")
      ?.parentElement?.getAttribute("data-slot"),
  ).toBe("page");
});
