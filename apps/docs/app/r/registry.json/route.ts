import { track } from "@vercel/analytics/server";
import { NextResponse } from "next/server";
import { getPackageCatalog } from "../../../lib/package";
import { searchRegistry } from "../../../lib/registry-search";
import type { NextRequest } from "next/server";

export const GET = async (request: NextRequest) => {
  if (process.env.NODE_ENV === "production") {
    try {
      await track("Registry download", {
        component: "registry",
      });
    } catch (error) {
      console.error(error);
    }
  }

  return NextResponse.json(
    searchRegistry(await getPackageCatalog(), request.nextUrl.searchParams),
  );
};
