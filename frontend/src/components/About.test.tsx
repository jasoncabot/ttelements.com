import { render, screen } from "@testing-library/react";
import About from "./About";

test("Renders About", () => {
  render(<About />);
  const heading = screen.getByText("About");
  expect(heading).toBeInTheDocument();
});
