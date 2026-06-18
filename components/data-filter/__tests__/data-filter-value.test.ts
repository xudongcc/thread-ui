import { describe, expect, it } from "vitest";

import {
  hydrateDataFilterValueFilter,
  normalizeDataFilterValue,
  serializeDataFilterValueFilter,
} from "../utils/data-filter-value";

describe("DataFilterValue utilities", () => {
  it("normalizes missing values to an empty query and Mongo filter", () => {
    expect(normalizeDataFilterValue()).toEqual({
      filter: {},
      query: "",
    });
  });

  it("hydrates legacy range bounds into a between draft condition", () => {
    expect(
      hydrateDataFilterValueFilter({
        age: { $gte: 18, $lte: 30 },
      }),
    ).toEqual({
      age: { $between: [18, 30] },
    });
  });

  it("serializes complete draft conditions into Mongo filter syntax", () => {
    expect(
      serializeDataFilterValueFilter({
        age: { $between: [18, 30] },
        archived: { $eq: null },
        name: { $fulltext: "Acme" },
      }),
    ).toEqual({
      age: { $between: [18, 30] },
      archived: { $eq: null },
      name: { $fulltext: "Acme" },
    });
  });

  it("keeps incomplete between drafts out of the emitted filter", () => {
    expect(
      serializeDataFilterValueFilter({
        age: { $between: [18, undefined] },
        amount: { $between: [undefined, 100] },
      }),
    ).toEqual({});
  });
});
