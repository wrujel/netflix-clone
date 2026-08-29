import { describe, expect, it, vi } from "vitest";

import fetcher from "../../libs/fetcher";

const get = vi.hoisted(() => vi.fn());
vi.mock("axios", () => ({ default: { get } }));

describe("fetcher", () => {
  it("GETs the url and unwraps the response body", async () => {
    get.mockResolvedValueOnce({ data: { id: "movie-1" }, status: 200 });

    await expect(fetcher("/api/movies")).resolves.toEqual({ id: "movie-1" });
    expect(get).toHaveBeenCalledWith("/api/movies");
  });

  it("propagates request failures", async () => {
    get.mockRejectedValueOnce(new Error("network down"));

    await expect(fetcher("/api/movies")).rejects.toThrow("network down");
  });
});
