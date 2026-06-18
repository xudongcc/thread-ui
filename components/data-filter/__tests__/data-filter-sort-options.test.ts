import { describe, expect, it } from "vitest";

import {
  getDataFilterSortFieldChoices,
  getDataFilterSortOptionByKey,
} from "../utils/get-data-filter-sort-options";
import type { DataFilterSortOptions } from "../types";

const options: Array<DataFilterSortOptions> = [
  {
    direction: "DESC",
    directionLabel: "Newest first",
    field: "created:at",
    fieldLabel: "Date",
  },
  {
    direction: "ASC",
    directionLabel: "Oldest first",
    field: "created:at",
    fieldLabel: "Date",
  },
  {
    direction: "ASC",
    directionLabel: "A-Z",
    field: "name",
    fieldLabel: "Date",
  },
];

describe("DataFilter sort option helpers", () => {
  it("uses stable keys instead of parsing field and direction strings", () => {
    const choices = getDataFilterSortFieldChoices(options, {
      direction: "DESC",
      field: "created:at",
    });

    expect(choices.map((choice) => choice.key)).toEqual(["0", "2"]);
    expect(choices.map((choice) => choice.option.field)).toEqual([
      "created:at",
      "name",
    ]);
  });

  it("resolves sort options by key without splitting the field value", () => {
    expect(getDataFilterSortOptionByKey(options, "0")).toEqual(options[0]);
    expect(getDataFilterSortOptionByKey(options, "2")).toEqual(options[2]);
    expect(getDataFilterSortOptionByKey(options, "created:at:DESC")).toBeNull();
  });
});
