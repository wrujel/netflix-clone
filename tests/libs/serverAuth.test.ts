import type { NextApiRequest, NextApiResponse } from "next";
import { beforeEach, describe, expect, it, vi } from "vitest";

import serverAuth from "../../libs/serverAuth";

const { getServerSession, findUnique } = vi.hoisted(() => ({
  getServerSession: vi.fn(),
  findUnique: vi.fn(),
}));

vi.mock("next-auth", () => ({ getServerSession }));
vi.mock("../../libs/prismadb", () => ({
  default: { user: { findUnique } },
}));
vi.mock("../../pages/api/auth/[...nextauth]", () => ({
  authOptions: { providers: [] },
}));

const req = {} as NextApiRequest;
const res = {} as NextApiResponse;

describe("serverAuth", () => {
  beforeEach(() => {
    getServerSession.mockReset();
    findUnique.mockReset();
  });

  it("returns the user behind a valid session", async () => {
    const user = { id: "u1", email: "viewer@example.com" };
    getServerSession.mockResolvedValueOnce({ user: { email: user.email } });
    findUnique.mockResolvedValueOnce(user);

    await expect(serverAuth(req, res)).resolves.toEqual({ user });
    expect(getServerSession).toHaveBeenCalledWith(req, res, {
      providers: [],
    });
    expect(findUnique).toHaveBeenCalledWith({
      where: { email: user.email },
    });
  });

  it.each([
    ["no session at all", null],
    ["a session without a user", {}],
    ["a user without an email", { user: {} }],
  ])("rejects when there is %s", async (_label, session) => {
    getServerSession.mockResolvedValueOnce(session);

    await expect(serverAuth(req, res)).rejects.toThrow("Not authenticated");
    expect(findUnique).not.toHaveBeenCalled();
  });

  it("rejects when the session's email matches no stored user", async () => {
    getServerSession.mockResolvedValueOnce({
      user: { email: "ghost@example.com" },
    });
    findUnique.mockResolvedValueOnce(null);

    await expect(serverAuth(req, res)).rejects.toThrow("Not authenticated");
  });
});
