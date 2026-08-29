import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import Navbar from "../../components/Navbar";

vi.mock("../../hooks/useCurrentUser", () => ({
  default: () => ({ data: { name: "Ada" } }),
}));
vi.mock("next-auth/react", () => ({ signOut: vi.fn() }));

const scrollTo = (y: number) =>
  act(() => {
    Object.defineProperty(window, "scrollY", {
      configurable: true,
      writable: true,
      value: y,
    });
    window.dispatchEvent(new Event("scroll"));
  });

describe("Navbar", () => {
  it("renders the logo and every desktop destination", () => {
    render(<Navbar />);

    expect(screen.getByAltText("Logo")).toBeInTheDocument();
    for (const label of [
      "Home",
      "Series",
      "Films",
      "New & Popular",
      "My List",
      "Browse by languages",
    ]) {
      expect(screen.getByText(label)).toBeInTheDocument();
    }
  });

  it("gains a background once the page is scrolled past the offset", () => {
    const { container } = render(<Navbar />);
    const bar = () => (container.querySelector("nav > div") as Element).className;

    expect(bar()).not.toContain("bg-zinc-900/90");

    scrollTo(100);
    expect(bar()).toContain("bg-zinc-900/90");

    scrollTo(0);
    expect(bar()).not.toContain("bg-zinc-900/90");
  });

  it("toggles the mobile browse menu", async () => {
    render(<Navbar />);

    expect(screen.queryByText("Browse by Languages")).not.toBeInTheDocument();

    await userEvent.click(screen.getByText("Browse"));
    expect(screen.getByText("Browse by Languages")).toBeInTheDocument();

    await userEvent.click(screen.getByText("Browse"));
    expect(screen.queryByText("Browse by Languages")).not.toBeInTheDocument();
  });

  it("toggles the account menu", async () => {
    const { container } = render(<Navbar />);

    expect(screen.queryByText("Sign out of Netflix")).not.toBeInTheDocument();

    const accountToggle = container.querySelector(
      ".ml-auto .cursor-pointer.relative"
    ) as Element;
    await userEvent.click(accountToggle);
    expect(screen.getByText("Sign out of Netflix")).toBeInTheDocument();

    await userEvent.click(accountToggle);
    expect(screen.queryByText("Sign out of Netflix")).not.toBeInTheDocument();
  });

  it("stops listening for scroll once unmounted", () => {
    const removeEventListener = vi.spyOn(window, "removeEventListener");

    render(<Navbar />).unmount();

    expect(removeEventListener).toHaveBeenCalledWith(
      "scroll",
      expect.any(Function)
    );
  });
});
