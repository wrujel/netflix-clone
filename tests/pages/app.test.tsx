import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import MyApp from "../../pages/_app";

describe("MyApp", () => {
  it("renders the active page with its props", () => {
    const Page = ({ title }: { title: string }) => <h1>{title}</h1>;

    render(
      <MyApp
        Component={Page as never}
        pageProps={{ title: "Netflix" }}
        router={{} as never}
      />
    );

    expect(screen.getByRole("heading", { name: "Netflix" })).toBeInTheDocument();
  });
});
