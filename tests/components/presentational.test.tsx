import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import Avatar from "../../components/Avatar";
import Input from "../../components/Input";
import Loading from "../../components/Loading";
import Logo from "../../components/Logo";
import MobileMenu from "../../components/MobileMenu";
import NavbarItem from "../../components/NavbarItem";
import PlayButton from "../../components/PlayButton";

const push = vi.hoisted(() => vi.fn());
vi.mock("next/navigation", () => ({ useRouter: () => ({ push }) }));

describe("Avatar", () => {
  it("renders the default profile picture", () => {
    render(<Avatar />);

    const image = screen.getByAltText("Avatar");
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute("data-priority", "true");
  });

  it("forwards a className", () => {
    render(<Avatar className="w-8 rounded-md" />);

    expect(screen.getByAltText("Avatar")).toHaveClass("w-8", "rounded-md");
  });
});

describe("Logo", () => {
  it("renders the wordmark", () => {
    render(<Logo className="h-4" />);

    const image = screen.getByAltText("Logo");
    expect(image).toBeInTheDocument();
    expect(image).toHaveClass("h-4");
  });
});

describe("Input", () => {
  it("renders a labelled, controlled field", () => {
    render(
      <Input
        id="email"
        label="Email"
        type="text"
        value="viewer@example.com"
        onChange={() => {}}
      />
    );

    const field = screen.getByLabelText("Email");
    expect(field).toHaveValue("viewer@example.com");
    expect(field).toHaveAttribute("type", "text");
    expect(field).toBeRequired();
  });

  it("reports every keystroke to onChange", async () => {
    const onChange = vi.fn();
    render(<Input id="name" label="Username" value="" onChange={onChange} />);

    await userEvent.type(screen.getByLabelText("Username"), "Ada");

    expect(onChange).toHaveBeenCalledTimes(3);
  });
});

describe("NavbarItem", () => {
  it("renders its label", () => {
    render(<NavbarItem label="My List" />);

    expect(screen.getByText("My List")).toBeInTheDocument();
  });
});

describe("MobileMenu", () => {
  it("renders nothing while hidden", () => {
    const { container } = render(<MobileMenu />);

    expect(container).toBeEmptyDOMElement();
  });

  it("lists every browse destination when visible", () => {
    render(<MobileMenu visible />);

    for (const label of [
      "Home",
      "Series",
      "Films",
      "New & Popular",
      "My List",
      "Browse by Languages",
    ]) {
      expect(screen.getByText(label)).toBeInTheDocument();
    }
  });
});

describe("Loading", () => {
  it("announces a default message", () => {
    render(<Loading />);

    expect(screen.getByRole("status")).toHaveAttribute("aria-live", "polite");
    expect(screen.getByText("Please wait")).toBeInTheDocument();
    expect(screen.getByText("Please wait…")).toBeInTheDocument();
  });

  it("announces a caller-supplied message", () => {
    render(<Loading message="Signing in" />);

    expect(screen.getByText("Signing in")).toBeInTheDocument();
    expect(screen.getByText("Signing in…")).toBeInTheDocument();
  });
});

describe("PlayButton", () => {
  it("navigates to the watch page for its movie", async () => {
    render(<PlayButton movieId="m1" />);

    await userEvent.click(screen.getByRole("button", { name: /play/i }));

    expect(push).toHaveBeenCalledWith("/watch/m1");
  });
});
