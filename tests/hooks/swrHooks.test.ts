import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import fetcher from "../../libs/fetcher";
import useBillboard from "../../hooks/useBillboard";
import useCurrentUser from "../../hooks/useCurrentUser";
import useFavorites from "../../hooks/useFavorites";
import useMovie from "../../hooks/useMovie";
import useMovies from "../../hooks/useMovies";

const useSWR = vi.hoisted(() => vi.fn());
vi.mock("swr", () => ({ default: useSWR }));

/** Every hook here disables SWR's automatic revalidation except useCurrentUser. */
const NO_REVALIDATE = {
  revalidateIfStale: false,
  revalidateOnFocus: false,
  revalidateOnReconnect: false,
};

const swrResult = (data: unknown) => ({
  data,
  error: undefined,
  isLoading: false,
  mutate: vi.fn(),
});

describe("SWR-backed hooks", () => {
  beforeEach(() => {
    useSWR.mockReset();
  });

  it("useBillboard fetches a random title without revalidating", () => {
    const result = swrResult({ id: "billboard-1" });
    useSWR.mockReturnValue(result);

    const { result: hook } = renderHook(() => useBillboard());

    expect(useSWR).toHaveBeenCalledWith("/api/random", fetcher, NO_REVALIDATE);
    expect(hook.current).toEqual({
      data: result.data,
      error: result.error,
      isLoading: result.isLoading,
    });
  });

  it("useCurrentUser fetches the session user and exposes mutate", () => {
    const result = swrResult({ id: "u1", name: "Ada" });
    useSWR.mockReturnValue(result);

    const { result: hook } = renderHook(() => useCurrentUser());

    expect(useSWR).toHaveBeenCalledWith("/api/current", fetcher);
    expect(hook.current).toEqual({
      data: result.data,
      error: result.error,
      isLoading: result.isLoading,
      mutate: result.mutate,
    });
  });

  it("useFavorites fetches the favourites list and exposes mutate", () => {
    const result = swrResult([{ id: "m1" }]);
    useSWR.mockReturnValue(result);

    const { result: hook } = renderHook(() => useFavorites());

    expect(useSWR).toHaveBeenCalledWith(
      "/api/favorites",
      fetcher,
      NO_REVALIDATE
    );
    expect(hook.current).toEqual({
      data: result.data,
      error: result.error,
      isLoading: result.isLoading,
      mutate: result.mutate,
    });
  });

  it("useMovie requests the given movie", () => {
    useSWR.mockReturnValue(swrResult({ id: "m1" }));

    const { result } = renderHook(() => useMovie("m1"));

    expect(useSWR).toHaveBeenCalledWith("/api/movies/m1", fetcher, {
      revalidateOnFocus: false,
      revalidateIfStale: false,
      revalidateOnReconnect: false,
    });
    expect(result.current.data).toEqual({ id: "m1" });
  });

  it("useMovie passes a null key when no id is given, so SWR does not fetch", () => {
    useSWR.mockReturnValue(swrResult(undefined));

    renderHook(() => useMovie());

    expect(useSWR).toHaveBeenCalledWith(null, fetcher, expect.any(Object));
  });

  it("useMovies splits the catalogue into action, sci-fi and everything else", () => {
    const action = { id: "a", genre: "Action" };
    const scifi = { id: "s", genre: "Sci-Fi" };
    const comedy = { id: "c", genre: "Comedy" };
    useSWR.mockReturnValue(swrResult([action, scifi, comedy]));

    const { result } = renderHook(() => useMovies());

    expect(useSWR).toHaveBeenCalledWith("/api/movies", fetcher, NO_REVALIDATE);
    expect(result.current.actionList).toEqual([action]);
    expect(result.current.scifiList).toEqual([scifi]);
    expect(result.current.otherList).toEqual([comedy]);
  });

  it("useMovies leaves every list undefined while the catalogue is still loading", () => {
    useSWR.mockReturnValue({
      data: undefined,
      error: undefined,
      isLoading: true,
      mutate: vi.fn(),
    });

    const { result } = renderHook(() => useMovies());

    expect(result.current.actionList).toBeUndefined();
    expect(result.current.scifiList).toBeUndefined();
    expect(result.current.otherList).toBeUndefined();
    expect(result.current.isLoading).toBe(true);
  });

  it("useMovies surfaces the fetch error", () => {
    const error = new Error("500");
    useSWR.mockReturnValue({
      data: undefined,
      error,
      isLoading: false,
      mutate: vi.fn(),
    });

    const { result } = renderHook(() => useMovies());

    expect(result.current.error).toBe(error);
  });
});
