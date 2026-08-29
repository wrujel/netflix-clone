// @vitest-environment node
import type { NextApiRequest, NextApiResponse } from "next";
import { createMocks, type RequestMethod } from "node-mocks-http";
import { beforeEach, describe, expect, it, vi } from "vitest";

import handler from "../../pages/api/random";

const { serverAuth, findMany } = vi.hoisted(() => ({
  serverAuth: vi.fn(),
  findMany: vi.fn(),
}));

vi.mock("../../libs/serverAuth", () => ({ default: serverAuth }));
vi.mock("../../libs/prismadb", () => ({ default: { movie: { findMany } } }));

const mocks = (method: RequestMethod) =>
  createMocks<NextApiRequest, NextApiResponse>({ method });

describe("GET /api/random", () => {
  beforeEach(() => {
    serverAuth.mockReset();
    findMany.mockReset();
  });

  it("returns one demo title, skipping a random number of rows", async () => {
    const movie = { id: "m3", title: "Big Buck Bunny" };
    serverAuth.mockResolvedValueOnce({ user: { id: "u1" } });
    findMany.mockResolvedValueOnce([movie]);
    vi.spyOn(Math, "random").mockReturnValue(0.75);
    const { req, res } = mocks("GET");

    await handler(req, res);

    expect(findMany).toHaveBeenCalledWith({
      where: { videoUrl: { startsWith: "https://commondatastorage" } },
      take: 1,
      skip: 3,
    });
    expect(res._getStatusCode()).toBe(200);
    expect(res._getJSONData()).toEqual(movie);
  });

  it("rejects anything other than GET", async () => {
    const { req, res } = mocks("PUT");

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
