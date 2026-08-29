import type { NextPageContext } from "next";
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import Home, { getServerSideProps } from "../../pages/index";

const { getSession, useMovies, useFavorites, useInfoModal, closeModal } =
  vi.hoisted(() => ({
    getSession: vi.fn(),
    useMovies: vi.fn(),
    useFavorites: vi.fn(),
    useInfoModal: vi.fn(),
    closeModal: vi.fn(),
  }));

vi.mock("next-auth/react", () => ({ getSession }));
vi.mock("../../hooks/useMovies", () => ({ default: useMovies }));
vi.mock("../../hooks/useFavorites", () => ({ default: useFavorites }));
vi.mock("../../hooks/useInfoModal", () => ({ default: useInfoModal }));
vi.mock("../../components/Navbar", () => ({
  default: () => <nav>navbar</nav>,
}));
vi.mock("../../components/Billboard", () => ({
  default: () => <div>billboard</div>,
}));
vi.mock("../../components/InfoModal", () => ({
  default: ({ visible }: { visible: boolean }) =>
    visible ? <div>info modal</div> : null,
}));
vi.mock("../../components/MovieList", () => ({
  default: ({ title, data }: { title: string; data: unknown[] }) => (
    <section>
      {title}:{data?.length ?? 0}
    </section>
  ),
}));

const context = {} as NextPageContext;

describe("getServerSideProps", () => {
  beforeEach(() => getSession.mockReset());

  it("renders the page for a signed-in visitor", async () => {
    getSession.mockResolvedValueOnce({ user: { email: "v@example.com" } });

    await expect(getServerSideProps(context)).resolves.toEqual({ props: {} });
  });

  it("redirects an anonymous visitor to the sign-in page", async () => {
    getSession.mockResolvedValueOnce(null);

    await expect(getServerSideProps(context)).resolves.toEqual({
      redirect: { destination: "/auth", permanent: false },
    });
  });
});

describe("Home", () => {
  beforeEach(() => {
    useMovies.mockReturnValue({
      actionList: [{ id: "a1" }],
      scifiList: [{ id: "s1" }, { id: "s2" }],
      otherList: [],
    });
    useFavorites.mockReturnValue({ data: [{ id: "f1" }] });
    useInfoModal.mockReturnValue({ isOpen: false, closeModal });
  });

  it("lays out every catalogue row", () => {
    render(<Home />);

    expect(screen.getByText("navbar")).toBeInTheDocument();
    expect(screen.getByText("billboard")).toBeInTheDocument();
    expect(screen.getByText("Action:1")).toBeInTheDocument();
    expect(screen.getByText("Sci-Fi:2")).toBeInTheDocument();
    expect(screen.getByText("My List:1")).toBeInTheDocument();
    expect(screen.getByText("Other:0")).toBeInTheDocument();
    expect(screen.queryByText("info modal")).not.toBeInTheDocument();
  });

  it("defaults the favourites row to empty while it loads", () => {
    useFavorites.mockReturnValue({ data: undefined });

    render(<Home />);

    expect(screen.getByText("My List:0")).toBeInTheDocument();
  });

  it("shows the info modal when the store says it is open", () => {
    useInfoModal.mockReturnValue({ isOpen: true, closeModal });

    render(<Home />);

    expect(screen.getByText("info modal")).toBeInTheDocument();
  });
});
