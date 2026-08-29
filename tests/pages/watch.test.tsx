import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import Watch from "../../pages/watch/[movieId]";

const { useRouter, useMovie, push } = vi.hoisted(() => ({
  useRouter: vi.fn(),
  useMovie: vi.fn(),
  push: vi.fn(),
}));

vi.mock("next/router", () => ({ useRouter }));
vi.mock("../../hooks/useMovie", () => ({ default: useMovie }));

const movie = {
  id: "m1",
  title: "Sintel",
  videoUrl: "https://example.test/sintel.mp4",
};

describe("Watch", () => {
  beforeEach(() => {
    push.mockReset();
    useRouter.mockReturnValue({ query: { movieId: "m1" }, push });
    useMovie.mockReturnValue({ data: movie });
  });

  it("plays the movie named in the route", () => {
    render(<Watch />);

    expect(useMovie).toHaveBeenCalledWith("m1");
    expect(screen.getByText("Watching:")).toBeInTheDocument();
    expect(screen.getByText(movie.title)).toBeInTheDocument();

    const player = screen.getByTestId("react-player");
    expect(player).toHaveAttribute("src", movie.videoUrl);
    expect(player).toHaveAttribute("data-playing", "true");
    expect(player).toHaveAttribute("data-volume", "0.5");
  });

  it("renders an empty player while the movie is loading", () => {
    useMovie.mockReturnValue({ data: undefined });

    render(<Watch />);

    expect(screen.getByTestId("react-player")).not.toHaveAttribute("src");
  });

  it("goes back to the browse page", async () => {
    const { container } = render(<Watch />);

    await userEvent.click(container.querySelector("svg") as Element);

    expect(push).toHaveBeenCalledWith("/");
  });
});
