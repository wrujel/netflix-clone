import { act, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import InfoModal from "../../components/InfoModal";

const { useMovie, useInfoModal, push } = vi.hoisted(() => ({
  useMovie: vi.fn(),
  useInfoModal: vi.fn(),
  push: vi.fn(),
}));

vi.mock("../../hooks/useMovie", () => ({ default: useMovie }));
vi.mock("../../hooks/useInfoModal", () => ({ default: useInfoModal }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push }) }));
vi.mock("../../components/FavoriteButton", () => ({
  default: ({ movieId }: { movieId: string }) => (
    <button type="button">favorite:{String(movieId)}</button>
  ),
}));

const movie = {
  id: "m1",
  title: "Sintel",
  description: "A lone warrior searches for her dragon.",
  duration: "15 minutes",
  genre: "Sci-Fi",
  videoUrl: "https://example.test/sintel.mp4",
  thumbnailUrl: "https://example.test/sintel.jpg",
};

describe("InfoModal", () => {
  beforeEach(() => {
    useInfoModal.mockReturnValue({ movieId: "m1" });
    useMovie.mockReturnValue({ data: movie });
  });

  it("renders nothing while hidden", () => {
    const { container } = render(<InfoModal onClose={vi.fn()} />);

    expect(container).toBeEmptyDOMElement();
    expect(useMovie).toHaveBeenCalledWith("m1");
  });

  it("shows the selected movie's details", () => {
    const { container } = render(<InfoModal visible onClose={vi.fn()} />);

    expect(screen.getByText(movie.title)).toBeInTheDocument();
    expect(screen.getByText(movie.duration)).toBeInTheDocument();
    expect(screen.getByText(movie.genre)).toBeInTheDocument();
    expect(screen.getByText(movie.description)).toBeInTheDocument();
    expect(screen.getByText("favorite:m1")).toBeInTheDocument();
    expect(container.querySelector("video")).toHaveAttribute(
      "src",
      movie.videoUrl
    );
  });

  it("falls back to an empty movie while the details are loading", () => {
    useMovie.mockReturnValue({ data: undefined });

    const { container } = render(<InfoModal visible onClose={vi.fn()} />);

    expect(container.querySelector("video")).not.toHaveAttribute("src");
    expect(screen.getByText("favorite:undefined")).toBeInTheDocument();
  });

  it("scales in when it is opened after mounting hidden", () => {
    const { container, rerender } = render(
      <InfoModal visible={false} onClose={vi.fn()} />
    );

    expect(container).toBeEmptyDOMElement();

    rerender(<InfoModal visible onClose={vi.fn()} />);

    expect(container.querySelector(".scale-100")).toBeInTheDocument();
    expect(container.querySelector(".scale-0")).not.toBeInTheDocument();
  });

  it("collapses first and calls onClose once the transition has run", async () => {
    vi.useFakeTimers();
    try {
      const onClose = vi.fn();
      const { container } = render(<InfoModal visible onClose={onClose} />);

      const closeButton = container.querySelector(".cursor-pointer") as Element;
      act(() => closeButton.dispatchEvent(new MouseEvent("click", { bubbles: true })));

      expect(container.querySelector(".scale-0")).toBeInTheDocument();
      expect(onClose).not.toHaveBeenCalled();

      act(() => void vi.advanceTimersByTime(300));

      expect(onClose).toHaveBeenCalledOnce();
    } finally {
      vi.useRealTimers();
    }
  });
});
