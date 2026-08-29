import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import FavoriteButton from "../../components/FavoriteButton";

const { post, patch, useCurrentUser, useFavorites, mutate, mutateFavorites } =
  vi.hoisted(() => ({
    post: vi.fn(),
    patch: vi.fn(),
    useCurrentUser: vi.fn(),
    useFavorites: vi.fn(),
    mutate: vi.fn(),
    mutateFavorites: vi.fn(),
  }));

vi.mock("axios", () => ({ default: { post, patch } }));
vi.mock("../../hooks/useCurrentUser", () => ({ default: useCurrentUser }));
vi.mock("../../hooks/useFavorites", () => ({ default: useFavorites }));

const renderButton = (favoriteIds: string[] | undefined) => {
  useCurrentUser.mockReturnValue({
    data: favoriteIds === undefined ? {} : { id: "u1", favoriteIds },
    mutate,
  });
  return render(<FavoriteButton movieId="m1" />);
};

describe("FavoriteButton", () => {
  beforeEach(() => {
    for (const mock of [post, patch, mutate, mutateFavorites, useCurrentUser]) {
      mock.mockReset();
    }
    useFavorites.mockReturnValue({ mutate: mutateFavorites });
  });

  it("adds the movie when it is not yet a favourite", async () => {
    post.mockResolvedValueOnce({ data: { favoriteIds: ["m1"] } });
    const { container } = renderButton([]);

    await userEvent.click(container.firstElementChild as Element);

    expect(post).toHaveBeenCalledWith("/api/favorite", { movieId: "m1" });
    expect(patch).not.toHaveBeenCalled();
    expect(mutate).toHaveBeenCalledWith({ id: "u1", favoriteIds: ["m1"] });
    expect(mutateFavorites).toHaveBeenCalledOnce();
  });

  it("removes the movie when it is already a favourite", async () => {
    patch.mockResolvedValueOnce({ data: { favoriteIds: [] } });
    const { container } = renderButton(["m1"]);

    await userEvent.click(container.firstElementChild as Element);

    expect(patch).toHaveBeenCalledWith("/api/favorite", { movieId: "m1" });
    expect(post).not.toHaveBeenCalled();
    expect(mutate).toHaveBeenCalledWith({
      id: "u1",
      favoriteIds: [],
    });
  });

  it("treats a user with no favourites list as not having favourited it", async () => {
    post.mockResolvedValueOnce({ data: { favoriteIds: ["m1"] } });
    const { container } = renderButton(undefined);

    await userEvent.click(container.firstElementChild as Element);

    expect(post).toHaveBeenCalledOnce();
  });

  it("tolerates a response that carries no favourites list", async () => {
    post.mockResolvedValueOnce(undefined);
    const { container } = renderButton([]);

    await userEvent.click(container.firstElementChild as Element);

    expect(mutate).toHaveBeenCalledWith({
      id: "u1",
      favoriteIds: undefined,
    });
  });

  it("renders a plus icon off the list and a check on it", () => {
    const { container: notFavorited } = renderButton([]);
    const { container: favorited } = renderButton(["m1"]);

    expect(notFavorited.querySelector("svg")).toBeInTheDocument();
    expect(favorited.querySelector("svg")).toBeInTheDocument();
    expect(notFavorited.querySelector("svg")?.innerHTML).not.toBe(
      favorited.querySelector("svg")?.innerHTML
    );
  });
});
