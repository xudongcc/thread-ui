import type { Registry } from "shadcn/schema";
import type { RegistryCatalogItem } from "./package";

function readInteger(
  params: URLSearchParams,
  name: string,
  fallback: number,
  minimum: number,
) {
  const raw = params.get(name);
  if (raw === null || raw.trim() === "") return fallback;
  const value = Number(raw);
  return Number.isSafeInteger(value) && value >= minimum ? value : fallback;
}

/** shadcn's pagination field opts the catalog into server-side search. */
export function searchRegistry(
  catalog: RegistryCatalogItem[],
  params: URLSearchParams,
): Registry {
  const terms = (params.get("q") ?? "")
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean);
  const types = new Set(
    (params.get("type") ?? "")
      .split(",")
      .map((type) => type.trim())
      .filter(Boolean),
  );
  const limit = readInteger(params, "limit", 100, 1);
  const offset = readInteger(params, "offset", 0, 0);
  const matches = catalog
    .filter((item) => {
      if (types.size > 0 && !types.has(item.type)) return false;
      const text = [item.name, item.title, item.description]
        .join(" ")
        .toLowerCase();
      return terms.every((term) => text.includes(term));
    })
    .sort((a, b) => a.name.localeCompare(b.name, "en"));
  const items = matches.slice(offset, offset + limit);
  return {
    name: "Thread UI",
    homepage: "https://thread-ui.vercel.app/",
    items,
    pagination: {
      total: matches.length,
      offset,
      limit,
      hasMore: offset + items.length < matches.length,
    },
  };
}
