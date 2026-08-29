import type { NextPageContext } from "next";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import Profiles, { getServerSideProps } from "../../pages/profiles";

const { getSession, useCurrentUser, push } = vi.hoisted(() => ({
  getSession: vi.fn(),
  useCurrentUser: vi.fn(),
  push: vi.fn(),
}));

vi.mock("next-auth/react", () => ({ getSession }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push }) }));
vi.mock("../../hooks/useCurrentUser", () => ({ default: useCurrentUser }));

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

describe("Profiles", () => {
  beforeEach(() => {
    push.mockReset();
    useCurrentUser.mockReturnValue({ data: { name: "Ada" } });
  });

  it("shows the profile once the user has loaded", () => {
    render(<Profiles />);

    expect(screen.getByText("Who is watching")).toBeInTheDocument();
    expect(screen.getByText("Ada")).toBeInTheDocument();
    expect(screen.getByAltText("Avatar")).toBeInTheDocument();
  });

  it("shows a skeleton while the user is still loading", () => {
    useCurrentUser.mockReturnValue({ data: undefined });

    const { container } = render(<Profiles />);

    expect(container.querySelector('[aria-busy="true"]')).toBeInTheDocument();
    expect(screen.queryByAltText("Avatar")).not.toBeInTheDocument();
  });

  it("enters the app when the loaded profile is picked", async () => {
    render(<Profiles />);

    await userEvent.click(screen.getByText("Ada"));

    expect(push).toHaveBeenCalledWith("/");
  });

  it("ignores clicks while the profile is still loading", async () => {
    useCurrentUser.mockReturnValue({ data: undefined });

    const { container } = render(<Profiles />);
    await userEvent.click(
      container.querySelector('[aria-busy="true"]') as Element
    );

    expect(push).not.toHaveBeenCalled();
  });
});
