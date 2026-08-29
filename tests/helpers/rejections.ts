/**
 * `pages/auth.tsx` rethrows after clearing its loading state, and React does
 * not await click handlers — so the rejection surfaces as a process-level
 * unhandled rejection that would otherwise fail the whole test file. Swallow
 * it for the duration of one interaction, then restore Vitest's own reporter.
 */
export async function withSwallowedRejection<T>(
  run: () => Promise<T>
): Promise<T> {
  const existing = process.listeners("unhandledRejection");
  process.removeAllListeners("unhandledRejection");
  const swallow = () => {};
  process.on("unhandledRejection", swallow);

  try {
    return await run();
  } finally {
    // Give the rejection a tick to settle before handing the channel back.
    await new Promise((resolve) => setTimeout(resolve, 0));
    process.off("unhandledRejection", swallow);
    for (const listener of existing) {
      process.on("unhandledRejection", listener as never);
    }
  }
}
