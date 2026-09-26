import { track } from "@vercel/analytics/server";
import { NextResponse } from "next/server";
import { getPackage, getPackageNames } from "../../../lib/package";
import type { NextRequest } from "next/server";
import type { Registry } from "shadcn/schema";

export const GET = async (_: NextRequest) => {
  if (process.env.NODE_ENV === "production") {
    try {
      await track("Registry download", {
        component: "registry",
      });
    } catch (error) {
      console.error(error);
    }
  }

  const response: Registry = {
    name: "Thread UI",
    homepage: "https://thread-ui.vercel.app/",
    items: [],
  };

  const packageNames = await getPackageNames();

  for (const name of packageNames) {
    try {
      const pkg = await getPackage(name);

      response.items.push(pkg);
    } catch {
      // Skip packages that fail to generate.
    }
  }

  return NextResponse.json(response);
};
