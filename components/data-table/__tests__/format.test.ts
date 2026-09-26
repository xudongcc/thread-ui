import { describe, expect, it, vi } from "vitest";
import { createColumnFormatter, getColumnAlign } from "../format";
import type { DataTableColumnProps } from "../types";

const format = (column: DataTableColumnProps<object>, value: unknown) =>
  createColumnFormatter(column, "en-US", "UTC")(value);

describe("column formatting", () => {
  it("uses the runtime locale and time zone when no defaults are supplied", () => {
    const value = new Date("2026-01-01T01:00:00Z");
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    };
    expect(createColumnFormatter({ type: "datetime" })(value)).toBe(
      new Intl.DateTimeFormat(undefined, options).format(value),
    );
    expect(createColumnFormatter({ type: "number" })(1234.5)).toBe(
      new Intl.NumberFormat().format(1234.5),
    );
  });

  it("prefers column defaults over table defaults, including calendar dates", () => {
    const value = "2026-01-01T01:00:00Z";
    expect(
      createColumnFormatter(
        { type: "date" },
        "en-US",
        "America/Los_Angeles",
      )(value),
    ).toBe("12/31/2025");
    expect(
      createColumnFormatter(
        { type: "date", timeZone: "Asia/Shanghai", locale: "en-GB" },
        "en-US",
        "America/Los_Angeles",
      )(value),
    ).toBe("01/01/2026");
    expect(
      createColumnFormatter(
        { type: "date" },
        "en-US",
        "America/Los_Angeles",
      )("2026-01-01"),
    ).toBe("01/01/2026");
  });

  it("keeps existing text columns and empty values unchanged", () => {
    expect(format({}, 0)).toBe("0");
    expect(format({}, false)).toBe("false");
    expect(format({}, undefined)).toBeNull();
    expect(format({ type: "number" }, null)).toBeNull();
    expect(format({ type: "number" }, "")).toBe("");
    expect(format({ type: "number" }, "unknown")).toBe("unknown");
  });

  it("formats numeric types with fixed precision and currency defaults", () => {
    expect(format({ type: "number", precision: 2 }, 1234.5)).toBe("1,234.50");
    expect(format({ type: "number", precision: 0 }, 12.7)).toBe("13");
    expect(format({ type: "number" }, 0)).toBe("0");
    expect(format({ type: "currency", currency: "USD" }, 12.5)).toBe("$12.50");
    expect(format({ type: "currency", currency: "JPY" }, 12)).toBe("¥12");
    expect(
      format({ type: "currency", currency: "USD", precision: 0 }, 12.5),
    ).toBe("$13");
    expect(format({ type: "percent", precision: 1 }, 0.125)).toBe("12.5%");
    expect(format({ type: "percent", precision: 1 }, 0)).toBe("0.0%");
    expect(
      format({ type: "number", locale: "de-DE", precision: 2 }, 1234.5),
    ).toBe("1.234,50");
  });

  it("defaults numeric columns to right alignment and respects overrides", () => {
    for (const column of [
      { type: "number" },
      { type: "percent" },
      { type: "currency", currency: "USD" },
    ] satisfies DataTableColumnProps<object>[]) {
      expect(getColumnAlign(column)).toBe("right");
      expect(getColumnAlign({ ...column, align: "center" })).toBe("center");
    }
    expect(getColumnAlign({})).toBe("left");
    expect(getColumnAlign({ type: "date" })).toBe("left");
  });

  it("applies time zones to instants but preserves calendar dates", () => {
    const instant = "2026-01-01T01:00:00Z";
    expect(format({ type: "date" }, instant)).toBe("01/01/2026");
    expect(
      format({ type: "date", timeZone: "America/Los_Angeles" }, instant),
    ).toBe("12/31/2025");
    expect(
      format({ type: "date", timeZone: "America/Los_Angeles" }, "2026-01-01"),
    ).toBe("01/01/2026");
    expect(
      format(
        { type: "datetime", locale: "en-GB", timeZone: "Asia/Shanghai" },
        instant,
      ),
    ).toBe("01/01/2026, 09:00:00");
    expect(format({ type: "date" }, new Date(instant))).toBe("01/01/2026");
    expect(format({ type: "date" }, Date.parse(instant))).toBe("01/01/2026");
    expect(format({ type: "date" }, 0)).toBe("01/01/1970");
  });

  it("formats time-only output with column overrides and 12/24-hour clocks", () => {
    const instant = "2026-01-01T13:04:05Z";
    expect(format({ type: "time", hour12: false }, instant)).toBe("13:04:05");
    expect(format({ type: "time", hour12: true }, instant)).toBe("01:04:05 PM");
    expect(format({ type: "time", locale: "en-GB" }, instant)).toBe("13:04:05");
    expect(
      createColumnFormatter(
        { type: "time", hour12: false },
        "en-US",
        "Asia/Shanghai",
      )(instant),
    ).toBe("21:04:05");
    expect(
      createColumnFormatter(
        { type: "time", timeZone: "UTC", locale: "en-GB" },
        "en-US",
        "Asia/Shanghai",
      )(new Date(instant)),
    ).toBe("13:04:05");
    expect(format({ type: "time", hour12: false }, Date.parse(instant))).toBe(
      "13:04:05",
    );
    expect(format({ type: "time" }, null)).toBeNull();
    expect(format({ type: "time" }, "invalid")).toBe("invalid");
    expect(format({ type: "time" }, "13:04:05")).toBe("13:04:05");
    expect(getColumnAlign({ type: "time" })).toBe("left");
  });

  it("uses the runtime defaults for time columns", () => {
    const value = new Date("2026-01-01T13:04:05Z");
    expect(createColumnFormatter({ type: "time" })(value)).toBe(
      new Intl.DateTimeFormat(undefined, {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      }).format(value),
    );
  });

  it("normalizes duration units, fractions, signs, and hours beyond 24", () => {
    expect(format({ type: "duration" }, 3661)).toBe("1:01:01");
    expect(format({ type: "duration", unit: "milliseconds" }, 3_661_250)).toBe(
      "1:01:01.25",
    );
    expect(format({ type: "duration", unit: "minutes" }, 1.5)).toBe("0:01:30");
    expect(format({ type: "duration", unit: "hours" }, 1.5)).toBe("1:30:00");
    expect(format({ type: "duration" }, 1.25)).toBe("0:00:01.25");
    expect(format({ type: "duration" }, 59.9996)).toBe("0:01:00");
    expect(format({ type: "duration" }, -3661.25)).toBe("-1:01:01.25");
    expect(format({ type: "duration", unit: "hours" }, 25)).toBe("25:00:00");
    expect(format({ type: "duration" }, 0)).toBe("0:00:00");
    expect(format({ type: "duration" }, null)).toBeNull();
    expect(format({ type: "duration" }, undefined)).toBeNull();
    for (const value of ["", "invalid", NaN, Infinity, Number.MAX_VALUE]) {
      expect(format({ type: "duration" }, value)).toBe(String(value));
    }
    expect(getColumnAlign({ type: "duration" })).toBe("right");
    expect(getColumnAlign({ type: "duration", align: "left" })).toBe("left");
  });

  it("localizes duration styles and applies column locale before table locale", () => {
    expect(format({ type: "duration", style: "long" }, 3661)).toBe(
      "1 hour, 1 minute, 1 second",
    );
    expect(format({ type: "duration", style: "short" }, 3661)).toBe(
      "1 hr, 1 min, 1 sec",
    );
    expect(format({ type: "duration", style: "narrow" }, 3661)).toBe(
      "1h 1m 1s",
    );
    expect(
      createColumnFormatter({ type: "duration", style: "long" }, "zh-CN")(3661),
    ).toBe("1小时1分钟1秒钟");
    expect(
      createColumnFormatter(
        { type: "duration", style: "long", locale: "en-US" },
        "zh-CN",
        "Asia/Shanghai",
      )(3661),
    ).toBe("1 hour, 1 minute, 1 second");
  });

  it("keeps duration values readable when Intl.DurationFormat is unavailable", () => {
    const original = Object.getOwnPropertyDescriptor(Intl, "DurationFormat")!;
    Object.defineProperty(Intl, "DurationFormat", {
      ...original,
      value: undefined,
    });
    try {
      expect(format({ type: "duration" }, 3661)).toBe("3661");
      expect(format({ type: "duration" }, null)).toBeNull();
    } finally {
      Object.defineProperty(Intl, "DurationFormat", original);
    }
  });

  it("reuses Intl instances across cells and builds date-only support lazily", () => {
    const DateTimeFormat = Intl.DateTimeFormat;
    const spy = vi
      .spyOn(Intl, "DateTimeFormat")
      .mockImplementation(function (locales, options) {
        return new DateTimeFormat(locales, options);
      });
    try {
      const formatter = createColumnFormatter(
        { type: "date" },
        "en-US",
        "America/Los_Angeles",
      );
      expect(spy).toHaveBeenCalledTimes(1);
      formatter("2026-01-01T01:00:00Z");
      formatter("2026-01-02T01:00:00Z");
      expect(spy).toHaveBeenCalledTimes(1);
      expect(formatter("2026-01-01")).toBe("01/01/2026");
      expect(formatter("2026-01-02")).toBe("01/02/2026");
      expect(spy).toHaveBeenCalledTimes(2);
    } finally {
      spy.mockRestore();
    }
  });

  it("leaves invalid and timezone-ambiguous dates readable", () => {
    for (const value of [
      "invalid",
      "2026-02-30",
      "2026-02-30T01:00:00Z",
      "2026-01-01T09:00:00",
      "",
    ]) {
      expect(format({ type: "date" }, value)).toBe(value);
    }
    expect(format({ type: "datetime" }, null)).toBeNull();
    expect(format({ type: "date" }, new Date(NaN))).toBe("Invalid Date");
  });
});
