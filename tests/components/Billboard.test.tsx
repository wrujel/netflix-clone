import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import Billboard from "../../components/Billboard";

const { useBillboard, openModal, push } = vi.hoisted(() => ({
  useBillboard: vi.fn(),
  openModal: vi.fn(),
  push: vi.fn(),
}));

vi.mock("../../hooks/useBillboard", () => ({ default: useBillboard }));
vi.mock("../../hooks/useInfoModal", () => ({
  default: () => ({ openModal }),
}));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push }) }));

const movie = {
  id: "m1",
  title: "Sintel",
  description: "A lone warrior searches for her dragon.",
  videoUrl: "https://example.test/sintel.mp4",
  thumbnailUrl: "https://example.test/sintel.jpg",
};

describe("Billboard", () => {
  beforeEach(() => {
    useBillboard.mockReturnValue({ data: movie });
  });

  it("renders the featured title over its looping trailer", () => {
    const { container } = render(<Billboard />);

    expect(screen.getByText(movie.title)).toBeInTheDocument();
    expect(screen.getByText(movie.description)).toBeInTheDocument();

    const video = container.querySelector("video");
    expect(video).toHaveAttribute("src", movie.videoUrl);
    expect(video).toHaveAttribute("poster", movie.thumbnailUrl);
    expect(video).toHaveAttribute("loop");
  });

  it("opens the info modal for the featured title", async () => {
    render(<Billboard />);

    await userEvent.click(screen.getByRole("button", { name: /more info/i }));

    expect(openModal).toHaveBeenCalledWith("m1");
  });

  it("plays the featured title", async () => {
    render(<Billboard />);

    await userEvent.click(screen.getByRole("button", { name: /play/i }));

    expect(push).toHaveBeenCalledWith("/watch/m1");
  });

  it("renders an empty shell while the billboard is still loading", async () => {
    useBillboard.mockReturnValue({ data: undefined });
    const { container } = render(<Billboard />);

    expect(container.querySelector("video")).not.toHaveAttribute("src");

    await userEvent.click(screen.getByRole("button", { name: /more info/i }));

    expect(openModal).toHaveBeenCalledWith(undefined);
  });
});
