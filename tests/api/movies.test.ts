// @vitest-environment node
import type { NextApiRequest, NextApiResponse } from "next";
import { createMocks, type RequestMethod } from "node-mocks-http";
import { beforeEach, describe, expect, it, vi } from "vitest";

import listHandler from "../../pages/api/movies/index";
import oneHandler from "../../pages/api/movies/[movieId]";

const { serverAuth, findMany, findUnique } = vi.hoisted(() => ({
  serverAuth: vi.fn(),
  findMany: vi.fn(),
  findUnique: vi.fn(),
}));

vi.mock("../../libs/serverAuth", () => ({ default: serverAuth }));
vi.mock("../../libs/prismadb", () => ({
  default: { movie: { findMany, findUnique } },
}));

const mocks = (method: RequestMethod, query: Record<string, unknown> = {}) =>
  createMocks<NextApiRequest, NextApiResponse>({
    method,
    query: query as never,
  });

describe("GET /api/movies", () => {
  beforeEach(() => {
    serverAuth.mockReset();
    findMany.mockReset();
  });

  it("returns the whole catalogue", async () => {
    const movies = [{ id: "m1" }, { id: "m2" }];
    serverAuth.mockResolvedValueOnce({ user: { id: "u1" } });
    findMany.mockResolvedValueOnce(movies);
    const { req, res } = mocks("GET");

    await listHandler(req, res);

    expect(res._getStatusCode()).toBe(200);
    expect(res._getJSONData()).toEqual(movies);
  });

  it("rejects anything other than GET", async () => {
    const { req, res } = mocks("POST");

    await listHandler(req, res);

    expect(res._getStatusCode()).toBe(405);
    expect(serverAuth).not.toHaveBeenCalled();
  });

  it("answers 400 when the caller is not authenticated", async () => {
    serverAuth.mockRejectedValueOnce(new Error("Not authenticated"));
    const { req, res } = mocks("GET");

    await listHandler(req, res);

    expect(res._getStatusCode()).toBe(400);
  });
});

describe("GET /api/movies/[movieId]", () => {
  beforeEach(() => {
    serverAuth.mockReset();
    findUnique.mockReset();
    serverAuth.mockResolvedValue({ user: { id: "u1" } });
  });

  it("returns the requested movie", async () => {
    const movie = { id: "m1", title: "Sintel" };
    findUnique.mockResolvedValueOnce(movie);
    const { req, res } = mocks("GET", { movieId: "m1" });

    await oneHandler(req, res);

    expect(findUnique).toHaveBeenCalledWith({ where: { id: "m1" } });
    expect(res._getStatusCode()).toBe(200);
    expect(res._getJSONData()).toEqual(movie);
  });

  it("rejects anything other than GET", async () => {
    const { req, res } = mocks("DELETE", { movieId: "m1" });

    await oneHandler(req, res);

    expect(res._getStatusCode()).toBe(405);
    expect(serverAuth).not.toHaveBeenCalled();
  });

  it("answers 400 when the id is repeated in the query string", async () => {
    const { req, res } = mocks("GET", { movieId: ["m1", "m2"] });

    await oneHandler(req, res);

    expect(res._getStatusCode()).toBe(400);
    expect(findUnique).not.toHaveBeenCalled();
  });

  it("answers 400 when the id is empty", async () => {
    const { req, res } = mocks("GET", { movieId: "" });

    await oneHandler(req, res);

    expect(res._getStatusCode()).toBe(400);
    expect(findUnique).not.toHaveBeenCalled();
  });

  it("answers 400 when no movie matches", async () => {
    findUnique.mockResolvedValueOnce(null);
    const { req, res } = mocks("GET", { movieId: "ghost" });

    await oneHandler(req, res);

    expect(res._getStatusCode()).toBe(400);
  });
});
