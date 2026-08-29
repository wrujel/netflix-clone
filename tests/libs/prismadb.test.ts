import { beforeEach, describe, expect, it, vi } from "vitest";

const PrismaClient = vi.hoisted(() =>
  // A plain function, not an arrow: prismadb calls it with `new`.
  vi.fn(function () {
    return { tag: "fresh-client" };
  })
);
vi.mock("@prisma/client", () => ({ PrismaClient }));

// The ambient declaration types `prismadb` as a required PrismaClient; the
// test needs to add and remove a stand-in, so widen it here.
type GlobalWithPrisma = { prismadb?: unknown };
const g = globalThis as unknown as GlobalWithPrisma;

describe("prismadb", () => {
  beforeEach(() => {
    vi.resetModules();
    PrismaClient.mockClear();
    delete g.prismadb;
  });

  it("instantiates a client and caches it on globalThis outside production", async () => {
    vi.stubEnv("NODE_ENV", "test");

    const client = (await import("../../libs/prismadb")).default;

    expect(PrismaClient).toHaveBeenCalledOnce();
    expect(client).toEqual({ tag: "fresh-client" });
    expect(g.prismadb).toBe(client);
  });

  it("reuses a client already cached on globalThis", async () => {
    const existing = { tag: "cached-client" };
    g.prismadb = existing;

    const client = (await import("../../libs/prismadb")).default;

    expect(PrismaClient).not.toHaveBeenCalled();
    expect(client).toBe(existing);
  });

  it("does not leak the client onto globalThis in production", async () => {
    vi.stubEnv("NODE_ENV", "production");

    const client = (await import("../../libs/prismadb")).default;

    expect(PrismaClient).toHaveBeenCalledOnce();
    expect(client).toEqual({ tag: "fresh-client" });
    expect(g.prismadb).toBeUndefined();
  });
});
