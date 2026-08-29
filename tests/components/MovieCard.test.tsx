import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import MovieCard from "../../components/MovieCard";

const { push, openModal } = vi.hoisted(() => ({
  push: vi.fn(),
  openModal: vi.fn(),
}));

vi.mock("next/navigation", () => ({ useRouter: () => ({ push }) }));
vi.mock("../../hooks/useInfoModal", () => ({
  default: () => ({ openModal }),
}));
vi.mock("../../components/FavoriteButton", () => ({
  default: ({ movieId }: { movieId: string }) => (
    <button type="button">favorite:{movieId}</button>
  ),
}));

const movie = {
  id: "m1",
  title: "Sintel",
  genre: "Sci-Fi",
  duration: "15 minutes",
  thumbnailUrl: "https://example.test/sintel.jpg",
};

const setViewportWidth = (width: number) =>
  Object.defineProperty(window, "innerWidth", {
    configurable: true,
    writable: true,
    value: width,
  });

describe("MovieCard", () => {
  beforeEach(() => {
    push.mockReset();
    openModal.mockReset();
    setViewportWidth(1280);
  });

  it("renders both thumbnails and the metadata row", () => {
    render(<MovieCard data={movie} />);

    const thumbnails = screen.getAllByAltText("Thumbnail");
    expect(thumbnails).toHaveLength(2);
    expect(thumbnails[0]).toHaveAttribute("src", movie.thumbnailUrl);
    expect(thumbnails[0]).toHaveAttribute("data-fill", "true");
    expect(screen.getByText(movie.genre)).toBeInTheDocument();
    expect(screen.getByText(movie.duration)).toBeInTheDocument();
    expect(screen.getByText("favorite:m1")).toBeInTheDocument();
  });

  it("opens the watch page when the card is tapped on a phone", async () => {
    setViewportWidth(390);
    const { container } = render(<MovieCard data={movie} />);

    await userEvent.click(container.firstElementChild as Element);

    expect(push).toHaveBeenCalledWith("/watch/m1");
  });

  it("does not navigate when the card is clicked on a wide screen", async () => {
    const { container } = render(<MovieCard data={movie} />);

    await userEvent.click(container.firstElementChild as Element);

    expect(push).not.toHaveBeenCalled();
  });

  it("plays the movie from the hover overlay", async () => {
    const { container } = render(<MovieCard data={movie} />);

    const play = container.querySelector(".bg-white") as Element;
    await userEvent.click(play);

    expect(push).toHaveBeenCalledWith("/watch/m1");
  });

  it("opens the info modal from the chevron", async () => {
    const { container } = render(<MovieCard data={movie} />);

    const chevron = container.querySelector(".border-white") as Element;
    await userEvent.click(chevron);

    expect(openModal).toHaveBeenCalledWith("m1");
  });
});
