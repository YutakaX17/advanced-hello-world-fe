import { render, screen } from "@testing-library/react";
import { expect, test, vi } from "vitest";

import { App } from "./App";

vi.mock("sweetalert2", () => ({ default: { fire: vi.fn() } }));

test("renders the assembled application", () => {
  render(<App />);
  expect(
    screen.getByRole("heading", { name: "Hello World" }),
  ).toBeInTheDocument();
  expect(screen.getByLabelText("Text")).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Save" })).toBeInTheDocument();
});
