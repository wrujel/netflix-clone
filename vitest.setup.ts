import "@testing-library/jest-dom/vitest";
import { cleanup, configure } from "@testing-library/react";
import { afterEach } from "vitest";

// findBy*/waitFor default to 1s, which a loaded CI runner can exceed.
configure({ asyncUtilTimeout: 10_000 });

afterEach(() => {
  cleanup();
});
