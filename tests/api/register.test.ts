// @vitest-environment node
import type { NextApiRequest, NextApiResponse } from "next";
import { createMocks, type RequestMethod } from "node-mocks-http";
import { beforeEach, describe, expect, it, vi } from "vitest";

import handler from "../../pages/api/register";

const { hash, findUnique, create } = vi.hoisted(() => ({
  hash: vi.fn(),
  findUnique: vi.fn(),
  create: vi.fn(),
}));

vi.mock("bcrypt", () => ({ default: { hash }, hash }));
vi.mock("../../libs/prismadb", () => ({
  default: { user: { findUnique, create } },
}));

const mocks = (method: RequestMethod, body?: Record<string, unknown>) =>
  createMocks<NextApiRequest, NextApiResponse>({ method, body });

describe("POST /api/register", () => {
  beforeEach(() => {
    hash.mockReset();
    findUnique.mockReset();
    create.mockReset();
  });

  it("creates a user with a hashed password", async () => {
    findUnique.mockResolvedValueOnce(null);
    hash.mockResolvedValueOnce("hashed-secret");
    const created = { id: "u1", email: "new@example.com" };
    create.mockResolvedValueOnce(created);
    const { req, res } = mocks("POST", {
      email: "new@example.com",
      password: "secret",
      name: "Ada",
    });

    await handler(req, res);

    expect(hash).toHaveBeenCalledWith("secret", 12);
    expect(create).toHaveBeenCalledWith({
      data: {
        email: "new@example.com",
        name: "Ada",
        hashedPassword: "hashed-secret",
        image: "",
        emailVerified: expect.any(Date),
      },
    });
    expect(res._getStatusCode()).toBe(200);
    expect(res._getJSONData()).toEqual(created);
  });

  it("rejects anything other than POST", async () => {
    const { req, res } = mocks("GET");

    await handler(req, res);

    expect(res._getStatusCode()).toBe(405);
    expect(findUnique).not.toHaveBeenCalled();
  });

  it.each([
    ["email", { password: "secret" }],
    ["password", { email: "new@example.com" }],
    ["both", {}],
  ])("answers 400 when %s is missing", async (_label, body) => {
    const { req, res } = mocks("POST", body);

    await handler(req, res);

    expect(res._getStatusCode()).toBe(400);
    expect(res._getJSONData()).toEqual({
      error: "Email and password are required",
    });
    expect(findUnique).not.toHaveBeenCalled();
  });

  it("answers 422 when the email is already taken", async () => {
    findUnique.mockResolvedValueOnce({ id: "u1" });
    const { req, res } = mocks("POST", {
      email: "taken@example.com",
      password: "secret",
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(422);
    expect(res._getJSONData()).toEqual({ error: "Email already exists" });
    expect(create).not.toHaveBeenCalled();
  });

  it("answers 400 when the database call fails", async () => {
    findUnique.mockRejectedValueOnce(new Error("connection refused"));
    const { req, res } = mocks("POST", {
      email: "new@example.com",
      password: "secret",
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(400);
  });
});
