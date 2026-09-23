import type { ReactRenderer } from "@storybook/react-vite";
import type { Args, PlayFunction } from "storybook/internal/types";

declare const __STORYBOOK_TEST__: boolean;

/** Keep browsing at the initial state; Vitest (CLI or Run tests) runs the play. */
export function testOnly<TArgs extends Args = Args>(
  play: PlayFunction<ReactRenderer, TArgs>,
): PlayFunction<ReactRenderer, TArgs> | undefined {
  return __STORYBOOK_TEST__ ? play : undefined;
}
