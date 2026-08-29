// @vitest-environment node
import type { NextApiRequest, NextApiResponse } from "next";
import { createMocks, type RequestMethod } from "node-mocks-http";
import { beforeEach, describe, expect, it, vi } from "vitest";

import handler from "../../pages/api/guest";

const { hash, findUnique, create, update } = vi.hoisted(() => ({
  hash: vi.fn(),
  findUnique: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
}));

vi.mock("bcrypt", () => ({ default: { hash }, hash }));
vi.mock("../../libs/prismadb", () => ({
  default: { user: { findUnique, create, update } },
}));

const mocks = (method: RequestMethod) =>
  createMocks<NextApiRequest, NextApiResponse>({ method });

type GuestCredentials = { email: string; password: string };

const credentialsFrom = (res: { _getJSONData: () => unknown }) =>
  res._getJSONData() as GuestCredentials;

describe("POST /api/guest", () => {
  beforeEach(() => {
    hash.mockReset();
    findUnique.mockReset();
    create.mockReset();
    update.mockReset();
    hash.mockResolvedValue("hashed-guest-password");
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  it("creates the shared guest account on first use", async () => {
    findUnique.mockResolvedValueOnce(null);
    create.mockResolvedValueOnce({ id: "g1" });
    const { req, res } = mocks("POST");

    await handler(req, res);

    expect(findUnique).toHaveBeenCalledWith({
      where: { email: "guest@example.com" },
    });
    expect(create).toHaveBeenCalledWith({
      data: {
        email: "guest@example.com",
        name: "Guest",
        hashedPassword: "hashed-guest-password",
        image: "",
        emailVerified: expect.any(Date),
      },
    });
    expect(update).not.toHaveBeenCalled();

    const body = credentialsFrom(res);
    expect(res._getStatusCode()).toBe(200);
    expect(body.email).toBe("guest@example.com");
    expect(body.password).toEqual(expect.any(String));
    expect(hash).toHaveBeenCalledWith(body.password, 12);
  });

  it("rotates the password of an existing guest account", async () => {
    findUnique.mockResolvedValueOnce({ id: "g1" });
    update.mockResolvedValueOnce({ id: "g1" });
    const { req, res } = mocks("POST");

    await handler(req, res);

    expect(create).not.toHaveBeenCalled();
    expect(update).toHaveBeenCalledWith({
      where: { email: "guest@example.com" },
      data: { hashedPassword: "hashed-guest-password" },
    });
    expect(res._getStatusCode()).toBe(200);
  });

  it("honours a GUEST_EMAIL override", async () => {
    vi.stubEnv("GUEST_EMAIL", "demo@netflix.test");
    findUnique.mockResolvedValueOnce({ id: "g1" });
    update.mockResolvedValueOnce({ id: "g1" });
    const { req, res } = mocks("POST");

    await handler(req, res);

    expect(findUnique).toHaveBeenCalledWith({
      where: { email: "demo@netflix.test" },
    });
    expect(credentialsFrom(res).email).toBe("demo@netflix.test");
  });

  it("issues a fresh password on every call", async () => {
    findUnique.mockResolvedValue({ id: "g1" });
    update.mockResolvedValue({ id: "g1" });

    const first = mocks("POST");
    await handler(first.req, first.res);
    const second = mocks("POST");
    await handler(second.req, second.res);

    expect(credentialsFrom(first.res).password).not.toBe(
      credentialsFrom(second.res).password
    );
  });

  it("rejects anything other than POST", async () => {
    const { req, res } = mocks("GET");

    await handler(req, res);

    expect(res._getStatusCode()).toBe(405);
    expect(findUnique).not.toHaveBeenCalled();
  });

  it("answers 500 when the database call fails", async () => {
    findUnique.mockRejectedValueOnce(new Error("connection refused"));
    const { req, res } = mocks("POST");

    await handler(req, res);

    expect(res._getStatusCode()).toBe(500);
    expect(res._getJSONData()).toEqual({
      error: "Unable to retrieve guest user",
    });
  });
});
