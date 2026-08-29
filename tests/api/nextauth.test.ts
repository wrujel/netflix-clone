// @vitest-environment node
import type { AuthOptions } from "next-auth";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { NextAuth, PrismaAdapter, compare, findUnique } = vi.hoisted(() => ({
  NextAuth: vi.fn(() => "next-auth-handler"),
  PrismaAdapter: vi.fn(() => ({ name: "prisma-adapter" })),
  compare: vi.fn(),
  findUnique: vi.fn(),
}));

vi.mock("next-auth/next", () => ({ default: NextAuth }));
vi.mock("@next-auth/prisma-adapter", () => ({ PrismaAdapter }));
vi.mock("bcrypt", () => ({ compare }));
vi.mock("../../libs/prismadb", () => ({
  default: { user: { findUnique } },
}));

const OAUTH_ENV = [
  "GITHUB_CLIENT_ID",
  "GITHUB_CLIENT_SECRET",
  "GOOGLE_CLIENT_ID",
  "GOOGLE_CLIENT_SECRET",
] as const;

const loadAuthOptions = async (): Promise<AuthOptions> => {
  vi.resetModules();
  const mod = await import("../../pages/api/auth/[...nextauth]");
  return mod.authOptions;
};

type Authorize = (
  credentials: Record<string, string> | undefined,
  req: unknown
) => Promise<unknown>;

/**
 * next-auth v4 does not spread the user config onto the provider object - it
 * hangs it off `.options` and leaves a `() => null` stub at `.authorize`. The
 * real callback therefore lives one level down.
 */
const authorizeOf = async (): Promise<Authorize> => {
  const options = await loadAuthOptions();
  const credentials = options.providers.find(
    (provider) => provider.id === "credentials"
  ) as unknown as { options: { authorize: Authorize } };
  return credentials.options.authorize;
};

describe("NextAuth configuration", () => {
  beforeEach(() => {
    NextAuth.mockClear();
    PrismaAdapter.mockClear();
    compare.mockReset();
    findUnique.mockReset();
    for (const key of OAUTH_ENV) vi.stubEnv(key, undefined);
  });

  it("wires up the three providers, the Prisma adapter and JWT sessions", async () => {
    const options = await loadAuthOptions();

    expect(options.providers.map((p) => p.id)).toEqual([
      "github",
      "google",
      "credentials",
    ]);
    expect(PrismaAdapter).toHaveBeenCalledWith({ user: { findUnique } });
    expect(options.adapter).toEqual({ name: "prisma-adapter" });
    expect(options.session).toEqual({ strategy: "jwt" });
    expect(options.pages).toEqual({ signIn: "/auth" });
  });

  it("mounts the NextAuth handler as the route's default export", async () => {
    vi.resetModules();
    const mod = await import("../../pages/api/auth/[...nextauth]");

    expect(NextAuth).toHaveBeenCalledWith(mod.authOptions);
    expect(mod.default).toBe("next-auth-handler");
  });

  it("passes the OAuth credentials through when they are configured", async () => {
    vi.stubEnv("GITHUB_CLIENT_ID", "gh-id");
    vi.stubEnv("GITHUB_CLIENT_SECRET", "gh-secret");
    vi.stubEnv("GOOGLE_CLIENT_ID", "goog-id");
    vi.stubEnv("GOOGLE_CLIENT_SECRET", "goog-secret");

    const options = await loadAuthOptions();
    const [github, google] = options.providers;

    expect(github.options).toMatchObject({
      clientId: "gh-id",
      clientSecret: "gh-secret",
    });
    expect(google.options).toMatchObject({
      clientId: "goog-id",
      clientSecret: "goog-secret",
      allowDangerousEmailAccountLinking: true,
    });
  });

  it("falls back to empty OAuth credentials when the env vars are absent", async () => {
    const options = await loadAuthOptions();
    const [github, google] = options.providers;

    expect(github.options).toMatchObject({ clientId: "", clientSecret: "" });
    expect(google.options).toMatchObject({ clientId: "", clientSecret: "" });
  });

  describe("credentials authorize()", () => {
    const valid = { email: "viewer@example.com", password: "secret" };

    it("returns the user when the password matches", async () => {
      const user = { id: "u1", email: valid.email, hashedPassword: "hashed" };
      findUnique.mockResolvedValueOnce(user);
      compare.mockResolvedValueOnce(true);

      const authorize = await authorizeOf();

      await expect(authorize(valid, {})).resolves.toEqual(user);
      expect(findUnique).toHaveBeenCalledWith({
        where: { email: valid.email },
      });
      expect(compare).toHaveBeenCalledWith("secret", "hashed");
    });

    it.each<[string, Record<string, string> | undefined]>([
      ["no credentials at all", undefined],
      ["a missing email", { password: "secret" }],
      ["a missing password", { email: "viewer@example.com" }],
    ])("rejects %s", async (_label, credentials) => {
      const authorize = await authorizeOf();

      await expect(
        authorize(credentials, {})
      ).rejects.toThrow("Email and password are required");
      expect(findUnique).not.toHaveBeenCalled();
    });

    it("rejects an email that matches no user", async () => {
      findUnique.mockResolvedValueOnce(null);

      const authorize = await authorizeOf();

      await expect(authorize(valid, {})).rejects.toThrow(
        "Email or password is incorrect"
      );
      expect(compare).not.toHaveBeenCalled();
    });

    it("rejects an OAuth-only user that has no password set", async () => {
      findUnique.mockResolvedValueOnce({ id: "u1", hashedPassword: null });

      const authorize = await authorizeOf();

      await expect(authorize(valid, {})).rejects.toThrow(
        "Email or password is incorrect"
      );
      expect(compare).not.toHaveBeenCalled();
    });

    it("rejects a wrong password", async () => {
      findUnique.mockResolvedValueOnce({ id: "u1", hashedPassword: "hashed" });
      compare.mockResolvedValueOnce(false);

      const authorize = await authorizeOf();

      await expect(authorize(valid, {})).rejects.toThrow(
        "Email or password is incorrect"
      );
    });
  });
});
