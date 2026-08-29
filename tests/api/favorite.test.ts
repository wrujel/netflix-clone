// @vitest-environment node
import type { NextApiRequest, NextApiResponse } from "next";
import { createMocks, type RequestMethod } from "node-mocks-http";
import { beforeEach, describe, expect, it, vi } from "vitest";

import handler from "../../pages/api/favorite";

const { serverAuth, findUnique, update } = vi.hoisted(() => ({
  serverAuth: vi.fn(),
  findUnique: vi.fn(),
  update: vi.fn(),
}));

vi.mock("../../libs/serverAuth", () => ({ default: serverAuth }));
vi.mock("../../libs/prismadb", () => ({
  default: { movie: { findUnique }, user: { update } },
}));

const mocks = (method: RequestMethod, body?: Record<string, unknown>) =>
  createMocks<NextApiRequest, NextApiResponse>({ method, body });

describe("/api/favorite", () => {
  beforeEach(() => {
    serverAuth.mockReset();
    findUnique.mockReset();
    update.mockReset();
    vi.spyOn(console, "log").mockImplementation(() => {});
  });

  describe("POST", () => {
    it("pushes the movie onto the favourites list", async () => {
      serverAuth.mockResolvedValueOnce({
        user: { email: "viewer@example.com", favoriteIds: [] },
      });
      findUnique.mockResolvedValueOnce({ id: "m1" });
      const updated = { id: "u1", favoriteIds: ["m1"] };
      update.mockResolvedValueOnce(updated);
      const { req, res } = mocks("POST", { movieId: "m1" });

      await handler(req, res);

      expect(findUnique).toHaveBeenCalledWith({ where: { id: "m1" } });
      expect(update).toHaveBeenCalledWith({
        where: { email: "viewer@example.com" },
        data: { favoriteIds: { push: "m1" } },
      });
      expect(res._getStatusCode()).toBe(200);
      expect(res._getJSONData()).toEqual(updated);
    });

    it("falls back to an empty email when the record has none", async () => {
      serverAuth.mockResolvedValueOnce({
        user: { email: null, favoriteIds: [] },
      });
      findUnique.mockResolvedValueOnce({ id: "m1" });
      update.mockResolvedValueOnce({ id: "u1" });
      const { req, res } = mocks("POST", { movieId: "m1" });

      await handler(req, res);

      expect(update).toHaveBeenCalledWith(
        expect.objectContaining({ where: { email: "" } })
      );
      expect(res._getStatusCode()).toBe(200);
    });

    it("answers 500 for an unknown movie id", async () => {
      serverAuth.mockResolvedValueOnce({ user: { email: "v@example.com" } });
      findUnique.mockResolvedValueOnce(null);
      const { req, res } = mocks("POST", { movieId: "nope" });

      await handler(req, res);

      expect(update).not.toHaveBeenCalled();
      expect(res._getStatusCode()).toBe(500);
    });
  });

  describe("PATCH", () => {
    it("removes the movie from the favourites list", async () => {
      serverAuth.mockResolvedValueOnce({
        user: { email: "viewer@example.com", favoriteIds: ["m1", "m2"] },
      });
      findUnique.mockResolvedValueOnce({ id: "m1" });
      const updated = { id: "u1", favoriteIds: ["m2"] };
      update.mockResolvedValueOnce(updated);
      const { req, res } = mocks("PATCH", { movieId: "m1" });

      await handler(req, res);

      expect(update).toHaveBeenCalledWith({
        where: { email: "viewer@example.com" },
        data: { favoriteIds: ["m2"] },
      });
      expect(res._getStatusCode()).toBe(200);
      expect(res._getJSONData()).toEqual(updated);
    });

    it("falls back to an empty email when the record has none", async () => {
      serverAuth.mockResolvedValueOnce({
        user: { email: undefined, favoriteIds: ["m1"] },
      });
      findUnique.mockResolvedValueOnce({ id: "m1" });
      update.mockResolvedValueOnce({ id: "u1" });
      const { req, res } = mocks("PATCH", { movieId: "m1" });

      await handler(req, res);

      expect(update).toHaveBeenCalledWith(
        expect.objectContaining({ where: { email: "" } })
      );
    });

    it("answers 500 for an unknown movie id", async () => {
      serverAuth.mockResolvedValueOnce({ user: { email: "v@example.com" } });
      findUnique.mockResolvedValueOnce(null);
      const { req, res } = mocks("PATCH", { movieId: "nope" });

      await handler(req, res);

      expect(update).not.toHaveBeenCalled();
      expect(res._getStatusCode()).toBe(500);
    });
  });

  it("rejects any other method", async () => {
    const { req, res } = mocks("GET");

    await handler(req, res);

    expect(res._getStatusCode()).toBe(405);
    expect(serverAuth).not.toHaveBeenCalled();
  });
});
