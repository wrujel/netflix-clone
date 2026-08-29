import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

const stub = (name: string) =>
  fileURLToPath(new URL(`./tests/stubs/${name}`, import.meta.url));

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: [
      // next/image needs the Next runtime (image config, loaders) to render.
      // The stub keeps the props observable while rendering a plain <img>.
      { find: /^next\/image$/, replacement: stub("next-image.tsx") },
      // react-player pulls in custom media elements that jsdom cannot mount.
      { find: /^react-player$/, replacement: stub("react-player.tsx") },
    ],
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    include: ["tests/**/*.test.{ts,tsx}"],
    restoreMocks: true,
    // Coverage instrumentation plus a loaded CI runner can push a render or a
    // findBy* query well past the defaults; headroom here beats a false red.
    testTimeout: 20_000,
    hookTimeout: 20_000,
    unstubEnvs: true,
    unstubGlobals: true,
    coverage: {
      provider: "v8",
      // json-summary is what the CI workflow parses for the studio sentinel.
      reporter: ["text", "json-summary", "json", "lcov"],
      reportsDirectory: "./coverage",
      include: [
        "components/**/*.{ts,tsx}",
        "hooks/**/*.{ts,tsx}",
        "libs/**/*.{ts,tsx}",
        "pages/**/*.{ts,tsx}",
      ],
      thresholds: {
        lines: 100,
        functions: 100,
        branches: 100,
        statements: 100,
      },
    },
  },
});
