import { describe, expect, it } from "vitest";
import {
  createConnectionCursor,
  encodeConnectionCursor,
} from "../graphql-connection";

const decode = (cursor: string) =>
  JSON.parse(
    new TextDecoder().decode(
      Uint8Array.from(atob(cursor), (char) => char.charCodeAt(0)),
    ),
  );

describe("connection cursors", () => {
  it("matches the base64 JSON wire format", () => {
    expect(encodeConnectionCursor({ id: "123" })).toBe("eyJpZCI6IjEyMyJ9");
    expect(encodeConnectionCursor({ id: "123", value: null })).toBe(
      "eyJpZCI6IjEyMyIsInZhbHVlIjpudWxsfQ==",
    );
  });

  it.each([
    { field: "ID", record: { id: "123" }, value: "123" },
    {
      field: "CREATED_AT",
      record: { id: "123", createdAt: "2026-09-24T00:00:00.000Z" },
      value: "2026-09-24T00:00:00.000Z",
    },
    {
      field: "LAST_USED_AT",
      record: { id: "123", lastUsedAt: null },
      value: null,
    },
    { field: "NAME", record: { id: "123", name: "测试 🔑" }, value: "测试 🔑" },
    { field: "COUNT", record: { id: 0, count: 0 }, value: 0 },
  ])(
    "derives $field from the record without losing values",
    ({ field, record, value }) => {
      expect(
        decode(createConnectionCursor(record, { orderBy: { field } })),
      ).toEqual({ id: record.id, value });
    },
  );

  it.each([undefined, null])(
    "supports ID-only cursors without ordering (%s)",
    (orderBy) => {
      expect(decode(createConnectionCursor({ id: 0 }, { orderBy }))).toEqual({
        id: 0,
      });
    },
  );

  it("rejects missing sort fields", () => {
    expect(() =>
      createConnectionCursor(
        { id: "123" },
        { orderBy: { field: "CREATED_AT" } },
      ),
    ).toThrow('missing the "createdAt" sort field');
  });
});
