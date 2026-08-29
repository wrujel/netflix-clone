// @vitest-environment node
import type { NextApiRequest, NextApiResponse } from "next";
import { createMocks, type RequestMethod } from "node-mocks-http";
import { beforeEach, describe, expect, it, vi } from "vitest";

import handler from "../../pages/api/current";

const serverAuth = vi.hoisted(() => vi.fn());
vi.mock("../../libs/serverAuth", () => ({ default: serverAuth }));

const mocks = (method: RequestMethod) =>
  createMocks<NextApiRequest, NextApiResponse>({ method });

describe("GET /api/current", () => {
  beforeEach(() => serverAuth.mockReset());

  it("returns the authenticated user", async () => {
    const user = { id: "u1", name: "Ada" };
    serverAuth.mockResolvedValueOnce({ user });
    const { req, res } = mocks("GET");

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    expect(res._getJSONData()).toEqual(user);
  });

  it("rejects anything other than GET", async () => {
    const { req, res } = mocks("POST");

    await handler(req, res);

    expect(res._getStatusCode()).toBe(405);
    expect(serverAuth).not.toHaveBeenCalled();
  });

  it("answers 400 when the caller is not authenticated", async () => {
    serverAuth.mockRejectedValueOnce(new Error("Not authenticated"));
    const { req, res } = mocks("GET");

    await handler(req, res);

    expect(res._getStatusCode()).toBe(400);
  });
});
