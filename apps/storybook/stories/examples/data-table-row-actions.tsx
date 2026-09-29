import { fn } from "storybook/test";

export const rowActions = () => [
  { label: "Edit", onClick: fn() },
  { label: "Delete", onClick: fn() },
  { label: "Archive", disabled: true },
];
