import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import MovieList from "../../components/MovieList";

vi.mock("../../components/MovieCard", () => ({
  default: ({ data }: { data: { id: string; title: string } }) => (
    <div data-testid="movie-card">{data.title}</div>
  ),
}));

const movies = [
  { id: "m1", title: "Sintel" },
  { id: "m2", title: "Tears of Steel" },
];

describe("MovieList", () => {
  it("renders a titled row with one card per movie", () => {
    render(<MovieList title="Action" data={movies} />);

    expect(screen.getByText("Action")).toBeInTheDocument();
    expect(screen.getAllByTestId("movie-card")).toHaveLength(2);
    expect(screen.getByText("Sintel")).toBeInTheDocument();
  });

  it.each([
    ["an empty array", []],
    ["undefined data", undefined],
  ])("renders nothing for %s", (_label, data) => {
    const { container } = render(
      <MovieList title="Action" data={data as never} />
    );

    expect(container).toBeEmptyDOMElement();
  });
});
