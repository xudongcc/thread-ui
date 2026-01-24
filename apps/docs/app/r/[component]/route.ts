import { readdir } from "node:fs/promises";
import { join } from "node:path";

import { track } from "@vercel/analytics/server";
import { NextResponse } from "next/server";
import { getPackage } from "../../../lib/package";
import type { NextRequest } from "next/server";

interface RegistryParams {
  params: Promise<{ component: string }>;
}

export const GET = async (_: NextRequest, { params }: RegistryParams) => {
  const { component } = await params;

  if (!component.endsWith(".json")) {
    return NextResponse.json(
      { error: "Component must end with .json" },
      { status: 400 },
    );
  }

  const componentName = component.replace(".json", "");

  if (process.env.NODE_ENV === "production") {
    try {
      await track("Registry download", {
        component: componentName,
      });
    } catch (error) {
      console.error(error);
    }
  }

  try {
    const pkg = await getPackage(componentName);

    return NextResponse.json(pkg);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to get component", details: error },
      { status: 500 },
    );
  }
};

export const generateStaticParams = async () => {
  const componentsDir = join(process.cwd(), "..", "..", "components");
  const componentDirectories = await readdir(componentsDir, {
    withFileTypes: true,
  });

  return componentDirectories
    .map((dirent) => dirent.name)
    .map((name) => ({ component: name }));
};
