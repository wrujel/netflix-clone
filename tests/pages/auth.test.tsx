import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import Auth from "../../pages/auth";
import { withSwallowedRejection } from "../helpers/rejections";

const { post, signIn, on, off } = vi.hoisted(() => ({
  post: vi.fn(),
  signIn: vi.fn(),
  on: vi.fn(),
  off: vi.fn(),
}));

vi.mock("axios", () => ({ default: { post } }));
vi.mock("next-auth/react", () => ({ signIn }));
vi.mock("next/router", () => ({
  useRouter: () => ({ events: { on, off } }),
}));

const CREDENTIALS = { email: "viewer@example.com", password: "secret" };

const fillCredentials = async () => {
  await userEvent.type(screen.getByLabelText("Email"), CREDENTIALS.email);
  await userEvent.type(screen.getByLabelText("Password"), CREDENTIALS.password);
};

const switchToRegister = () =>
  userEvent.click(screen.getByText("Create an account"));

describe("Auth page", () => {
  beforeEach(() => {
    for (const mock of [post, signIn, on, off]) mock.mockReset();
    signIn.mockResolvedValue(undefined);
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  describe("variants", () => {
    it("starts on the sign-in form", () => {
      render(<Auth />);

      expect(
        screen.getByRole("heading", { name: "Sign In" }),
      ).toBeInTheDocument();
      expect(screen.queryByLabelText("Username")).not.toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Login" })).toBeInTheDocument();
      expect(screen.getByText("First time using Netflix?")).toBeInTheDocument();
    });

    it("switches to the register form and back", async () => {
      render(<Auth />);

      await switchToRegister();
      expect(
        screen.getByRole("heading", { name: "Register" }),
      ).toBeInTheDocument();
      expect(screen.getByLabelText("Username")).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: "Sign up" }),
      ).toBeInTheDocument();
      expect(screen.getByText("Already have an account?")).toBeInTheDocument();

      await userEvent.click(screen.getByText("Login", { selector: "span" }));
      expect(
        screen.getByRole("heading", { name: "Sign In" }),
      ).toBeInTheDocument();
    });
  });

  describe("signing in", () => {
    it("submits the typed credentials and keeps the overlay up", async () => {
      render(<Auth />);
      await fillCredentials();

      await userEvent.click(screen.getByRole("button", { name: "Login" }));

      expect(signIn).toHaveBeenCalledWith("credentials", {
        ...CREDENTIALS,
        callbackUrl: "/profiles",
      });
      expect(screen.getByRole("status")).toBeInTheDocument();
      expect(screen.getAllByText(/Signing in/)).not.toHaveLength(0);
      expect(
        screen.getByRole("button", { name: "Signing in..." }),
      ).toBeInTheDocument();
    });

    it("clears the overlay when sign-in fails", async () => {
      signIn.mockRejectedValueOnce(new Error("bad credentials"));
      render(<Auth />);
      await fillCredentials();

      await withSwallowedRejection(() =>
        userEvent.click(screen.getByRole("button", { name: "Login" })),
      );

      expect(screen.queryByRole("status")).not.toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Login" })).toBeEnabled();
    });
  });

  describe("registering", () => {
    it("creates the account, then signs the new user in", async () => {
      post.mockResolvedValueOnce({ data: {} });
      render(<Auth />);
      await switchToRegister();
      await userEvent.type(screen.getByLabelText("Username"), "Ada");
      await fillCredentials();

      await userEvent.click(screen.getByRole("button", { name: "Sign up" }));

      expect(post).toHaveBeenCalledWith("/api/register", {
        ...CREDENTIALS,
        name: "Ada",
      });
      expect(signIn).toHaveBeenCalledWith("credentials", {
        ...CREDENTIALS,
        callbackUrl: "/profiles",
      });
    });

    it("shows a register-flavoured overlay while the request is in flight", async () => {
      post.mockReturnValueOnce(new Promise(() => {}));
      render(<Auth />);
      await switchToRegister();

      await userEvent.click(screen.getByRole("button", { name: "Sign up" }));

      expect(await screen.findByText("Processing…")).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: "Creating account..." }),
      ).toBeInTheDocument();
    });

    it("clears the overlay when registration fails", async () => {
      post.mockRejectedValueOnce(new Error("email taken"));
      render(<Auth />);
      await switchToRegister();

      await withSwallowedRejection(() =>
        userEvent.click(screen.getByRole("button", { name: "Sign up" })),
      );

      expect(screen.queryByRole("status")).not.toBeInTheDocument();
      expect(signIn).not.toHaveBeenCalled();
    });
  });

  describe("guest access", () => {
    it("signs in with the credentials the guest endpoint hands back", async () => {
      post.mockResolvedValueOnce({
        data: { email: "guest@example.com", password: "temp-pass" },
      });
      render(<Auth />);

      await userEvent.click(
        screen.getByRole("button", { name: "Continue as Guest" }),
      );

      expect(post).toHaveBeenCalledWith("/api/guest");
      expect(signIn).toHaveBeenCalledWith("credentials", {
        email: "guest@example.com",
        password: "temp-pass",
        callbackUrl: "/profiles",
      });
    });

    it("shows its own button label while the guest request is in flight", async () => {
      post.mockReturnValueOnce(new Promise(() => {}));
      render(<Auth />);

      await userEvent.click(
        screen.getByRole("button", { name: "Continue as Guest" }),
      );

      expect(
        await screen.findByRole("button", { name: "Continuing as Guest..." }),
      ).toBeInTheDocument();
    });

    it("recovers when the guest endpoint fails", async () => {
      const error = new Error("guest unavailable");
      post.mockRejectedValueOnce(error);
      render(<Auth />);

      await userEvent.click(
        screen.getByRole("button", { name: "Continue as Guest" }),
      );

      expect(console.error).toHaveBeenCalledWith(error);
      expect(signIn).not.toHaveBeenCalled();
      expect(screen.queryByRole("status")).not.toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: "Continue as Guest" }),
      ).toBeEnabled();
    });
  });

  describe("OAuth", () => {
    it.each([
      ["google-login", "google"],
      ["github-login", "github"],
    ])("starts the %s flow", async (id, provider) => {
      const { container } = render(<Auth />);

      await userEvent.click(container.querySelector("#" + id) as Element);

      expect(signIn).toHaveBeenCalledWith(provider, {
        callbackUrl: "/profiles",
      });
    });
  });

  describe("route changes", () => {
    it("clears a stale overlay once navigation settles", async () => {
      render(<Auth />);
      await fillCredentials();
      await userEvent.click(screen.getByRole("button", { name: "Login" }));
      expect(screen.getByRole("status")).toBeInTheDocument();

      const handler = on.mock.calls.find(
        ([event]) => event === "routeChangeComplete",
      )?.[1] as () => void;
      act(() => handler());

      expect(screen.queryByRole("status")).not.toBeInTheDocument();
    });

    it("unsubscribes on unmount", () => {
      const { unmount } = render(<Auth />);

      expect(on).toHaveBeenCalledTimes(2);
      unmount();

      expect(off).toHaveBeenCalledWith(
        "routeChangeComplete",
        expect.any(Function),
      );
      expect(off).toHaveBeenCalledWith(
        "routeChangeError",
        expect.any(Function),
      );
    });
  });
});
