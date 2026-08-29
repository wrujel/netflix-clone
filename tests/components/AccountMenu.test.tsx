import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import AccountMenu from "../../components/AccountMenu";

const { signOut, useCurrentUser } = vi.hoisted(() => ({
  signOut: vi.fn(),
  useCurrentUser: vi.fn(),
}));

vi.mock("next-auth/react", () => ({ signOut }));
vi.mock("../../hooks/useCurrentUser", () => ({ default: useCurrentUser }));

describe("AccountMenu", () => {
  beforeEach(() => {
    useCurrentUser.mockReturnValue({ data: { name: "Ada" } });
  });

  it("renders nothing while hidden", () => {
    const { container } = render(<AccountMenu />);

    expect(container).toBeEmptyDOMElement();
  });

  it("shows the signed-in profile name", () => {
    render(<AccountMenu visible />);

    expect(screen.getByText("Ada")).toBeInTheDocument();
    expect(screen.getByAltText("Avatar")).toBeInTheDocument();
  });

  it("tolerates a user that has not loaded yet", () => {
    useCurrentUser.mockReturnValue({ data: undefined });

    render(<AccountMenu visible />);

    expect(screen.getByText("Sign out of Netflix")).toBeInTheDocument();
  });

  it("signs the user out", async () => {
    render(<AccountMenu visible />);

    await userEvent.click(screen.getByText("Sign out of Netflix"));

    expect(signOut).toHaveBeenCalledOnce();
  });
});
