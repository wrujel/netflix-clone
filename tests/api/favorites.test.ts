// @vitest-environment node
import type { NextApiRequest, NextApiResponse } from "next";
import { createMocks, type RequestMethod } from "node-mocks-http";
import { beforeEach, describe, expect, it, vi } from "vitest";

import handler from "../../pages/api/favorites";

const { serverAuth, findMany } = vi.hoisted(() => ({
  serverAuth: vi.fn(),
  findMany: vi.fn(),
}));

vi.mock("../../libs/serverAuth", () => ({ default: serverAuth }));
vi.mock("../../libs/prismadb", () => ({
  default: { movie: { findMany } },
}));

const mocks = (method: RequestMethod) =>
  createMocks<NextApiRequest, NextApiResponse>({ method });

describe("GET /api/favorites", () => {
  beforeEach(() => {
    serverAuth.mockReset();
    findMany.mockReset();
    vi.spyOn(console, "log").mockImplementation(() => {});
  });

  it("returns the movies the user has favourited", async () => {
    const favourites = [{ id: "m1" }, { id: "m2" }];
    serverAuth.mockResolvedValueOnce({ user: { favoriteIds: ["m1", "m2"] } });
    findMany.mockResolvedValueOnce(favourites);
    const { req, res } = mocks("GET");

    await handler(req, res);

    expect(findMany).toHaveBeenCalledWith({
      where: { id: { in: ["m1", "m2"] } },
    });
    expect(res._getStatusCode()).toBe(200);
    expect(res._getJSONData()).toEqual(favourites);
  });

  it("queries with an undefined id list when there is no user on the result", async () => {
    serverAuth.mockResolvedValueOnce({ user: undefined });
    findMany.mockResolvedValueOnce([]);
    const { req, res } = mocks("GET");

    await handler(req, res);

    expect(findMany).toHaveBeenCalledWith({ where: { id: { in: undefined } } });
    expect(res._getStatusCode()).toBe(200);
  });

  it("rejects anything other than GET", async () => {
    const { req, res } = mocks("DELETE");

    await handler(req, res);

    expect(res._getStatusCode()).toBe(405);
    expect(serverAuth).not.toHaveBeenCalled();
  });

  it("answers 500 when the lookup blows up", async () => {
    serverAuth.mockRejectedValueOnce(new Error("Not authenticated"));
    const { req, res } = mocks("GET");

    await handler(req, res);

    expect(res._getStatusCode()).toBe(500);
  });
});
