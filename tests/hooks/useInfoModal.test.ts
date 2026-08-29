import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";

import useInfoModal from "../../hooks/useInfoModal";

describe("useInfoModal", () => {
  beforeEach(() => {
    useInfoModal.setState({ movieId: undefined, isOpen: false });
  });

  it("starts closed with no selected movie", () => {
    const { result } = renderHook(() => useInfoModal());

    expect(result.current.isOpen).toBe(false);
    expect(result.current.movieId).toBeUndefined();
  });

  it("openModal stores the movie id and opens the modal", () => {
    const { result } = renderHook(() => useInfoModal());

    act(() => result.current.openModal("movie-42"));

    expect(result.current.isOpen).toBe(true);
    expect(result.current.movieId).toBe("movie-42");
  });

  it("closeModal clears the selection", () => {
    const { result } = renderHook(() => useInfoModal());

    act(() => result.current.openModal("movie-42"));
    act(() => result.current.closeModal());

    expect(result.current.isOpen).toBe(false);
    expect(result.current.movieId).toBeUndefined();
  });
});
