import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, expect, it, vi } from "vitest";
import {
  BreadcrumbAction,
  BreadcrumbActions,
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
